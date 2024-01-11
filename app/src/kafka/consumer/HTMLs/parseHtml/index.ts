import * as cheerio from "cheerio";
import { Snowflake } from "nodejs-snowflake";

import { wordsProducer } from "../../../producer/WORDs/index.js";
import { KAFKA_WORDS_TOPIC } from "../../../../config/constants.js";

await wordsProducer.connect();
export const parseHTMLandProduceWords = async (htmlText: string) => {
  const $ = cheerio.load(htmlText);
  const body = $("body").text();

  // snowflake id generator
  const uid = new Snowflake();

  const produced = body.split(" ").forEach(async (word) => {
    console.log("producing word", word, "to words topic");
    await wordsProducer
      .send({
        topic: KAFKA_WORDS_TOPIC,
        messages: [
          {
            key: uid.getUniqueID().toString(),
            value: word,
          },
        ],
      })
      .then((res) => res)
      .catch((err) => err);
  });

  await wordsProducer?.disconnect().catch((err) => console.error(err));
  console.log("words producer end");
  return produced;
};
