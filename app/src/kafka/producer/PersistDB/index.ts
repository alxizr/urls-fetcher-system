import {
  KAFKA_PERSIST_DB_TOPIC,
  NUMBER_OF_PARTITIONS_PERSIST_DB,
} from "../../../config/constants.js";
import { createProducer } from "../createProducer.js";

const producer = await createProducer(
  KAFKA_PERSIST_DB_TOPIC,
  NUMBER_OF_PARTITIONS_PERSIST_DB
);

await producer.disconnect();
await producer.connect();
export { producer as persistentDbProducer };
