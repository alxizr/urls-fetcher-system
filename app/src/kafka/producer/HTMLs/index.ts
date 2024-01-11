import {
  KAFKA_HTMLS_TOPIC,
  NUMBER_OF_PARTITIONS_HTMLS,
} from "../../../config/constants.js";
import { createProducer } from "../createProducer.js";

const producer = await createProducer(
  KAFKA_HTMLS_TOPIC,
  NUMBER_OF_PARTITIONS_HTMLS
);

await producer.disconnect();
await producer.connect();

export { producer as htmlProducer };
