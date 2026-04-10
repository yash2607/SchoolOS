const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// 1. Watch all workspace packages so Metro picks up changes
config.watchFolders = [workspaceRoot];

// 2. Tell Metro to resolve from workspace root first (monorepo pnpm support)
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// 3. Required for pnpm symlinks — follow symlinks to workspace packages
config.resolver.unstable_enableSymlinks = true;

// 4. Block temp build dirs (flash-list native build creates _tmp_ dirs that Metro
//    tries to watch, then they disappear, causing ENOENT crashes)
config.resolver.blockList = [
  /.*_tmp_.*\/.*/,
  /.*\.git\/.*/,
];

// 5. Wrap with NativeWind (processes global.css → CSS-in-JS)
module.exports = withNativeWind(config, {
  input: "./global.css",
  inlineRem: 16,
});
