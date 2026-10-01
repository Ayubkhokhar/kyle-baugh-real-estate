import { createRouter, createWebHistory } from "vue-router";
import { useAgentResolver } from "../composables/useAgentResolver";

// Lazy-loaded route components for optimal initial bundle size and mobile performance
const HomeView = () => import("../views/HomeView.vue");
const LandingView = () => import("../views/LandingView.vue");
const LoginView = () => import("../views/LoginView.vue");
const MasterPortalView = () => import("../views/MasterPortalView.vue");
const PropertyDetailView = () => import("../views/PropertyDetailView.vue");
const SubmitPropertyView = () => import("../views/SubmitPropertyView.vue");
const ManageView = () => import("../views/ManageView.vue");

const routes = [
  {
    path: "/",
    name: "home",
    component: LandingView,
    meta: { hideAgentNav: true },
  },
  {
    path: "/login",
    name: "admin-login",
    component: LoginView,
    meta: { hideAgentNav: true },
  },
  {
    path: "/portal",
    name: "master-portal",
    component: MasterPortalView,
    meta: { hideAgentNav: true },
  },
  {
    path: "/kyle",
    name: "kyle-home",
    component: HomeView,
  },
  {
    path: "/amy",
    name: "amy-home",
    component: HomeView,
  },
  {
    path: "/carson",
    name: "carson-home",
    component: HomeView,
  },
  {
    path: "/alex",
    name: "alex-home",
    component: HomeView,
  },
  {
    path: "/summer",
    name: "summer-home",
    component: HomeView,
  },
  {
    path: "/jd",
    name: "jd-home",
    component: HomeView,
  },
  {
    path: "/liz-chalfant",
    name: "lizChalfant-home",
    component: HomeView,
  },
  {
    path: "/christine-leite",
    name: "christineLeite-home",
    component: HomeView,
  },
  {
    path: "/megan-johnson",
    name: "meganJohnson-home",
    component: HomeView,
  },
  {
    path: "/erika-orbin",
    name: "erikaOrbin-home",
    component: HomeView,
  },
  {
    path: "/jamie-adams",
    name: "jamieAdams-home",
    component: HomeView,
  },
  {
    path: "/brooke-altemore",
    name: "brookeAltemore-home",
    component: HomeView,
  },
  {
    path: "/annalee-aston",
    name: "annaleeAston-home",
    component: HomeView,
  },
  {
    path: "/katy-annett",
    name: "katyAnnett-home",
    component: HomeView,
  },
  {
    path: "/agent/:agentSlug",
    name: "agent-home",
    component: HomeView,
  },
  {
    path: "/property/:id",
    name: "property-detail",
    component: PropertyDetailView,
  },
  {
    path: "/submit",
    name: "submit-property",
    component: SubmitPropertyView,
  },
  {
    path: "/manage",
    name: "manage",
    component: ManageView,
  },
  {
    path: "/amy/manage",
    name: "amy-manage",
    component: ManageView,
  },
  {
    path: "/carson/manage",
    name: "carson-manage",
    component: ManageView,
  },
  {
    path: "/alex/manage",
    name: "alex-manage",
    component: ManageView,
  },
  {
    path: "/summer/manage",
    name: "summer-manage",
    component: ManageView,
  },
  {
    path: "/jd/manage",
    name: "jd-manage",
    component: ManageView,
  },
  {
    path: "/kyle/manage",
    name: "kyle-manage",
    component: ManageView,
  },
  {
    path: "/liz-chalfant/manage",
    name: "lizChalfant-manage",
    component: ManageView,
  },
  {
    path: "/christine-leite/manage",
    name: "christineLeite-manage",
    component: ManageView,
  },
  {
    path: "/megan-johnson/manage",
    name: "meganJohnson-manage",
    component: ManageView,
  },
  {
    path: "/erika-orbin/manage",
    name: "erikaOrbin-manage",
    component: ManageView,
  },
  {
    path: "/jamie-adams/manage",
    name: "jamieAdams-manage",
    component: ManageView,
  },
  {
    path: "/brooke-altemore/manage",
    name: "brookeAltemore-manage",
    component: ManageView,
  },
  {
    path: "/annalee-aston/manage",
    name: "annaleeAston-manage",
    component: ManageView,
  },
  {
    path: "/katy-annett/manage",
    name: "katyAnnett-manage",
    component: ManageView,
  },
  {
    path: "/:agentSlug/manage",
    name: "agent-manage",
    component: ManageView,
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    if (to.hash) {
      return {
        el: to.hash,
        behavior: "smooth",
      };
    }
    return { top: 0, behavior: "smooth" };
  },
});

router.beforeEach((to, from, next) => {
  const { setAgentWithoutReload, currentAgentId, availableAgents } = useAgentResolver();
  const path = to.path.toLowerCase();
  const queryAgent = (to.query.agent || to.query.client || "").toLowerCase();

  // Security Gate: Protect /portal
  if (path === "/portal") {
    const isAuth = typeof window !== "undefined" && sessionStorage.getItem("webpenter_master_auth") === "true";
    if (!isAuth) {
      return next("/login");
    }
  }

  for (const agent of availableAgents) {
    if (path.includes(`/${agent.id}`) || queryAgent === agent.id) {
      if (currentAgentId.value !== agent.id) {
        setAgentWithoutReload(agent.id);
      }
      return next();
    }
  }

  next();
});

export default router;
