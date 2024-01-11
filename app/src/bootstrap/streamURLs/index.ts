import { Snowflake } from "nodejs-snowflake";

import { readURLs } from "../readFiles/index.js";
import { urlsProducer } from "../../kafka/producer/URLs/index.js";
import { KAFKA_URLS_TOPIC, LIMIT_URLS_NUMBER } from "../../config/constants.js";

export const streamURLs = async () => {
  await urlsProducer.connect();

  // snowflake id generator
  const uid = new Snowflake();

  console.log("urls producer start");
  await readURLs()
    .then(async (urls) => {
      if (LIMIT_URLS_NUMBER) {
        urls = urls.slice(0, +LIMIT_URLS_NUMBER);
      }

      const msgs = urls.map((url) => {
        return urlsProducer.send({
          topic: KAFKA_URLS_TOPIC,
          messages: [
            {
              key: uid.getUniqueID().toString(),
              value: url,
            },
          ],
        });
      });

      return msgs;
    })
    .then((promises) => Promise.allSettled(promises))
    .then((res) => res.forEach((response) => console.log(response)))
    .catch((err) => console.error(err));

  await urlsProducer?.disconnect().catch((err) => console.error(err));
  console.log("urls producer end");
};
