import { ref, computed, watch } from "vue";
import { defaultProperties } from "../data/seedProperties";
import { compassProperties as kyleProperties, compassSyncMeta as kyleCompassMeta } from "../data/compassProperties";
import { compassProperties as amyProperties } from "../data/agents/amyProperties";
import { compassProperties as kyleBaughDallasProperties } from "../data/agents/kyleBaughDallasProperties";
import { compassProperties as jolieBarriosProperties } from "../data/agents/jolieBarriosProperties";
import { compassProperties as annAndrewsProperties } from "../data/agents/annAndrewsProperties";
import { compassProperties as chelseaAdriaanseProperties } from "../data/agents/chelseaAdriaanseProperties";
import { compassProperties as amyDetwilerProperties } from "../data/agents/amyDetwilerProperties";
import { compassProperties as jillDerkachProperties } from "../data/agents/jillDerkachProperties";
import { compassProperties as christineDanuserProperties } from "../data/agents/christineDanuserProperties";
import { compassProperties as bradfordCoffmanProperties } from "../data/agents/bradfordCoffmanProperties";
import { compassProperties as billChurchillProperties } from "../data/agents/billChurchillProperties";
import { compassProperties as katieChuProperties } from "../data/agents/katieChuProperties";
import { compassProperties as kelleyChristianProperties } from "../data/agents/kelleyChristianProperties";
import { compassProperties as stevieChaddickProperties } from "../data/agents/stevieChaddickProperties";
import { compassProperties as giannaCerulloProperties } from "../data/agents/giannaCerulloProperties";
import { compassProperties as centreLivingHomesTeamProperties } from "../data/agents/centreLivingHomesTeamProperties";
import { compassProperties as markCainProperties } from "../data/agents/markCainProperties";
import { compassProperties as neilBroussardProperties } from "../data/agents/neilBroussardProperties";
import { compassProperties as adeleBroughtonProperties } from "../data/agents/adeleBroughtonProperties";
import { compassProperties as jimBroscheProperties } from "../data/agents/jimBroscheProperties";
import { compassProperties as callieBrickmanProperties } from "../data/agents/callieBrickmanProperties";
import { compassProperties as gaylBraymerProperties } from "../data/agents/gaylBraymerProperties";
import { compassProperties as gretchenBraschProperties } from "../data/agents/gretchenBraschProperties";
import { compassProperties as kelseyBondProperties } from "../data/agents/kelseyBondProperties";
import { compassProperties as hollyBockProperties } from "../data/agents/hollyBockProperties";
import { compassProperties as shannonBlountProperties } from "../data/agents/shannonBlountProperties";
import { compassProperties as chrisBlackmanProperties } from "../data/agents/chrisBlackmanProperties";
import { compassProperties as christyBerryProperties } from "../data/agents/christyBerryProperties";
import { compassProperties as thomasBellingerProperties } from "../data/agents/thomasBellingerProperties";
import { compassProperties as erinBallardProperties } from "../data/agents/erinBallardProperties";
import { compassProperties as jacquelynAustinProperties } from "../data/agents/jacquelynAustinProperties";
import { compassProperties as megBeairdProperties } from "../data/agents/megBeairdProperties";
import { compassProperties as jonathanRosenProperties } from "../data/agents/jonathanRosenProperties";
import { compassProperties as katieAspenProperties } from "../data/agents/katieAspenProperties";
import { compassProperties as micheleBaladyBeachProperties } from "../data/agents/micheleBaladyBeachProperties";
import { compassProperties as katyAnnettProperties } from "../data/agents/katyAnnettProperties";
import { compassProperties as annaleeAstonProperties } from "../data/agents/annaleeAstonProperties";
import { compassProperties as brookeAltemoreProperties } from "../data/agents/brookeAltemoreProperties";
import { compassProperties as jamieAdamsProperties } from "../data/agents/jamieAdamsProperties";
import { compassProperties as erikaOrbinProperties } from "../data/agents/erikaOrbinProperties";
import { compassProperties as meganJohnsonProperties } from "../data/agents/meganJohnsonProperties";
import { compassProperties as christineLeiteProperties } from "../data/agents/christineLeiteProperties";
import { compassProperties as lizChalfantProperties } from "../data/agents/lizChalfantProperties";
import { compassProperties as carsonProperties } from "../data/agents/carsonProperties";
import { compassProperties as alexProperties } from "../data/agents/alexProperties";
import { compassProperties as summerProperties } from "../data/agents/summerProperties";
import { compassProperties as jdProperties } from "../data/agents/jdProperties";
import { useAgentResolver } from "./useAgentResolver";

const amyCompassMeta = {
  lastSynced: "2026-09-22T07:40:16.643Z",
  totalProperties: 45,
  activeCount: 1,
  soldCount: 44,
  leasedCount: 0,
  imagesDownloaded: 45,
  agentUrl: "https://www.compass.com/agents/amy-detwiler/",
  syncedAgent: "Amy Detwiler",
};

