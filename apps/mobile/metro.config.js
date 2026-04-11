const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const { exclusionList } = require("metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Watch monorepo root
config.watchFolders = [workspaceRoot];

// Resolve node_modules properly for pnpm
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// Required for pnpm + monorepo
config.resolver.unstable_enableSymlinks = true;
config.resolver.disableHierarchicalLookup = true;

// Keep default blockList + add custom
config.resolver.blockList = exclusionList([
  /.*_tmp_.*\/.*/,
  /.*\.git\/.*/,
]);

module.exports = withNativeWind(config, {
  input: path.resolve(projectRoot, "global.css"), // IMPORTANT for EAS
  inlineRem: 16,
});