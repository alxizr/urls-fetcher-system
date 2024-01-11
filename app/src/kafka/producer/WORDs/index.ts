import {
  KAFKA_WORDS_TOPIC,
  NUMBER_OF_PARTITIONS_WORDS,
} from "../../../config/constants.js";
import { createProducer } from "../createProducer.js";

const producer = await createProducer(
  KAFKA_WORDS_TOPIC,
  NUMBER_OF_PARTITIONS_WORDS
);

await producer.disconnect();
await producer.connect();
export { producer as wordsProducer };
