import upperFirst from "lodash/upperFirst";

const stripUrl = (url, scheme) =>
  url
    .trim()
    .replace(scheme, "")
    .replace(/^www\./, "")
    .replace(/\/+$/, "");

// "https://www.youtube.com/feed/history/" -> "youtube.com/feed/history"
export const displayUrl = (url = "") => stripUrl(url, /^https?:\/\//);

// Comparable form: lowercase, any scheme dropped
export const normalizeUrl = (url = "") =>
  stripUrl(url.toLowerCase(), /^[a-z][a-z0-9+.-]*:\/\//);

// "https://www.github.com/acme" -> "github.com"
export const getSite = (url) => normalizeUrl(url).split(/[/?#]/)[0];

// `url` starts with `prefix`, ignoring protocol, www and trailing slashes; the
// boundary check stops github.com from matching github.community
export const isUrlMatch = (url, prefix) => {
  const target = normalizeUrl(prefix);
  const value = normalizeUrl(url);
  if (!target || !value.startsWith(target)) return false;

  const next = value.charAt(target.length);
  return !next || "/?#".includes(next);
};

export const isValidUrl = (url) => {
  try {
    return new URL(url).origin !== "null";
  } catch {
    return false;
  }
};

// "github.com/acme" -> "https://github.com/acme"; anything else is left alone
export const withProtocol = (url) =>
  url && !/^[a-z][a-z0-9+.-]*:/i.test(url) && /^[^\s/]+\.\S+$/.test(url)
    ? `https://${url}`
    : url;

// Site name for a page: "https://mail.google.com/..." -> "Google"
export const getSiteName = ({ title = "", url = "" } = {}) => {
  try {
    const parts = new URL(url).hostname.replace(/^www\./, "").split(".");
    return upperFirst(parts.at(parts.length > 1 ? -2 : 0));
  } catch {
    return title;
  }
};

export const googleSearchUrl = (query) =>
  `https://www.google.com/search?q=${encodeURIComponent(query)}`;
