import {
  HTMLS_CONSUMER_GROUP,
  KAFKA_HTMLS_TOPIC,
  NUMBER_OF_PARTITIONS_HTMLS,
} from "../../../config/constants.js";
import { parseHTMLandProduceWords } from "./parseHtml/index.js";
import { createConsumer } from "../createConsumer.js";

const consumer = await createConsumer(
  KAFKA_HTMLS_TOPIC,
  HTMLS_CONSUMER_GROUP,
  NUMBER_OF_PARTITIONS_HTMLS
);

await consumer.disconnect();
await consumer.connect();
await consumer.subscribe({ topic: KAFKA_HTMLS_TOPIC });

await consumer.run({
  partitionsConsumedConcurrently: +NUMBER_OF_PARTITIONS_HTMLS,
  eachMessage: async (data) => {
    const {
      message: { key, value, offset },
      partition,
      topic,
    } = data;

    console.log("handling html message", {
      offset,
      key: String(key),
      value: String(value),
      topic,
      partition,
    });

    await parseHTMLandProduceWords(String(value))
      .then(async (res) => {
        console.log({ res });
        await consumer.commitOffsets([{ topic, partition, offset }]);
      })
      .catch((err) => console.error(err));
  },
});
