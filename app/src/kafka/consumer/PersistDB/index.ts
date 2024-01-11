import { Word } from "../../../datastore/mongodb/Word.js";
import { mongodbConnect } from "../../../datastore/mongodb/mongodbConnect/index.js";

import {
  KAFKA_PERSIST_DB_TOPIC,
  PERSIST_DB_CONSUMER_GROUP,
  NUMBER_OF_PARTITIONS_PERSIST_DB,
} from "../../../config/constants.js";

import { createConsumer } from "../createConsumer.js";
import { EachBatchPayload, EachMessagePayload } from "kafkajs";

await mongodbConnect();

const consumer = await createConsumer(
  KAFKA_PERSIST_DB_TOPIC,
  PERSIST_DB_CONSUMER_GROUP,
  NUMBER_OF_PARTITIONS_PERSIST_DB
);

await consumer.disconnect();
await consumer.connect();
await consumer.subscribe({
  topic: KAFKA_PERSIST_DB_TOPIC,
});

const handleBatchMessages = async (data: EachBatchPayload) => {
  const {
    heartbeat,
    batch: { topic, partition, messages },
    resolveOffset,
  } = data;
  const processedOffsets = [];

  try {
    for (const msg of messages) {
      const { offset, value } = msg;

      const word = String(value);
      const updateDoc = await Word.findOneAndUpdate(
        { term: word },
        { $inc: { count: 1 } }
      );
      console.log("update word count in database", updateDoc);

      processedOffsets.push(offset);
    }

    for (const offset of processedOffsets) {
      await resolveOffset(offset + 1);
    }

    await heartbeat();
  } catch (err) {
    // for
    console.error("handleBatchMessages", err);
  } finally {
    await consumer.resume([{ topic, partitions: [partition] }]);
  }
};

const handleEachMessage = async (data: EachMessagePayload) => {
  const {
    message: { key, value, offset },
    partition,
    topic,
    heartbeat,
    pause,
  } = data;

  await pause();

  try {
    const word = String(value).toLowerCase();
    console.log("handling word message", {
      offset,
      key: String(key),
      value: word,
      topic,
      partition,
    });

    console.log(
      `persist to database consumer dealing updating ${word} + 1`,
      { key: String(key) },
      { word }
    );

    const updateDoc = await Word.findOneAndUpdate(
      { term: word },
      { $inc: { count: 1 } }
    );
    await consumer.commitOffsets([{ topic, partition, offset }]);
    await heartbeat();
    console.log("update word count in database", updateDoc);
  } catch (err) {
    console.error("handleEachMessage", err);
  } finally {
    await consumer.resume([{ topic, partitions: [partition] }]);
  }
};

await consumer.run({
  partitionsConsumedConcurrently: +NUMBER_OF_PARTITIONS_PERSIST_DB,
  eachMessage: handleEachMessage,
  eachBatch: handleBatchMessages,
});
