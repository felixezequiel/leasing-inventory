const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// 1. Adicionar pasta shared aos watchFolders
config.watchFolders = [
  path.resolve(workspaceRoot, 'shared')
];

// 2. Configurar resolver para symlinks e aliases de caminho
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules')
];

// 3. Configurar aliases de caminho
config.resolver.extraNodeModules = {
  '@': path.resolve(projectRoot, 'src'),
  '@shared': path.resolve(workspaceRoot, 'shared')
};

// 4. Habilitar symlinks
config.resolver.disableHierarchicalLookup = true;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Resolver personalizado para arquivos específicos, se necessário
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config; 