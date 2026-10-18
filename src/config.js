import _ from "lodash";

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

const TWELVE_HRS = 60 * 60 * 12; // 12 hours in seconds
const ONE_MIN = 60; // 1 minute in seconds

const defaultConfig = {
  refreshDuration: isProd ? TWELVE_HRS : ONE_MIN,
  enabled: true,
  history: [],
  db: {
    apiParams: {
      cursor: "",
    },
    html: "",
  },
};

export const KEYS_TO_SKIP = ["db", "history", "enabled"];

export const getDataFromStorage = (
  defaultValues,
  cb,
  key = DEFAULT_ENTITIES_KEY,
) => {
  const storage = typeof chrome !== "undefined" ? chrome.storage?.local : null;
  storage.get([key], (result) => {
    const appData = result?.[key];
    const parsedData =
      typeof appData === "object" ? appData : JSON.parse(appData || "null");

    try {
      cb(parsedData ?? defaultValues);
    } catch (error) {
      console.error("Invalid stored entity config:", error);
      cb(defaultValues);
    }
  });
};

export const saveDataToStorage = (data, key = DEFAULT_ENTITIES_KEY) => {
  const storage = typeof chrome !== "undefined" ? chrome.storage?.local : null;
  if (storage && data != null) {
    storage.set({ [key]: JSON.stringify(data) });
  }
};

export const buildDefaultEntities = () => [
  {
    ...defaultConfig,
    _id: "vocab",
    label: "Vocabulary",
    description: "One uncommon English word a day, with meaning and usage.",
    api: `${BASE_URL}/vocab`,
  },
  // {
  //   ...defaultConfig,
  //   _id: "tech-bites",
  //   description: "Short, digestible tech snippets to keep you updated.",
  //   label: "Tech bites",
  //   api: `${BASE_URL}/tech-snippets`,
  // },
  // {
  //   ...defaultConfig,
  //   _id: "keybindings",
  //   label: "Keybindings",
  //   api: `${BASE_URL}/keybindings`,
  //   enabled: false,
  // },
];

export const ENTITY_MAP = _.keyBy(buildDefaultEntities(), "_id");
