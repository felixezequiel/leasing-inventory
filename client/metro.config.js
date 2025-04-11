const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add the shared directory to watch folders
config.watchFolders = [
  path.resolve(__dirname, '../shared')
];

// Configure resolver for path aliases
config.resolver.extraNodeModules = {
  '@': path.resolve(__dirname, 'src'),
  '@shared': path.resolve(__dirname, '../shared')
};

module.exports = config; 