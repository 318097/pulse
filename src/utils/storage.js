// chrome.storage.local, where values are saved as JSON strings
import { DEFAULT_ENTITIES_KEY } from "../config";

// A stored value as an object: JSON strings are parsed; bad JSON gives null
export const parseStored = (value) => {
  try {
    return typeof value === "string" ? JSON.parse(value) : value;
  } catch {
    return null;
  }
};

export const getDataFromStorage = (
  defaultValues,
  cb,
  key = DEFAULT_ENTITIES_KEY,
) => {
  chrome.storage.local.get([key], (result) => {
    const parsedData = parseStored(result?.[key]);

    try {
      cb(parsedData ?? defaultValues);
    } catch (error) {
      console.error("Invalid stored entity config:", error);
      cb(defaultValues);
    }
  });
};

export const readFromStorage = (key, fallback) =>
  new Promise((resolve) => getDataFromStorage(fallback, resolve, key));

export const saveDataToStorage = (data, key = DEFAULT_ENTITIES_KEY) => {
  if (data != null) chrome.storage.local.set({ [key]: JSON.stringify(data) });
};
