import {
  KAFKA_URLS_TOPIC,
  NUMBER_OF_PARTITIONS_URLS,
} from "../../../config/constants.js";
import { createProducer } from "../createProducer.js";

const producer = await createProducer(
  KAFKA_URLS_TOPIC,
  NUMBER_OF_PARTITIONS_URLS
);

await producer.disconnect();
await producer.connect();
export { producer as urlsProducer };
