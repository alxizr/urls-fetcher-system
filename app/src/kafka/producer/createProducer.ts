import { Kafka, logLevel } from "kafkajs";

import {
  KAFKA_BROKER_PORT,
  KAFKA_BROKER_HOST,
  KAFKA_BROKER_URL,
} from "../../config/constants.js";

export const createProducer = async (
  topic: string,
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

  const producer = kafka.producer({
    allowAutoTopicCreation: true,
  });

  process.on("SIGTERM", async () => {
    await producer.disconnect();
    process.exit(0);
  });

  producer.on("producer.disconnect", async (err) => {
    console.error(`${topic} producer disconnected, reconnecting`, err);
    await producer.connect();
  });

  return producer;
};
