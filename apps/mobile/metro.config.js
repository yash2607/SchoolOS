const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const { exclusionList } = require("metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Watch monorepo root
config.watchFolders = [workspaceRoot];

// Fix for pnpm
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

config.resolver.unstable_enableSymlinks = true;
config.resolver.disableHierarchicalLookup = true;

// Fix blocklist
config.resolver.blockList = exclusionList([
  /.*_tmp_.*\/.*/,
  /.*\.git\/.*/,
]);

module.exports = withNativeWind(config, {
  input: "./global.css", // ✅ KEEP SIMPLE (this is correct)
  inlineRem: 16,
});