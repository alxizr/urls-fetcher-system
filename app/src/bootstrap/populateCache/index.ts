import { readWordsBank } from "../readFiles/index.js";
import { wordsValidator } from "../../wordsValidator/index.js";
import { cache } from "../../datastore/redis/index.js";
import { Word } from "../../datastore/mongodb/Word.js";

export const populateCache = async () => {
  // const wordsToCache: string[] = [];

  try {
    let words = await readWordsBank();

    words = [...new Set(words.filter(wordsValidator))];

    if (!cache.isOpen) {
      await cache?.connect();
    }

    await Promise.allSettled(
      words.map((word) => cache.set(word.toLowerCase(), 0))
    );
    console.log("inserted valid words to redis for caching");

    const wordsDocuments = words.map((word) => {
      return {
        term: word.toLowerCase(),
        count: 0,
      };
    });
    await Word.collection.drop();
    await Word.insertMany(wordsDocuments);
    console.log("inserted valid words to mongodb database");
  } catch (err) {
    console.error("populate cache failed", err);
  } finally {
    cache.disconnect();
  }
};
