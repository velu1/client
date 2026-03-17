import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
// Get the directory name in ESM
var __dirname = path.dirname(fileURLToPath(import.meta.url));
var filePath = path.join(__dirname, "../version.json");
var getCurrentBranch = function () {
    return execSync("git rev-parse --abbrev-ref HEAD").toString().trim();
};
var branch = getCurrentBranch();
var data = JSON.parse(fs.readFileSync(filePath, "utf8"));
var current = data.version.split(".").map(Number);
if (branch === "main") {
    current[0]++;
    current[1] = 0;
    current[2] = 0;
}
else if (branch === "stage") {
    current[1]++;
    current[2] = 0;
}
else if (branch === "dev") {
    current[2]++;
}
else {
    console.log("No version bump needed for branch:", branch);
    process.exit(0);
}
var newVersion = current.join(".");
data.version = newVersion;
fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log("\u2705 Version bumped to ".concat(newVersion));
