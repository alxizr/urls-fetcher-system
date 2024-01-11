import { Word } from "../../datastore/mongodb/Word.js";

export const queryTop10WordsOnInterval = async () => {
  const top10 = await Word.aggregate([
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  // TODO - format output
  // TODO - write json file to fs
  console.log("======================== TOP 10 WORDS =====================");
  console.table(top10.map((word) => ({ word: word.term, count: word.count })));
  console.log("===========================================================");
};
