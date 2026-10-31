export const pluralize = (count, word) =>
  `${count} ${word}${count === 1 ? "" : "s"}`;

// Search query -> lowercase words: "yt.watch later" -> ["yt", "watch", "later"]
export const tokenize = (query = "") =>
  query
    .toLowerCase()
    .split(/[\s.›>]+/)
    .filter(Boolean);

// Every token appears somewhere in the fields
export const matchesAll = (tokens, ...fields) => {
  const haystack = fields.filter(Boolean).join(" ").toLowerCase();
  return tokens.every((token) => haystack.includes(token));
};
