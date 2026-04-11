const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// getDefaultConfig sets config.server.unstable_serverRoot to the pnpm workspace
// root (monorepo root) via getMetroServerRoot(). Metro resolves the entry file
// relative to serverRoot. The Gradle bundle command passes the entry file as
// ./../../node_modules/expo-router/entry.js (relative to apps/mobile), so
// resolving from the monorepo root goes two levels above it and fails.
// Override serverRoot to apps/mobile so the entry file resolves correctly to
// SchoolOS/node_modules/expo-router/entry.js.
config.server = {
  ...config.server,
  unstable_serverRoot: projectRoot,
};

config.watchFolders = [workspaceRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

config.resolver.unstable_enableSymlinks = true;
config.resolver.disableHierarchicalLookup = true;

config.resolver.blockList = [
  /.*_tmp_.*\/.*/,
  /.*\.git\/.*/,
];

module.exports = withNativeWind(config, {
  input: path.join(projectRoot, "global.css"),
  configPath: path.join(projectRoot, "tailwind.config.js"),
  inlineRem: 16,
});
