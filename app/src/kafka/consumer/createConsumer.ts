import { Kafka, logLevel } from "kafkajs";

import {
  KAFKA_BROKER_PORT,
  KAFKA_BROKER_HOST,
  KAFKA_BROKER_URL,
} from "../../config/constants.js";

export const createConsumer = async (
  topic: string,
  consumerGroup: string,
  numberOfPartitions: string | number
) => {
  const port = KAFKA_BROKER_PORT;
  const host = KAFKA_BROKER_HOST;
  const url = KAFKA_BROKER_URL;

  const kafka: Kafka = new Kafka({
    brokers: [url!, `${host}:1${port}`, `${host}:${port}`],
    logLevel: logLevel.ERROR,
  });

  const admin = kafka.admin();

  const currentTopics = await admin.listTopics();
  if (!currentTopics.includes(topic)) {
    await admin.createTopics({
      topics: [
        {
          topic: topic,
          numPartitions: +numberOfPartitions,
        },
      ],
    });

    console.log(`topic ${topic} created`);
  } else {
    console.log(`topic ${topic} exists`);
  }

  const consumer = kafka.consumer({
    groupId: consumerGroup,
    allowAutoTopicCreation: true,
  });

  process.on("SIGTERM", async () => {
    await consumer.disconnect();
    process.exit(0);
  });

  consumer.on("consumer.stop", async (err) => {
    console.error(`${topic} consumer stopped`, err);
    await consumer.disconnect();
    process.exit(0);
  });

  consumer.on("consumer.crash", async (err) => {
    console.error(`${topic} consumer crashed`, err);
    await consumer.disconnect();
    process.exit(0);
  });

  consumer.on("consumer.disconnect", async (err) => {
    console.error(`${topic} consumer disconnected, reconnecting`, err);
    await consumer.connect();
  });

  consumer.on("consumer.rebalancing", async (err) => {
    console.error(`${topic} consumer rebalancing, reconnecting`, err);
    await consumer.connect();
  });

  return consumer;
};
