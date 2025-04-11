module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            '@': './src',
            '@shared': '../shared'
          },
          extensions: ['.js', '.jsx', '.ts', '.tsx']
        }
      ],
      '@babel/plugin-transform-runtime'
    ]
  };
}; 