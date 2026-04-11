import { spawnSync, execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

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

// --- Auto-detect ANDROID_HOME ---
const KNOWN_ANDROID_SDK_PATHS = [
  path.join(process.env.LOCALAPPDATA || "", "Android", "Sdk"),
  path.join(process.env.HOME || process.env.USERPROFILE || "", "Android", "Sdk"),
  "/usr/lib/android-sdk",
  "/opt/android-sdk",
];

if (!process.env.ANDROID_HOME && !process.env.ANDROID_SDK_ROOT) {
  for (const candidate of KNOWN_ANDROID_SDK_PATHS) {
    if (candidate && fs.existsSync(candidate)) {
      console.log(`Auto-detected ANDROID SDK at: ${candidate}`);
      process.env.ANDROID_HOME = candidate;
      process.env.ANDROID_SDK_ROOT = candidate;
      break;
    }
  }
}

// --- Auto-detect JAVA_HOME (Windows) ---
if (!process.env.JAVA_HOME && process.platform === "win32") {
  const KNOWN_JAVA_PATHS = [
    "C:\\Program Files\\Microsoft\\jdk-17.0.18.8-hotspot",
    "C:\\Program Files\\Eclipse Adoptium\\jdk-17",
    "C:\\Program Files\\Java\\jdk-17",
    "C:\\Program Files\\Java\\jdk-21",
    "C:\\Program Files\\Microsoft\\jdk-21",
  ];
  for (const candidate of KNOWN_JAVA_PATHS) {
    if (fs.existsSync(path.join(candidate, "bin", "java.exe"))) {
      console.log(`Auto-detected JAVA_HOME at: ${candidate}`);
      process.env.JAVA_HOME = candidate;
      break;
    }
  }
}

// Ensure local.properties has the sdk.dir for Gradle
const androidDir = path.join(projectRoot, "android");
const localPropsPath = path.join(androidDir, "local.properties");
const sdkDir = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
if (sdkDir && fs.existsSync(androidDir)) {
  const escaped = sdkDir.replace(/\\/g, "\\\\");
  fs.writeFileSync(localPropsPath, `sdk.dir=${escaped}\n`);
}

function run(command, commandArgs, options = {}) {
  const result = spawnSync(command, commandArgs, {
    cwd: projectRoot,
    stdio: "inherit",
    env: process.env,
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

// Write local.properties again after prebuild (in case it was regenerated)
if (sdkDir && fs.existsSync(androidDir)) {
  const escaped = sdkDir.replace(/\\/g, "\\\\");
  fs.writeFileSync(localPropsPath, `sdk.dir=${escaped}\n`);
}

console.log(`Running Gradle ${gradleTask}...`);
if (process.platform === "win32") {
  const gradlewBat = path.join(androidDir, "gradlew.bat");
  run("cmd.exe", ["/c", gradlewBat, gradleTask], {
    cwd: androidDir,
  });
} else {
  run("./gradlew", [gradleTask], {
    cwd: androidDir,
  });
}

const artifactPath =
  target === "apk"
    ? path.join(projectRoot, "android", "app", "build", "outputs", "apk", "release", "app-release.apk")
    : path.join(projectRoot, "android", "app", "build", "outputs", "bundle", "release", "app-release.aab");

console.log(`\n✅ ${artifactLabel} build complete!`);
console.log(`   ${artifactPath}`);
