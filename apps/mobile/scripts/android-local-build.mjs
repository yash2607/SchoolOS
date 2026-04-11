import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const workspaceRoot = path.resolve(projectRoot, "../..");

const args = process.argv.slice(2);
const target = args[0];
const clean = args.includes("--clean");

if (!["apk", "aab"].includes(target)) {
  console.error("Usage: node ./scripts/android-local-build.mjs <apk|aab> [--clean]");
  process.exit(1);
}

const artifactLabel = target === "apk" ? "APK" : "AAB";
const gradleTask = target === "apk" ? "app:assembleRelease" : "app:bundleRelease";

function run(command, commandArgs, options = {}) {
  const result = spawnSync(command, commandArgs, {
    cwd: projectRoot,
    stdio: "inherit",
    ...options,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log("Building workspace packages...");
if (process.platform === "win32") {
  run("cmd.exe", ["/c", "pnpm", "--dir", workspaceRoot, "run", "build:packages"]);
} else {
  run("pnpm", ["--dir", workspaceRoot, "run", "build:packages"]);
}

console.log(`Generating Android native project${clean ? " (clean)" : ""}...`);
run(process.execPath, [
  path.resolve(workspaceRoot, "node_modules/expo/bin/cli"),
  "prebuild",
  "--platform",
  "android",
  ...(clean ? ["--clean"] : []),
]);

console.log(`Running Gradle ${gradleTask}...`);
if (process.platform === "win32") {
  run("cmd.exe", ["/c", "gradlew.bat", gradleTask], {
    cwd: path.join(projectRoot, "android"),
  });
} else {
  run("./gradlew", [gradleTask], {
    cwd: path.join(projectRoot, "android"),
  });
}

const artifactPath =
  target === "apk"
    ? path.join(projectRoot, "android", "app", "build", "outputs", "apk", "release", "app-release.apk")
    : path.join(projectRoot, "android", "app", "build", "outputs", "bundle", "release", "app-release.aab");

console.log(`${artifactLabel} build complete: ${artifactPath}`);
