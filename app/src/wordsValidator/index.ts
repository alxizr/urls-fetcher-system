// TODO - lowercase word before check !!!
export const wordsValidator = (word: string) => /^[a-zA-Z]{3,}$/.test(word);
