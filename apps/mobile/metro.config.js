const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Only watch the mobile app directory, not the entire monorepo
config.watchFolders = [projectRoot];

// Only resolve modules from the mobile app's node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
];

// Block the root node_modules to prevent conflicts
config.resolver.blockList = [
  // Block all react-native from root node_modules
  new RegExp(`${workspaceRoot.replace(/[\\]/g, '/')}/node_modules/react-native/.*`),
  new RegExp(`${workspaceRoot.replace(/[\\]/g, '/')}/node_modules/react/.*`),
  // Block the entire root node_modules except for what's needed
  new RegExp(`${workspaceRoot.replace(/[\\]/g, '/')}/node_modules/(?!(@babel|@expo)/).*`),
];

module.exports = config;
