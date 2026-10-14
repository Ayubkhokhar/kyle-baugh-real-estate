// scripts/batch-queue.js
// Autonomous, resilient background batch generator for Dallas Real Estate agent websites.
// Manages queues, time intervals, safe gaps, retries, and real-time status reporting.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { runAgentPipeline } from "./agent-pipeline.js";
import { getDiscoveredAgents, saveDiscoveredAgents, crawlCompassDallasDirectory } from "./agent-discovery.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

class BatchQueueManager {
  constructor() {
    this.isRunning = false;
    this.isPaused = false;
    this.isGenerating = false;
    this.targetCount = 20;
    this.completedToday = 0;
    this.failedCount = 0;
    this.intervalMinutes = 10;
    this.secondsRemaining = 0;
    this.currentAgent = null;
    this.history = [];
    this.logs = [];
    this.failedSlugs = new Set();
    this.countdownTimer = null;
    this.stepTimeout = null;

    this.addLog("Autonomous Batch Queue engine initialized. Ready to launch.");
  }

  addLog(msg) {
    const timestamp = new Date().toLocaleTimeString();
    const entry = `[${timestamp}] ${msg}`;
    this.logs.push(entry);
    if (this.logs.length > 200) this.logs.shift();
    console.log(`[BatchQueue] ${entry}`);
  }