const kyleBaughDallasCompassMeta = {
  lastSynced: "2026-10-16T12:08:15.103Z",
  totalProperties: 33,
  activeCount: 1,
  soldCount: 20,
  leasedCount: 0,
  imagesDownloaded: 41,
  agentUrl: "https://www.compass.com/agents/kyle-baugh-dallas/",
  syncedAgent: "Kyle Baugh",
};

const jolieBarriosCompassMeta = {
  lastSynced: "2026-10-16T11:57:08.829Z",
  totalProperties: 39,
  activeCount: 1,
  soldCount: 20,
  leasedCount: 0,
  imagesDownloaded: 47,
  agentUrl: "https://www.compass.com/agents/jolie-barrios/",
  syncedAgent: "Jolie Barrios",
};

const annAndrewsCompassMeta = {
  lastSynced: "2026-10-16T11:46:16.683Z",
  totalProperties: 37,
  activeCount: 1,
  soldCount: 21,
  leasedCount: 0,
  imagesDownloaded: 45,
  agentUrl: "https://www.compass.com/agents/ann-andrews/",
  syncedAgent: "Ann Andrews",
};

const chelseaAdriaanseCompassMeta = {
  lastSynced: "2026-10-16T11:35:25.071Z",
  totalProperties: 35,
  activeCount: 1,
  soldCount: 19,
  leasedCount: 0,
  imagesDownloaded: 43,
  agentUrl: "https://www.compass.com/agents/chelsea-adriaanse/",
  syncedAgent: "Chelsea Adriaanse",
};

const amyDetwilerCompassMeta = {
  lastSynced: "2026-10-16T11:00:10.178Z",
  totalProperties: 46,
  activeCount: 1,
  soldCount: 31,
  leasedCount: 0,
  imagesDownloaded: 54,
  agentUrl: "https://www.compass.com/agents/amy-detwiler/",
  syncedAgent: "Amy Detwiler",
};

const jillDerkachCompassMeta = {
  lastSynced: "2026-10-16T10:49:12.133Z",
  totalProperties: 17,
  activeCount: 0,
  soldCount: 10,
  leasedCount: 0,
  imagesDownloaded: 25,
  agentUrl: "https://www.compass.com/agents/jill-derkach/",
  syncedAgent: "Jill Derkach",
};

const christineDanuserCompassMeta = {
  lastSynced: "2026-10-16T10:37:49.234Z",
  totalProperties: 38,
  activeCount: 1,
  soldCount: 19,
  leasedCount: 0,
  imagesDownloaded: 46,
  agentUrl: "https://www.compass.com/agents/christine-danuser/",
  syncedAgent: "Christine Danuser",
};

const bradfordCoffmanCompassMeta = {
  lastSynced: "2026-10-15T05:40:37.641Z",
  totalProperties: 28,
  activeCount: 1,
  soldCount: 20,
  leasedCount: 0,
  imagesDownloaded: 36,
  agentUrl: "https://www.compass.com/agents/bradford-coffman/",
  syncedAgent: "Bradford Coffman",
};

const billChurchillCompassMeta = {
  lastSynced: "2026-10-15T05:28:27.668Z",
  totalProperties: 36,
  activeCount: 1,
  soldCount: 21,
  leasedCount: 0,
  imagesDownloaded: 44,
  agentUrl: "https://www.compass.com/agents/bill-churchill/",
  syncedAgent: "Bill Churchill",
};

const katieChuCompassMeta = {
  lastSynced: "2026-10-15T05:13:31.293Z",
  totalProperties: 27,
  activeCount: 0,
  soldCount: 18,
  leasedCount: 0,
  imagesDownloaded: 35,
  agentUrl: "https://www.compass.com/agents/katie-chu/",
  syncedAgent: "Katie Chu",
};

const kelleyChristianCompassMeta = {
  lastSynced: "2026-10-15T04:44:34.564Z",
  totalProperties: 25,
  activeCount: 1,
  soldCount: 21,
  leasedCount: 0,
  imagesDownloaded: 33,
  agentUrl: "https://www.compass.com/agents/kelley-christian/",
  syncedAgent: "Kelley Christian",
};

const stevieChaddickCompassMeta = {
  lastSynced: "2026-10-14T20:02:34.201Z",
  totalProperties: 21,
  activeCount: 0,
  soldCount: 18,
  leasedCount: 0,
  imagesDownloaded: 29,
  agentUrl: "https://www.compass.com/agents/stevie-chaddick/",
  syncedAgent: "Stevie Chaddick",
};

const giannaCerulloCompassMeta = {
  lastSynced: "2026-10-14T19:51:13.541Z",
  totalProperties: 38,
  activeCount: 1,
  soldCount: 21,
  leasedCount: 0,
  imagesDownloaded: 46,
  agentUrl: "https://www.compass.com/agents/gianna-cerullo/",
  syncedAgent: "Gianna Cerullo",
};

