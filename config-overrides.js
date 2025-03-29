const webpack = require('webpack');

module.exports = function override(config) {
  // Example alias/fallback usage, kept minimal
  config.resolve.alias = {
    ...config.resolve.alias,
    'process/browser': require.resolve('./src/shims/process-shim.js'),
  };
  config.resolve.fallback = {
    ...config.resolve.fallback,
    buffer: require.resolve('buffer'),
    process: require.resolve('process/browser'),
  };
  config.resolve.extensions = [...config.resolve.extensions, '.js'];

  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),
  ];

  return config;
};
