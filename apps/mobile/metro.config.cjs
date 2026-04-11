const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// getDefaultConfig sets unstable_serverRoot to the pnpm workspace root
// (monorepo root), but the Gradle bundle command passes the entry file as a
// path relative to apps/mobile. Metro resolves it from serverRoot, so if
// serverRoot is the monorepo root, `./../../node_modules/expo-router/entry.js`
// goes two levels ABOVE the monorepo root and fails. Force serverRoot back to
// projectRoot so Metro resolves from apps/mobile correctly.
config.unstable_serverRoot = projectRoot;

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