const centreLivingHomesTeamCompassMeta = {
  lastSynced: "2026-10-14T19:40:22.941Z",
  totalProperties: 20,
  activeCount: 0,
  soldCount: 18,
  leasedCount: 0,
  imagesDownloaded: 28,
  agentUrl: "https://www.compass.com/agents/centre-living-homes-team/",
  syncedAgent: "Centre Living Homes Team",
};

const markCainCompassMeta = {
  lastSynced: "2026-10-14T19:29:47.685Z",
  totalProperties: 21,
  activeCount: 0,
  soldCount: 18,
  leasedCount: 0,
  imagesDownloaded: 29,
  agentUrl: "https://www.compass.com/agents/mark-cain/",
  syncedAgent: "Mark Cain",
};

const neilBroussardCompassMeta = {
  lastSynced: "2026-10-14T18:55:17.328Z",
  totalProperties: 21,
  activeCount: 1,
  soldCount: 18,
  leasedCount: 0,
  imagesDownloaded: 29,
  agentUrl: "https://www.compass.com/agents/neil-broussard/",
  syncedAgent: "Neil Broussard",
};

const adeleBroughtonCompassMeta = {
  lastSynced: "2026-10-14T18:44:22.575Z",
  totalProperties: 19,
  activeCount: 0,
  soldCount: 18,
  leasedCount: 0,
  imagesDownloaded: 27,
  agentUrl: "https://www.compass.com/agents/adele-broughton/",
  syncedAgent: "Adele Broughton",
};

const jimBroscheCompassMeta = {
  lastSynced: "2026-10-14T18:33:25.840Z",
  totalProperties: 23,
  activeCount: 1,
  soldCount: 22,
  leasedCount: 0,
  imagesDownloaded: 31,
  agentUrl: "https://www.compass.com/agents/jim-brosche/",
  syncedAgent: "Jim Brosche",
};

const callieBrickmanCompassMeta = {
  lastSynced: "2026-10-14T18:20:15.844Z",
  totalProperties: 20,
  activeCount: 0,
  soldCount: 18,
  leasedCount: 0,
  imagesDownloaded: 28,
  agentUrl: "https://www.compass.com/agents/callie-brickman/",
  syncedAgent: "Callie Brickman",
};

const gaylBraymerCompassMeta = {
  lastSynced: "2026-10-14T18:04:38.478Z",
  totalProperties: 21,
  activeCount: 1,
  soldCount: 18,
  leasedCount: 0,
  imagesDownloaded: 29,
  agentUrl: "https://www.compass.com/agents/gayl-braymer/",
  syncedAgent: "Gayl Braymer",
};

const gretchenBraschCompassMeta = {
  lastSynced: "2026-10-14T17:53:32.549Z",
  totalProperties: 22,
  activeCount: 1,
  soldCount: 18,
  leasedCount: 0,
  imagesDownloaded: 30,
  agentUrl: "https://www.compass.com/agents/gretchen-brasch/",
  syncedAgent: "Gretchen Brasch",
};

const kelseyBondCompassMeta = {
  lastSynced: "2026-10-14T17:42:28.796Z",
  totalProperties: 39,
  activeCount: 1,
  soldCount: 21,
  leasedCount: 0,
  imagesDownloaded: 47,
  agentUrl: "https://www.compass.com/agents/kelsey-bond/",
  syncedAgent: "Kelsey Bond",
};

const hollyBockCompassMeta = {
  lastSynced: "2026-10-14T17:31:06.442Z",
  totalProperties: 27,
  activeCount: 1,
  soldCount: 18,
  leasedCount: 0,
  imagesDownloaded: 35,
  agentUrl: "https://www.compass.com/agents/holly-bock/",
  syncedAgent: "Holly Bock",
};

const shannonBlountCompassMeta = {
  lastSynced: "2026-10-14T17:18:10.969Z",
  totalProperties: 24,
  activeCount: 0,
  soldCount: 19,
  leasedCount: 0,
  imagesDownloaded: 32,
  agentUrl: "https://www.compass.com/agents/shannon-blount/",
  syncedAgent: "Shannon Blount",
};

const chrisBlackmanCompassMeta = {
  lastSynced: "2026-10-14T13:19:31.105Z",
  totalProperties: 31,
  activeCount: 1,
  soldCount: 19,
  leasedCount: 0,
  imagesDownloaded: 39,
  agentUrl: "https://www.compass.com/agents/chris-blackman/",
  syncedAgent: "Chris Blackman",
};

const christyBerryCompassMeta = {
  lastSynced: "2026-10-14T12:58:54.138Z",
  totalProperties: 39,
  activeCount: 1,
  soldCount: 21,
  leasedCount: 0,
  imagesDownloaded: 47,
  agentUrl: "https://www.compass.com/agents/christy-berry/",
  syncedAgent: "Christy Berry",
};

