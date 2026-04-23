module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@/components': './src/components',
            '@/services': './src/services',
            '@/hooks': './src/hooks',
            '@/contexts': './src/contexts',
            '@/theme': './src/theme',
            '@/types': './src/types',
            '@/utils': './src/utils',
            '@/config': './src/config',
          },
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      ],
    ],
  };
};
