import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.join(__dirname, "../version.json");

const getCurrentBranch = () => {
  return execSync("git rev-parse --abbrev-ref HEAD").toString().trim();
};

const getIndianDateTime = () => {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  };

  return new Date().toLocaleString("en-IN", options);
};

const branch = getCurrentBranch();
const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
const current = data.version.split(".").map(Number);

if (branch === "main") {
  current[0]++;
  current[1] = 0;
  current[2] = 0;
} else if (branch === "stage") {
  current[1]++;
  current[2] = 0;
} else if (branch === "dev-2") {
  current[2]++;
} else {
  console.log("No version bump needed for branch:", branch);
  process.exit(0);
}

const newVersion = current.join(".");
data.version = newVersion;
data.lastMergeDate = getIndianDateTime();

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log(`✅ Version bumped to ${newVersion}`);
console.log(`✅ Last merge time (IST): ${data.lastMergeDate}`);
