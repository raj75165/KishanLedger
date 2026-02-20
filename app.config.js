// Dynamic Expo configuration.
// EXPO_BASE_URL is set in CI (GitHub Actions) to "/KishanLedger" for GitHub Pages.
// It is empty locally, so `bun run web` and `bun run export:web` work at the root path.
const baseConfig = require('./app.json').expo;

module.exports = {
  expo: {
    ...baseConfig,
    plugins: baseConfig.plugins.map((plugin) => {
      if (Array.isArray(plugin) && plugin[0] === 'expo-router') {
        return [
          'expo-router',
          {
            ...plugin[1],
            baseUrl: process.env.EXPO_BASE_URL || '',
          },
        ];
      }
      return plugin;
    }),
  },
};