const thomasBellingerCompassMeta = {
  lastSynced: "2026-10-14T12:47:52.158Z",
  totalProperties: 39,
  activeCount: 1,
  soldCount: 20,
  leasedCount: 0,
  imagesDownloaded: 47,
  agentUrl: "https://www.compass.com/agents/thomas-bellinger/",
  syncedAgent: "Thomas Bellinger",
};

const erinBallardCompassMeta = {
  lastSynced: "2026-10-14T12:34:19.044Z",
  totalProperties: 25,
  activeCount: 0,
  soldCount: 18,
  leasedCount: 0,
  imagesDownloaded: 33,
  agentUrl: "https://www.compass.com/agents/erin-ballard/",
  syncedAgent: "Erin Ballard",
};

const jacquelynAustinCompassMeta = {
  lastSynced: "2026-10-13T12:10:51.230Z",
  totalProperties: 39,
  activeCount: 1,
  soldCount: 21,
  leasedCount: 0,
  imagesDownloaded: 47,
  agentUrl: "https://www.compass.com/agents/jacquelyn-austin/",
  syncedAgent: "Jacquelyn Austin",
};

const megBeairdCompassMeta = {
  lastSynced: "2026-10-09T13:35:59.292Z",
  totalProperties: 20,
  activeCount: 1,
  soldCount: 19,
  leasedCount: 0,
  imagesDownloaded: 28,
  agentUrl: "https://www.compass.com/agents/meg-beaird/",
  syncedAgent: "Meg Beaird",
};

const jonathanRosenCompassMeta = {
  lastSynced: "2026-10-09T13:08:50.580Z",
  totalProperties: 38,
  activeCount: 1,
  soldCount: 22,
  leasedCount: 0,
  imagesDownloaded: 46,
  agentUrl: "https://www.compass.com/agents/jonathan-rosen/",
  syncedAgent: "Jonathan Rosen",
};

const katieAspenCompassMeta = {
  lastSynced: "2026-10-08T13:16:42.879Z",
  totalProperties: 40,
  activeCount: 1,
  soldCount: 21,
  leasedCount: 0,
  imagesDownloaded: 48,
  agentUrl: "https://www.compass.com/agents/katie-aspen/",
  syncedAgent: "Katie Aspen",
};

const micheleBaladyBeachCompassMeta = {
  lastSynced: "2026-10-08T08:52:02.778Z",
  totalProperties: 28,
  activeCount: 1,
  soldCount: 22,
  leasedCount: 0,
  imagesDownloaded: 36,
  agentUrl: "https://www.compass.com/agents/michele-balady-beach/",
  syncedAgent: "Michele Balady Beach",
};

const katyAnnettCompassMeta = {
  lastSynced: "2026-10-01T12:13:16.359Z",
  totalProperties: 23,
  activeCount: 1,
  soldCount: 16,
  leasedCount: 0,
  imagesDownloaded: 31,
  agentUrl: "https://www.compass.com/agents/katy-annett/",
  syncedAgent: "Katy Annett",
};

const annaleeAstonCompassMeta = {
  lastSynced: "2026-09-30T12:59:33.801Z",
  totalProperties: 31,
  activeCount: 1,
  soldCount: 19,
  leasedCount: 0,
  imagesDownloaded: 39,
  agentUrl: "https://www.compass.com/agents/annalee-aston/",
  syncedAgent: "Annalee Aston",
};

const brookeAltemoreCompassMeta = {
  lastSynced: "2026-09-29T07:11:26.619Z",
  totalProperties: 36,
  activeCount: 1,
  soldCount: 17,
  leasedCount: 0,
  imagesDownloaded: 44,
  agentUrl: "https://www.compass.com/agents/brooke-altemore/",
  syncedAgent: "Brooke Altemore",
};

const jamieAdamsCompassMeta = {
  lastSynced: "2026-09-28T12:49:21.115Z",
  totalProperties: 34,
  activeCount: 1,
  soldCount: 26,
  leasedCount: 0,
  imagesDownloaded: 42,
  agentUrl: "https://www.compass.com/agents/jamie-adams/",
  syncedAgent: "Jamie Adams",
};

const erikaOrbinCompassMeta = {
  lastSynced: "2026-09-28T08:26:58.669Z",
  totalProperties: 20,
  activeCount: 0,
  soldCount: 18,
  leasedCount: 0,
  imagesDownloaded: 28,
  agentUrl: "https://www.compass.com/agents/erika-orbin/",
  syncedAgent: "Erika Orbin",
};

const meganJohnsonCompassMeta = {
  lastSynced: "2026-09-28T07:25:05.188Z",
  totalProperties: 14,
  activeCount: 0,
  soldCount: 11,
  leasedCount: 0,
  imagesDownloaded: 22,
  agentUrl: "https://www.compass.com/agents/megan-johnson/",
  syncedAgent: "Megan Johnson",
};