  clearIntervals() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
    if (this.stepTimeout) {
      clearTimeout(this.stepTimeout);
      this.stepTimeout = null;
    }
  }

  getStatus() {
    const progressPercent = this.targetCount > 0
      ? Math.min(100, Math.round((this.completedToday / this.targetCount) * 100))
      : 0;

    let displayState = "idle";
    if (this.isGenerating) {
      displayState = "generating";
    } else if (this.isPaused) {
      displayState = "paused";
    } else if (this.isRunning && this.secondsRemaining > 0) {
      displayState = "cooling_down";
    } else if (this.isRunning) {
      displayState = "running";
    }

    return {
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      isGenerating: this.isGenerating,
      state: displayState,
      targetCount: this.targetCount,
      completedToday: this.completedToday,
      failedCount: this.failedCount,
      remainingCount: Math.max(0, this.targetCount - this.completedToday),
      intervalMinutes: this.intervalMinutes,
      secondsRemaining: this.secondsRemaining,
      currentAgent: this.currentAgent,
      progressPercent,
      history: this.history.slice(0, 50),
      logs: this.logs.slice(-60),
    };
  }

  start({ targetCount = 20, intervalMinutes = 10 }) {
    if (this.isRunning && this.isPaused) {
      return this.resume();
    }

    this.clearIntervals();
    this.targetCount = Math.max(1, parseInt(targetCount, 10) || 20);
    this.intervalMinutes = Math.max(1, parseFloat(intervalMinutes) || 10);
    this.isRunning = true;
    this.isPaused = false;
    this.isGenerating = false;
    this.completedToday = 0;
    this.failedCount = 0;
    this.secondsRemaining = 0;
    this.currentAgent = null;
    this.history = [];
    this.failedSlugs.clear();

    this.addLog(
      `🚀 Autonomous Batch Queue STARTED: Target is ${this.targetCount} websites today with a safe ${this.intervalMinutes}-minute gap between generations.`
    );

    // Immediately execute the first candidate
    this.executeNext();
    return this.getStatus();
  }

  pause() {
    if (!this.isRunning) return this.getStatus();
    this.isPaused = true;
    this.clearIntervals();
    this.addLog("⏸ Autonomous Batch Queue paused by user. Timer suspended.");
    return this.getStatus();
  }

  resume() {
    if (!this.isRunning) return this.start({});
    this.isPaused = false;
    this.addLog("▶ Autonomous Batch Queue resumed.");

    if (this.secondsRemaining > 0) {
      this.addLog(`Resuming safe cooldown: ${this.secondsRemaining}s remaining...`);
      this.startCooldown(this.secondsRemaining);
    } else if (!this.isGenerating) {
      this.executeNext();
    }
    return this.getStatus();
  }

  stop() {
    this.clearIntervals();
    this.isRunning = false;
    this.isPaused = false;
    this.isGenerating = false;
    this.secondsRemaining = 0;
    this.currentAgent = null;
    this.addLog("⏹ Autonomous Batch Queue stopped and reset.");
    return this.getStatus();
  }

  skipWait() {
    if (!this.isRunning) return this.getStatus();
    if (this.isGenerating) {
      this.addLog("⚠️ An agent is currently being built. Cannot skip right now.");
      return this.getStatus();
    }

    this.addLog("⏭ Skipping cooldown timer. Triggering next site generation immediately...");
    this.clearIntervals();
    this.secondsRemaining = 0;
    this.executeNext();
    return this.getStatus();
  }

  startCooldown(seconds) {
    this.clearIntervals();
    this.secondsRemaining = Math.max(1, Math.round(seconds));

    this.countdownTimer = setInterval(() => {
      if (!this.isRunning || this.isPaused) return;

      this.secondsRemaining--;
      if (this.secondsRemaining <= 0) {
        this.clearIntervals();
        this.secondsRemaining = 0;
        this.executeNext();
      }
    }, 1000);
  }

  getBuiltSlugs() {
    const resolverPath = path.join(rootDir, "src", "composables", "useAgentResolver.js");
    if (!fs.existsSync(resolverPath)) return new Set();
    const content = fs.readFileSync(resolverPath, "utf-8");
    const matches = [...content.matchAll(/id:\s*["']([^"']+)["']/g)].map((m) => m[1]);
    return new Set(matches);
  }

  async findNextCandidate() {
    const builtSlugs = this.getBuiltSlugs();
    let discovered = getDiscoveredAgents();

    // Filter available candidates
    let candidates = discovered.filter((a) => {
      if (!a.slug || !a.url) return false;
      if (builtSlugs.has(a.slug)) return false;
      if (a.status === "launched") return false;
      if (this.failedSlugs.has(a.slug)) return false;
      return true;
    });

    // If discovery pool is exhausted, crawl Compass Dallas directory automatically
    if (candidates.length === 0) {
      this.addLog("ℹ️ Discovery pool is low. Crawling Dallas enclaves for new agent prospects...");
      try {
        await crawlCompassDallasDirectory();
        discovered = getDiscoveredAgents();
        candidates = discovered.filter((a) => {
          if (!a.slug || !a.url) return false;
          if (builtSlugs.has(a.slug)) return false;
          if (a.status === "launched") return false;
          if (this.failedSlugs.has(a.slug)) return false;
          return true;
        });
      } catch (err) {
        this.addLog(`⚠️ Directory crawl failed: ${err.message}`);
      }
    }

    return candidates[0] || null;
  }

  async executeNext() {
    if (!this.isRunning || this.isPaused || this.isGenerating) return;

    // Check if daily target has been reached
    if (this.completedToday >= this.targetCount) {
      this.addLog(`🎉 TARGET REACHED: Successfully generated ${this.completedToday} of ${this.targetCount} websites today!`);
      this.stop();
      return;
    }

    const candidate = await this.findNextCandidate();
    if (!candidate) {
      this.addLog("⚠️ No unbuilt agent candidates available in discovery pool. Pausing queue.");
      this.pause();
      return;
    }

    this.isGenerating = true;
    this.currentAgent = {
      slug: candidate.slug,
      name: candidate.name,
      url: candidate.url,
      startedAt: new Date().toISOString(),
      step: "Scraping listings & portfolio assets",
    };

    const currentNumber = this.completedToday + 1;
    this.addLog(
      `🚀 [${currentNumber}/${this.targetCount}] Starting autonomous creation for ${candidate.name} (${candidate.slug})...`
    );

    try {
      const result = await runAgentPipeline({
        url: candidate.url,
        slug: candidate.slug,
        autoRegister: true,
        buildAndDeploy: true,
        sendEmail: false, // User requested manual click for emails
        logCallback: (msg) => {
          this.addLog(`[${candidate.slug}] ${msg}`);
          if (this.currentAgent) {
            this.currentAgent.step = msg;
          }
        },
      });

      // Mark launched in discovered-agents.json
      const allDiscovered = getDiscoveredAgents();
      const match = allDiscovered.find((d) => d.slug === candidate.slug || d.url === candidate.url);
      if (match) {
        match.status = "launched";
        match.liveUrl = result.liveUrl;
        saveDiscoveredAgents(allDiscovered);
      }

      this.completedToday++;
      this.history.unshift({
        slug: candidate.slug,
        name: candidate.name,
        status: "success",
        liveUrl: result.liveUrl,
        timestamp: new Date().toISOString(),
      });

      this.addLog(
        `✅ [${this.completedToday}/${this.targetCount}] Successfully created & deployed portal for ${candidate.name}! Live at: ${result.liveUrl}`
      );
    } catch (err) {
      this.failedCount++;
      this.failedSlugs.add(candidate.slug);

      const allDiscovered = getDiscoveredAgents();
      const match = allDiscovered.find((d) => d.slug === candidate.slug || d.url === candidate.url);
      if (match) {
        match.status = "failed";
        match.failReason = err.message;
        saveDiscoveredAgents(allDiscovered);
      }

      this.history.unshift({
        slug: candidate.slug,
        name: candidate.name,
        status: "failed",
        error: err.message,
        timestamp: new Date().toISOString(),
      });

      this.addLog(`❌ [Auto-Recovery] Pipeline failed for ${candidate.slug}: ${err.message}`);
      this.addLog(`🔄 Auto-Recovery active: Continuing automatically to next prospect after 20-second safety cooldown...`);

      this.isGenerating = false;
      this.currentAgent = null;

      // On failure, wait brief 20-second cooldown and automatically continue
      if (this.isRunning && !this.isPaused && this.completedToday < this.targetCount) {
        this.startCooldown(20);
      }
      return;
    }

    this.isGenerating = false;
    this.currentAgent = null;

    // Check if target reached after this success
    if (this.completedToday >= this.targetCount) {
      this.addLog(`🎉 TARGET REACHED: Successfully generated ${this.completedToday} of ${this.targetCount} websites today!`);
      this.stop();
      return;
    }

    // Normal safe cooldown gap (e.g. 10 minutes)
    if (this.isRunning && !this.isPaused) {
      const delaySeconds = Math.max(1, Math.round(this.intervalMinutes * 60));
      this.addLog(
        `⏳ Safe gap cooldown: Waiting ${this.intervalMinutes} minutes before starting next site (${this.completedToday}/${this.targetCount})...`
      );
      this.startCooldown(delaySeconds);
    }
  }
}

export const batchQueue = new BatchQueueManager();
