import { streamURLs } from "./streamURLs/index.js";
import { populateCache } from "./populateCache/index.js";
import { mongodbConnect } from "../datastore/mongodb/mongodbConnect/index.js";

import { queryTop10WordsOnInterval } from "./top10/index.js";

const bootstrap = async () => {
  try {
    await mongodbConnect();
    await populateCache();
    await streamURLs();
  } catch (err) {
    console.error(
      "failed to bootstrap application. check words, urls and/or mongodb database",
      err
    );
  }
};

const INTERVAL_TIME = 30 * 1000;
await bootstrap()
  .then(() => console.log("bootstrap is done!"))
  .catch((err) => console.log("bootstrap failed!", err))
  .finally(() => {
    // process.exit(0);
    console.log(
      `setting interval to get top 10 words from database every ${INTERVAL_TIME} seconds`
    );
    setInterval(queryTop10WordsOnInterval, INTERVAL_TIME);
  });