const christineLeiteCompassMeta = {
  lastSynced: "2026-09-26T08:30:03.350Z",
  totalProperties: 17,
  activeCount: 0,
  soldCount: 14,
  leasedCount: 0,
  imagesDownloaded: 25,
  agentUrl: "https://www.compass.com/agents/christine-leite/",
  syncedAgent: "Christine Leite",
};

const lizChalfantCompassMeta = {
  lastSynced: "2026-09-26T05:03:51.558Z",
  totalProperties: 22,
  activeCount: 1,
  soldCount: 18,
  leasedCount: 0,
  imagesDownloaded: 30,
  agentUrl: "https://www.compass.com/agents/liz-chalfant/",
  syncedAgent: "Liz Chalfant",
};

const carsonCompassMeta = {
  lastSynced: "2026-09-23T08:19:27.210Z",
  totalProperties: 37,
  activeCount: 1,
  soldCount: 36,
  leasedCount: 0,
  imagesDownloaded: 45,
  agentUrl: "https://www.compass.com/agents/carson-hill/",
  syncedAgent: "Carson Hill",
};

const alexCompassMeta = {
  lastSynced: "2026-09-25T08:58:04.000Z",
  totalProperties: 38,
  activeCount: 1,
  soldCount: 37,
  leasedCount: 0,
  imagesDownloaded: 46,
  agentUrl: "https://www.compass.com/agents/alex-marler/",
  syncedAgent: "Alex Marler",
};

const summerCompassMeta = {
  lastSynced: "2026-09-25T12:02:10.000Z",
  totalProperties: 42,
  activeCount: 2,
  soldCount: 40,
  leasedCount: 0,
  imagesDownloaded: 50,
  agentUrl: "https://www.compass.com/agents/summer-graham/",
  syncedAgent: "Summer Graham",
};

const jdCompassMeta = {
  lastSynced: "2026-09-25T14:35:35.396Z",
  totalProperties: 37,
  activeCount: 1,
  soldCount: 36,
  leasedCount: 0,
  imagesDownloaded: 45,
  agentUrl: "https://www.compass.com/agents/jd-gonzales/",
  syncedAgent: "JD Gonzales",
};

function getAgentStorageKey(agentId) {
  return "properties_" + (agentId || "kyle") + "_v2";
}

function getCompassMetaKey(agentId) {
  return "compass_meta_" + (agentId || "kyle") + "_v2";
}

function mergeProperties(existingList, incomingCompassList) {
  const merged = [...existingList];
  for (const cProp of incomingCompassList) {
    const existingIdx = merged.findIndex(
      (p) => String(p.id) === String(cProp.id) ||
             (p.title && cProp.title && p.title.toLowerCase().trim() === cProp.title.toLowerCase().trim())
    );
    if (existingIdx === -1) {
      merged.push(cProp);
    } else {
      // If the existing property is 2007 Euclid Avenue with placeholder image, upgrade to Compass real images
      if (merged[existingIdx].id === "2007-euclid-ave" && cProp.gallery && cProp.gallery.length > 1) {
        merged[existingIdx].heroImage = cProp.heroImage;
        merged[existingIdx].gallery = cProp.gallery;
        merged[existingIdx].isCompassListing = true;
        merged[existingIdx].originalCompassUrl = cProp.originalCompassUrl;
      }
    }
  }
  return merged;
}

