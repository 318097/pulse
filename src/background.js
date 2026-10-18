import {
  buildDefaultEntities,
  getDataFromStorage,
  KEYS_TO_SKIP,
  saveDataToStorage,
} from "./config";
import pick from "lodash/pick";

const runVersionUpdateCallback = (callback) => {
  chrome.runtime.onInstalled.addListener((details) => {
    const manifestVersion = chrome.runtime.getManifest().version;

    if (
      details.reason === "update" &&
      details.previousVersion &&
      details.previousVersion !== manifestVersion
    ) {
      callback(details.previousVersion, manifestVersion);
    }
  });
};

const onExtensionVersionUpdated = (previousVersion, currentVersion) => {
  console.log(
    `[Pulse] Extension updated from ${previousVersion} to ${currentVersion}`,
  );
  if (previousVersion !== currentVersion) {
    getDataFromStorage(null, (storedEntities) => {
      const defaultEntities = buildDefaultEntities();
      if (!storedEntities) return defaultEntities;

      const updatedEntities = defaultEntities.map((entity) => {
        const matchedEntity = storedEntities.find((e) => e._id === entity._id);

        if (!matchedEntity) return entity;

        return { ...entity, ...pick(matchedEntity, KEYS_TO_SKIP) };
      });
      saveDataToStorage(updatedEntities);
    });
  }
};

runVersionUpdateCallback(onExtensionVersionUpdated);
