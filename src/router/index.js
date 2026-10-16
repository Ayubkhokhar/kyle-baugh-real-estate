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
    path: "/michele-balady-beach",
    name: "micheleBaladyBeach-home",
    component: HomeView,
  },
  {
    path: "/katie-aspen",
    name: "katieAspen-home",
    component: HomeView,
  },
  {
    path: "/jonathan-rosen",
    name: "jonathanRosen-home",
    component: HomeView,
  },
  {
    path: "/meg-beaird",
    name: "megBeaird-home",
    component: HomeView,
  },
  {
    path: "/jacquelyn-austin",
    name: "jacquelynAustin-home",
    component: HomeView,
  },
  {
    path: "/erin-ballard",
    name: "erinBallard-home",
    component: HomeView,
  },
  {
    path: "/thomas-bellinger",
    name: "thomasBellinger-home",
    component: HomeView,
  },
  {
    path: "/christy-berry",
    name: "christyBerry-home",
    component: HomeView,
  },
  {
    path: "/chris-blackman",
    name: "chrisBlackman-home",
    component: HomeView,
  },
  {
    path: "/shannon-blount",
    name: "shannonBlount-home",
    component: HomeView,
  },
  {
    path: "/holly-bock",
    name: "hollyBock-home",
    component: HomeView,
  },
  {
    path: "/kelsey-bond",
    name: "kelseyBond-home",
    component: HomeView,
  },
  {
    path: "/gretchen-brasch",
    name: "gretchenBrasch-home",
    component: HomeView,
  },
  {
    path: "/gayl-braymer",
    name: "gaylBraymer-home",
    component: HomeView,
  },
  {
    path: "/callie-brickman",
    name: "callieBrickman-home",
    component: HomeView,
  },
  {
    path: "/jim-brosche",
    name: "jimBrosche-home",
    component: HomeView,
  },
  {
    path: "/adele-broughton",
    name: "adeleBroughton-home",
    component: HomeView,
  },
  {
    path: "/neil-broussard",
    name: "neilBroussard-home",
    component: HomeView,
  },
  {
    path: "/mark-cain",
    name: "markCain-home",
    component: HomeView,
  },
  {
    path: "/centre-living-homes-team",
    name: "centreLivingHomesTeam-home",
    component: HomeView,
  },
  {
    path: "/gianna-cerullo",
    name: "giannaCerullo-home",
    component: HomeView,
  },
  {
    path: "/stevie-chaddick",
    name: "stevieChaddick-home",
    component: HomeView,
  },
  {
    path: "/kelley-christian",
    name: "kelleyChristian-home",
    component: HomeView,
  },
  {
    path: "/katie-chu",
    name: "katieChu-home",
    component: HomeView,
  },
  {
    path: "/bill-churchill",
    name: "billChurchill-home",
    component: HomeView,
  },
  {
    path: "/bradford-coffman",
    name: "bradfordCoffman-home",
    component: HomeView,
  },
  {
    path: "/christine-danuser",
    name: "christineDanuser-home",
    component: HomeView,
  },
  {
    path: "/jill-derkach",
    name: "jillDerkach-home",
    component: HomeView,
  },
  {
    path: "/amy-detwiler",
    name: "amyDetwiler-home",
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
    path: "/michele-balady-beach/manage",
    name: "micheleBaladyBeach-manage",
    component: ManageView,
  },
  {
    path: "/katie-aspen/manage",
    name: "katieAspen-manage",
    component: ManageView,
  },
  {
    path: "/jonathan-rosen/manage",
    name: "jonathanRosen-manage",
    component: ManageView,
  },
  {
    path: "/meg-beaird/manage",
    name: "megBeaird-manage",
    component: ManageView,
  },
  {
    path: "/jacquelyn-austin/manage",
    name: "jacquelynAustin-manage",
    component: ManageView,
  },
  {
    path: "/erin-ballard/manage",
    name: "erinBallard-manage",
    component: ManageView,
  },
  {
    path: "/thomas-bellinger/manage",
    name: "thomasBellinger-manage",
    component: ManageView,
  },
  {
    path: "/christy-berry/manage",
    name: "christyBerry-manage",
    component: ManageView,
  },
  {
    path: "/chris-blackman/manage",
    name: "chrisBlackman-manage",
    component: ManageView,
  },
  {
    path: "/shannon-blount/manage",
    name: "shannonBlount-manage",
    component: ManageView,
  },
  {
    path: "/holly-bock/manage",
    name: "hollyBock-manage",
    component: ManageView,
  },
  {
    path: "/kelsey-bond/manage",
    name: "kelseyBond-manage",
    component: ManageView,
  },
  {
    path: "/gretchen-brasch/manage",
    name: "gretchenBrasch-manage",
    component: ManageView,
  },
  {
    path: "/gayl-braymer/manage",
    name: "gaylBraymer-manage",
    component: ManageView,
  },
  {
    path: "/callie-brickman/manage",
    name: "callieBrickman-manage",
    component: ManageView,
  },
  {
    path: "/jim-brosche/manage",
    name: "jimBrosche-manage",
    component: ManageView,
  },
  {
    path: "/adele-broughton/manage",
    name: "adeleBroughton-manage",
    component: ManageView,
  },
  {
    path: "/neil-broussard/manage",
    name: "neilBroussard-manage",
    component: ManageView,
  },
  {
    path: "/mark-cain/manage",
    name: "markCain-manage",
    component: ManageView,
  },
  {
    path: "/centre-living-homes-team/manage",
    name: "centreLivingHomesTeam-manage",
    component: ManageView,
  },
  {
    path: "/gianna-cerullo/manage",
    name: "giannaCerullo-manage",
    component: ManageView,
  },
  {
    path: "/stevie-chaddick/manage",
    name: "stevieChaddick-manage",
    component: ManageView,
  },
  {
    path: "/kelley-christian/manage",
    name: "kelleyChristian-manage",
    component: ManageView,
  },
  {
    path: "/katie-chu/manage",
    name: "katieChu-manage",
    component: ManageView,
  },
  {
    path: "/bill-churchill/manage",
    name: "billChurchill-manage",
    component: ManageView,
  },
  {
    path: "/bradford-coffman/manage",
    name: "bradfordCoffman-manage",
    component: ManageView,
  },
  {
    path: "/christine-danuser/manage",
    name: "christineDanuser-manage",
    component: ManageView,
  },
  {
    path: "/jill-derkach/manage",
    name: "jillDerkach-manage",
    component: ManageView,
  },
  {
    path: "/amy-detwiler/manage",
    name: "amyDetwiler-manage",
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