function getInitialListForAgent(agentId) {
  if (agentId === "kyle-baugh-dallas") {
    return kyleBaughDallasProperties;
  }

  if (agentId === "jolie-barrios") {
    return jolieBarriosProperties;
  }

  if (agentId === "ann-andrews") {
    return annAndrewsProperties;
  }

  if (agentId === "chelsea-adriaanse") {
    return chelseaAdriaanseProperties;
  }

  if (agentId === "amy-detwiler") {
    return amyDetwilerProperties;
  }

  if (agentId === "jill-derkach") {
    return jillDerkachProperties;
  }

  if (agentId === "christine-danuser") {
    return christineDanuserProperties;
  }

  if (agentId === "bradford-coffman") {
    return bradfordCoffmanProperties;
  }

  if (agentId === "bill-churchill") {
    return billChurchillProperties;
  }

  if (agentId === "katie-chu") {
    return katieChuProperties;
  }

  if (agentId === "kelley-christian") {
    return kelleyChristianProperties;
  }

  if (agentId === "stevie-chaddick") {
    return stevieChaddickProperties;
  }

  if (agentId === "gianna-cerullo") {
    return giannaCerulloProperties;
  }

  if (agentId === "centre-living-homes-team") {
    return centreLivingHomesTeamProperties;
  }

  if (agentId === "mark-cain") {
    return markCainProperties;
  }

  if (agentId === "neil-broussard") {
    return neilBroussardProperties;
  }

  if (agentId === "adele-broughton") {
    return adeleBroughtonProperties;
  }

  if (agentId === "jim-brosche") {
    return jimBroscheProperties;
  }

  if (agentId === "callie-brickman") {
    return callieBrickmanProperties;
  }

  if (agentId === "gayl-braymer") {
    return gaylBraymerProperties;
  }

  if (agentId === "gretchen-brasch") {
    return gretchenBraschProperties;
  }

  if (agentId === "kelsey-bond") {
    return kelseyBondProperties;
  }

  if (agentId === "holly-bock") {
    return hollyBockProperties;
  }

  if (agentId === "shannon-blount") {
    return shannonBlountProperties;
  }

  if (agentId === "chris-blackman") {
    return chrisBlackmanProperties;
  }

  if (agentId === "christy-berry") {
    return christyBerryProperties;
  }

  if (agentId === "thomas-bellinger") {
    return thomasBellingerProperties;
  }

  if (agentId === "erin-ballard") {
    return erinBallardProperties;
  }

  if (agentId === "jacquelyn-austin") {
    return jacquelynAustinProperties;
  }

  if (agentId === "meg-beaird") {
    return megBeairdProperties;
  }

  if (agentId === "jonathan-rosen") {
    return jonathanRosenProperties;
  }

  if (agentId === "katie-aspen") {
    return katieAspenProperties;
  }

  if (agentId === "michele-balady-beach") {
    return micheleBaladyBeachProperties;
  }

  if (agentId === "katy-annett") {
    return katyAnnettProperties;
  }

  if (agentId === "annalee-aston") {
    return annaleeAstonProperties;
  }

  if (agentId === "brooke-altemore") {
    return brookeAltemoreProperties;
  }

  if (agentId === "jamie-adams") {
    return jamieAdamsProperties;
  }

  if (agentId === "erika-orbin") {
    return erikaOrbinProperties;
  }

  if (agentId === "megan-johnson") {
    return meganJohnsonProperties;
  }

  if (agentId === "christine-leite") {
    return christineLeiteProperties;
  }

  if (agentId === "liz-chalfant") {
    return lizChalfantProperties;
  }

  if (agentId === "amy") {
    return amyProperties;
  }
  if (agentId === "carson") {
    return carsonProperties;
  }
  if (agentId === "alex") {
    return alexProperties;
  }
  if (agentId === "summer") {
    return summerProperties;
  }
  if (agentId === "jd") {
    return jdProperties;
  }
  return kyleProperties.length > 0 ? kyleProperties : mergeProperties(defaultProperties, kyleProperties);
}

function getInitialMetaForAgent(agentId) {
  if (agentId === "kyle-baugh-dallas") {
    return kyleBaughDallasCompassMeta;
  }

  if (agentId === "jolie-barrios") {
    return jolieBarriosCompassMeta;
  }

  if (agentId === "ann-andrews") {
    return annAndrewsCompassMeta;
  }

  if (agentId === "chelsea-adriaanse") {
    return chelseaAdriaanseCompassMeta;
  }

  if (agentId === "amy-detwiler") {
    return amyDetwilerCompassMeta;
  }

  if (agentId === "jill-derkach") {
    return jillDerkachCompassMeta;
  }

  if (agentId === "christine-danuser") {
    return christineDanuserCompassMeta;
  }

  if (agentId === "bradford-coffman") {
    return bradfordCoffmanCompassMeta;
  }

  if (agentId === "bill-churchill") {
    return billChurchillCompassMeta;
  }

  if (agentId === "katie-chu") {
    return katieChuCompassMeta;
  }

  if (agentId === "kelley-christian") {
    return kelleyChristianCompassMeta;
  }

  if (agentId === "stevie-chaddick") {
    return stevieChaddickCompassMeta;
  }

  if (agentId === "gianna-cerullo") {
    return giannaCerulloCompassMeta;
  }

  if (agentId === "centre-living-homes-team") {
    return centreLivingHomesTeamCompassMeta;
  }

  if (agentId === "mark-cain") {
    return markCainCompassMeta;
  }

  if (agentId === "neil-broussard") {
    return neilBroussardCompassMeta;
  }

  if (agentId === "adele-broughton") {
    return adeleBroughtonCompassMeta;
  }

  if (agentId === "jim-brosche") {
    return jimBroscheCompassMeta;
  }

  if (agentId === "callie-brickman") {
    return callieBrickmanCompassMeta;
  }

  if (agentId === "gayl-braymer") {
    return gaylBraymerCompassMeta;
  }

  if (agentId === "gretchen-brasch") {
    return gretchenBraschCompassMeta;
  }

  if (agentId === "kelsey-bond") {
    return kelseyBondCompassMeta;
  }

  if (agentId === "holly-bock") {
    return hollyBockCompassMeta;
  }

  if (agentId === "shannon-blount") {
    return shannonBlountCompassMeta;
  }

  if (agentId === "chris-blackman") {
    return chrisBlackmanCompassMeta;
  }

  if (agentId === "christy-berry") {
    return christyBerryCompassMeta;
  }

  if (agentId === "thomas-bellinger") {
    return thomasBellingerCompassMeta;
  }

  if (agentId === "erin-ballard") {
    return erinBallardCompassMeta;
  }

  if (agentId === "jacquelyn-austin") {
    return jacquelynAustinCompassMeta;
  }

  if (agentId === "meg-beaird") {
    return megBeairdCompassMeta;
  }

  if (agentId === "jonathan-rosen") {
    return jonathanRosenCompassMeta;
  }

  if (agentId === "katie-aspen") {
    return katieAspenCompassMeta;
  }

  if (agentId === "michele-balady-beach") {
    return micheleBaladyBeachCompassMeta;
  }

  if (agentId === "katy-annett") {
    return katyAnnettCompassMeta;
  }

  if (agentId === "annalee-aston") {
    return annaleeAstonCompassMeta;
  }

  if (agentId === "brooke-altemore") {
    return brookeAltemoreCompassMeta;
  }

  if (agentId === "jamie-adams") {
    return jamieAdamsCompassMeta;
  }

  if (agentId === "erika-orbin") {
    return erikaOrbinCompassMeta;
  }

  if (agentId === "megan-johnson") {
    return meganJohnsonCompassMeta;
  }

  if (agentId === "christine-leite") {
    return christineLeiteCompassMeta;
  }

  if (agentId === "liz-chalfant") {
    return lizChalfantCompassMeta;
  }

  if (agentId === "amy") {
    return amyCompassMeta;
  }
  if (agentId === "carson") {
    return carsonCompassMeta;
  }
  if (agentId === "alex") {
    return alexCompassMeta;
  }
  if (agentId === "summer") {
    return summerCompassMeta;
  }
  if (agentId === "jd") {
    return jdCompassMeta;
  }
  return kyleCompassMeta;
}

