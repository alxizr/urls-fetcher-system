import { Snowflake } from "nodejs-snowflake";
import { cache } from "../../../datastore/redis/index.js";
import { Word } from "../../../datastore/mongodb/Word.js";
import { persistentDbProducer } from "../../producer/PersistDB/index.js";

import {
  KAFKA_WORDS_TOPIC,
  WORDS_CONSUMER_GROUP,
  NUMBER_OF_PARTITIONS_WORDS,
  KAFKA_PERSIST_DB_TOPIC,
} from "../../../config/constants.js";
import { createConsumer } from "../createConsumer.js";

const consumer = await createConsumer(
  KAFKA_WORDS_TOPIC,
  WORDS_CONSUMER_GROUP,
  NUMBER_OF_PARTITIONS_WORDS
);

await consumer.disconnect();
await consumer.connect();
await consumer.subscribe({ topic: KAFKA_WORDS_TOPIC });

await consumer.run({
  partitionsConsumedConcurrently: +NUMBER_OF_PARTITIONS_WORDS,
  eachMessage: async (data) => {
    const {
      message: { key, value, offset },
      partition,
      topic,
    } = data;

    const word = String(value).toLowerCase();
    console.log("handling word message", {
      offset,
      key: String(key),
      value: word,
      topic,
      partition,
    });

    await cache
      .get(word)
      .then(async (res) => {
        if (res) {
          await updateTheCache(word, parseInt(res));

          await sendWordToPersistDatabase(word);
        } // if

        await consumer.commitOffsets([{ topic, partition, offset }]);
      })
      .catch((err) => console.error(err));
  },
});

const updateTheCache = async (word: string, count: number) => {
  try {
    await cache.set(word, count + 1);
    console.log(`words consumer dealing with cache. updating ${word} + 1`);
  } catch (err) {
    console.log("sendWordToPersistDatabase", word, "failed", err);
  }
};

const sendWordToPersistDatabase = async (word: string) => {
  try {
    console.log(`sending ${word} to persist topic`);
    const uid = new Snowflake();
    await persistentDbProducer.send({
      topic: KAFKA_PERSIST_DB_TOPIC,
      messages: [
        {
          key: uid.getUniqueID().toString(),
          value: word,
        },
      ],
    });
  } catch (err) {
    console.log("sendWordToPersistDatabase", word, "failed", err);
  }
};
