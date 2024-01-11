import { promises as fs } from "node:fs";
import { join } from "node:path";

const URLS_FILE_NAME = "endg-urls.txt";
const WORDS_BANK_FILE_NAME = "words.txt";

const readFileFromFS = async (args: string[]) => {
  const results: string[] = [];

  try {
    const fileData = await fs.readFile(join(...args), "utf-8");
    const lines = fileData?.split(/\r?\n/); // Split by newline characters

    for (const line of lines) {
      results.push(line);
    }
  } catch (error) {
    console.error("Error reading file:", error);
  } finally {
    return results;
  }
};

export const readURLs = async () =>
  await readFileFromFS(["dist", "assets", URLS_FILE_NAME]);

export const readWordsBank = async () =>
  await readFileFromFS(["dist", "assets", WORDS_BANK_FILE_NAME]);
