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

// Find the best CMake version in the SDK (3.25+ has longPathAware manifest)
function findBestCmakePath(sdkRoot) {
  if (!sdkRoot) return null;
  const cmakeRoot = path.join(sdkRoot, "cmake");
  if (!fs.existsSync(cmakeRoot)) return null;
  const versions = fs.readdirSync(cmakeRoot)
    .filter(v => fs.statSync(path.join(cmakeRoot, v)).isDirectory())
    .sort()
    .reverse(); // newest first
  for (const v of versions) {
    const parts = v.split(".").map(Number);
    if (parts[0] > 3 || (parts[0] === 3 && parts[1] >= 25)) {
      return path.join(cmakeRoot, v);
    }
  }
  return null;
}

function writeLocalProperties() {
  if (!fs.existsSync(androidDir)) return;
  const lines = [];
  if (sdkDir) lines.push(`sdk.dir=${sdkDir.replace(/\\/g, "\\\\")}`);
  const cmakePath = findBestCmakePath(sdkDir);
  if (cmakePath) {
    lines.push(`cmake.dir=${cmakePath.replace(/\\/g, "\\\\")}`);
    console.log(`Using CMake: ${cmakePath}`);
  }
  fs.writeFileSync(localPropsPath, lines.join("\n") + "\n");
}

writeLocalProperties();

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
writeLocalProperties();

// expo-updates' convertEntryPointToRelative strips the path to just
// `node_modules/expo-router/entry.js`, then Metro looks for it at
// apps/mobile/node_modules/expo-router — which doesn't exist with shamefully-hoist.
// Fix: create a junction so the path resolves correctly. Node.js junctions on
// Windows don't require admin privileges.
const mobileNodeModulesDir = path.join(projectRoot, "node_modules");
const expoRouterLink = path.join(mobileNodeModulesDir, "expo-router");
const expoRouterSrc = path.join(workspaceRoot, "node_modules", "expo-router");
if (fs.existsSync(expoRouterSrc) && !fs.existsSync(expoRouterLink)) {
  fs.mkdirSync(mobileNodeModulesDir, { recursive: true });
  fs.symlinkSync(expoRouterSrc, expoRouterLink, "junction");
  console.log(`Created junction: ${expoRouterLink}`);
}

console.log(`Running Gradle ${gradleTask}...`);
const gradleEnv = {
  ...process.env,
  // Tell Expo CLI the correct project root so Metro doesn't use monorepo root
  EXPO_PROJECT_ROOT: projectRoot,
};
if (process.platform === "win32") {
  const gradlewBat = path.join(androidDir, "gradlew.bat");
  run("cmd.exe", ["/c", gradlewBat, gradleTask], {
    cwd: androidDir,
    env: gradleEnv,
  });
} else {
  run("./gradlew", [gradleTask], {
    cwd: androidDir,
    env: gradleEnv,
  });
}

const artifactPath =
  target === "apk"
    ? path.join(projectRoot, "android", "app", "build", "outputs", "apk", "release", "app-release.apk")
    : path.join(projectRoot, "android", "app", "build", "outputs", "bundle", "release", "app-release.aab");

console.log(`\n✅ ${artifactLabel} build complete!`);
console.log(`   ${artifactPath}`);