function loadProperties() {
  const { currentAgentId } = useAgentResolver();
  const agentId = currentAgentId.value || "kyle";
  const defaultList = getInitialListForAgent(agentId);
  const storageKey = getAgentStorageKey(agentId);

  try {
    if (typeof localStorage !== "undefined") {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return mergeProperties(defaultList, parsed);
        }
      }
    }
  } catch (err) {
    console.warn("Failed to load properties from localStorage:", err);
  }
  return [...defaultList];
}

function loadCompassMeta() {
  const { currentAgentId } = useAgentResolver();
  const agentId = currentAgentId.value || "kyle";
  const defaultMeta = getInitialMetaForAgent(agentId);
  const metaKey = getCompassMetaKey(agentId);

  try {
    if (typeof localStorage !== "undefined") {
      const raw = localStorage.getItem(metaKey);
      if (raw) return JSON.parse(raw);
    }
  } catch (e) {}
  return { ...defaultMeta };
}

const properties = ref(loadProperties());
const compassMeta = ref(loadCompassMeta());

// Watch for agent changes and reactively swap property catalogs
const { currentAgentId } = useAgentResolver();
watch(currentAgentId, () => {
  properties.value = loadProperties();
  compassMeta.value = loadCompassMeta();
});

export function useProperties() {
  function persist() {
    try {
      const agentId = currentAgentId.value || "kyle";
      localStorage.setItem(getAgentStorageKey(agentId), JSON.stringify(properties.value));
      localStorage.setItem(getCompassMetaKey(agentId), JSON.stringify(compassMeta.value));
    } catch (e) {
      console.error("Failed to persist to localStorage (quota exceeded?):", e);
    }
  }

  function getPropertyById(id) {
    const match = properties.value.find((p) => String(p.id) === String(id) || p.slug === String(id));
    if (match) return match;
    // Cross-agent fallback so direct links to any listing never fail
    const allKnown = [...kyleBaughDallasProperties, ...jolieBarriosProperties, ...annAndrewsProperties, ...chelseaAdriaanseProperties, ...amyDetwilerProperties, ...jillDerkachProperties, ...christineDanuserProperties, ...bradfordCoffmanProperties, ...billChurchillProperties, ...katieChuProperties, ...kelleyChristianProperties, ...stevieChaddickProperties, ...giannaCerulloProperties, ...centreLivingHomesTeamProperties, ...markCainProperties, ...neilBroussardProperties, ...adeleBroughtonProperties, ...jimBroscheProperties, ...callieBrickmanProperties, ...gaylBraymerProperties, ...gretchenBraschProperties, ...kelseyBondProperties, ...hollyBockProperties, ...shannonBlountProperties, ...chrisBlackmanProperties, ...christyBerryProperties, ...thomasBellingerProperties, ...erinBallardProperties, ...jacquelynAustinProperties, ...megBeairdProperties, ...jonathanRosenProperties, ...katieAspenProperties, ...micheleBaladyBeachProperties, ...katyAnnettProperties, ...annaleeAstonProperties, ...brookeAltemoreProperties, ...jamieAdamsProperties, ...erikaOrbinProperties, ...meganJohnsonProperties, ...christineLeiteProperties, ...lizChalfantProperties, ...jdProperties, ...summerProperties, ...alexProperties, ...carsonProperties, ...amyProperties, ...kyleProperties, ...defaultProperties];
    return allKnown.find((p) => String(p.id) === String(id) || p.slug === String(id)) || null;
  }

  function addProperty(newProp) {
    const id = newProp.id || "prop-" + Date.now();
    const priceNum = Number(newProp.price) || 0;
    const sqftNum = Number(newProp.sqft) || 1;
    const pricePerSqft = Math.round(priceNum / sqftNum) || 0;

    const formatted = {
      id,
      title: newProp.title || newProp.address,
      address: newProp.address,
      neighborhood: newProp.neighborhood || "Dallas, TX",
      enclaveCategory: newProp.enclaveCategory || "lakewood",
      price: priceNum,
      priceFormatted: "$" + priceNum.toLocaleString(),
      pricePerSqft,
      status: newProp.status || "Active Exclusive",
      openHouse: newProp.openHouse || null,
      bedrooms: Number(newProp.bedrooms) || 3,
      bathrooms: Number(newProp.bathrooms) || 2,
      sqft: sqftNum,
      lotSize: newProp.lotSize || "0.25 Acres",
      garage: newProp.garage || "2-Car Garage",
      yearBuilt: Number(newProp.yearBuilt) || new Date().getFullYear(),
      typology: newProp.typology || "Single Family",
      heroImage: newProp.heroImage || "",
      gallery: Array.isArray(newProp.gallery) ? newProp.gallery : [],
      tagline: newProp.tagline || "",
      description: newProp.description || "",
      forensics: Array.isArray(newProp.forensics) ? newProp.forensics : [],
      highlights: Array.isArray(newProp.highlights) ? newProp.highlights : [],
      featured: Boolean(newProp.featured),
      createdAt: new Date().toISOString(),
      approxSizeMB: newProp.approxSizeMB || 1.0,
      isCompassListing: Boolean(newProp.isCompassListing),
    };

    properties.value.unshift(formatted);
    persist();
    return formatted;
  }

  function updateProperty(id, updated) {
    const idx = properties.value.findIndex((p) => String(p.id) === String(id));
    if (idx !== -1) {
      const existing = properties.value[idx];
      const priceNum = updated.price !== undefined ? Number(updated.price) : existing.price;
      const sqftNum = updated.sqft !== undefined ? Number(updated.sqft) : existing.sqft;
      const pricePerSqft = sqftNum > 0 ? Math.round(priceNum / sqftNum) : existing.pricePerSqft;

      properties.value[idx] = {
        ...existing,
        ...updated,
        price: priceNum,
        priceFormatted: updated.priceFormatted || ("$" + priceNum.toLocaleString()),
        pricePerSqft,
      };
      persist();
      return properties.value[idx];
    }
    return null;
  }

  function deleteProperty(id) {
    properties.value = properties.value.filter((p) => String(p.id) !== String(id));
    persist();
  }

  function toggleStatus(id, newStatus) {
    const prop = properties.value.find((p) => String(p.id) === String(id));
    if (prop) {
      prop.status = newStatus;
      persist();
    }
  }

  async function syncWithCompass() {
    const agentId = currentAgentId.value || "kyle";
    const defaultMeta = getInitialMetaForAgent(agentId);
    const beforeCount = properties.value.length;
    const defaultList = getInitialListForAgent(agentId);

    properties.value = mergeProperties(properties.value, defaultList);
    const newCount = properties.value.length - beforeCount;
    compassMeta.value = {
      ...defaultMeta,
      lastSynced: new Date().toISOString(),
      totalProperties: properties.value.filter(p => p.isCompassListing).length,
      activeCount: properties.value.filter(p => p.isCompassListing && p.status?.includes("Active")).length,
      soldCount: properties.value.filter(p => p.isCompassListing && (p.status?.includes("Sold") || p.status?.includes("Leased"))).length,
    };
    persist();
    return { success: true, newCount, total: properties.value.length };
  }

  function resetToDefaults() {
    const agentId = currentAgentId.value || "kyle";
    properties.value = [...getInitialListForAgent(agentId)];
    compassMeta.value = { ...getInitialMetaForAgent(agentId) };
    persist();
  }

  function exportJSON() {
    const agentId = currentAgentId.value || "kyle";
    const dataStr = JSON.stringify(properties.value, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${agentId}-properties-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          if (Array.isArray(parsed) && parsed.length > 0) {
            properties.value = parsed;
            persist();
            resolve(parsed.length);
          } else {
            reject(new Error("Invalid backup file: expected non-empty array of properties"));
          }
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsText(file);
    });
  }

  return {
    properties,
    compassMeta,
    getPropertyById,
    addProperty,
    updateProperty,
    deleteProperty,
    toggleStatus,
    syncWithCompass,
    resetToDefaults,
    exportJSON,
    importJSON,
  };
}
