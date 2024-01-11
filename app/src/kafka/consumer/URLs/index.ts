import { Snowflake } from "nodejs-snowflake";

import {
  KAFKA_URLS_TOPIC,
  URLS_CONSUMER_GROUP,
  NUMBER_OF_PARTITIONS_URLS,
  KAFKA_HTMLS_TOPIC,
} from "../../../config/constants.js";
import { fetchURL } from "../../../http/index.js";
import { htmlProducer } from "../../producer/HTMLs/index.js";
import { createConsumer } from "../createConsumer.js";

const consumer = await createConsumer(
  KAFKA_URLS_TOPIC,
  URLS_CONSUMER_GROUP,
  NUMBER_OF_PARTITIONS_URLS
);

await consumer.disconnect();
await consumer.connect();
await consumer.subscribe({ topic: KAFKA_URLS_TOPIC });

// snowflake id generator
const uid = new Snowflake();

await consumer.run({
  partitionsConsumedConcurrently: +NUMBER_OF_PARTITIONS_URLS,
  eachMessage: async (data) => {
    const {
      message: { key, value, offset },
      partition,
      topic,
    } = data;

    console.log("handling url message", {
      offset,
      key: String(key),
      value: String(value),
      topic,
      partition,
    });

    await htmlProducer.connect();
    await fetchURL(String(value))
      .then(async (html) => {
        const producedBody = await htmlProducer.send({
          topic: KAFKA_HTMLS_TOPIC,
          messages: [
            {
              key: uid.getUniqueID().toString(),
              value: html,
            },
          ],
        });

        console.log({ producedBody });
        await consumer.commitOffsets([{ topic, partition, offset }]);
      })
      .catch((err) => console.error(err));
  },
});
