// Runs before `npm run build:prod`: bumps the minor version in manifest.json,
// commits it, and removes the previous build output (dist/ and dist.zip).
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const manifestPath = path.join(root, "manifest.json");

const raw = fs.readFileSync(manifestPath, "utf8");
const { version } = JSON.parse(raw);

const parts = version.split(".").map(Number);
if (parts.length < 2 || parts.some((n) => !Number.isInteger(n))) {
  throw new Error(`Unsupported manifest version "${version}"`);
}
const nextVersion = parts
  .map((n, i) => (i === 1 ? n + 1 : i > 1 ? 0 : n))
  .join(".");

// Replace only the version string so the rest of the file's formatting is untouched.
fs.writeFileSync(
  manifestPath,
  raw.replace(/("version"\s*:\s*")[^"]+(")/, `$1${nextVersion}$2`)
);
console.log(`Bumped manifest.json version: ${version} -> ${nextVersion}`);

execFileSync(
  "git",
  [
    "commit",
    "-m",
    `Update: Bump version to ${nextVersion} in manifest.json`,
    "--",
    "manifest.json",
  ],
  { cwd: root, stdio: "inherit" }
);

fs.rmSync(path.join(root, "dist"), { recursive: true, force: true });
fs.rmSync(path.join(root, "dist.zip"), { force: true });
console.log("Removed dist/ and dist.zip");
