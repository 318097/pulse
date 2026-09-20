import {
  APP_CONFIG,
  buildDefaultEntities,
  getDataFromStorage,
  saveDataToStorage,
} from "./config";

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
    let version = currentVersion;

    // if (currentVersion === "1.5.0") {
    //   getDataFromStorage(buildDefaultEntities(), (storedEntities) => {
    //     const updatedEntities = storedEntities.map((entity) => {
    //       if (entity._id === "vocab") {
    //         return {
    //           ...entity,
    //           refreshDuration: 120,
    //         };
    //       }
    //       return entity;
    //     });
    //     saveDataToStorage(updatedEntities);

    //     // version = "1.5.0";
    //   });
    // }
  }
};

runVersionUpdateCallback(onExtensionVersionUpdated);
