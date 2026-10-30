const API_ENV = (
  process.env.API_ENV ||
  process.env.NODE_ENV ||
  "development"
).toLowerCase();

const DEV_BASE = "http://localhost:7000/api/notion";
const PROD_BASE = "https://bubblegum-server.vercel.app/api/notion";
const BASE_URL = API_ENV === "production" ? PROD_BASE : DEV_BASE;

const isProd = API_ENV === "production";

export const APP_CONFIG = {
  apiEnv: API_ENV,
  baseUrl: BASE_URL,
};

export const DEFAULT_ENTITIES_KEY = "pulse:entities";
export const DEFAULT_ACTIVE_ENTITY_KEY = "pulse:activeEntity";
export const SWITCH_KEY = "pulse:switch";

const ONE_MIN = 60; // 1 minute in seconds
const ONE_HR = 60 * 60; // 1 hour in seconds
const TWELVE_HRS = ONE_HR * 12; // 12 hours in seconds

const defaultConfig = {
  refreshDuration: isProd ? TWELVE_HRS : ONE_MIN,
  enabled: true,
  historySize: 50,
  history: [],
  db: {
    apiParams: {
      cursor: "",
    },
    html: "",
  },
};

export const KEYS_TO_SKIP = ["db", "history", "enabled"]; // these keys are not overridden when updating an entity with new data from the API

export const buildDefaultEntities = () => [
  {
    ...defaultConfig,
    _id: "vocab",
    label: "Vocabulary",
    description: "A rare English word with its meaning and an example.",
    api: `${BASE_URL}/vocab`,
  },
  {
    ...defaultConfig,
    _id: "code404",
    label: "Tech bytes",
    description: "Quick tech reads to keep you current.",
    api: `${BASE_URL}/code404`,
    refreshDuration: isProd ? ONE_HR * 4 : ONE_MIN,
  },
  {
    ...defaultConfig,
    _id: "keybindings",
    label: "Keyboard shortcuts",
    description: "Handy shortcuts to help you work faster.",
    api: `${BASE_URL}/keybindings`,
  },
];
