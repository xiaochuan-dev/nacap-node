const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { join } = require('path');

/**
 * @type {import('webpack').Configuration}
 */
const config = {
  entry: './src/index.ts',
  output: {
    filename: '[name].js',
    path: join(__dirname, 'dist', 'client'),
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx']
  },
  optimization: {
    minimize: false
  },
  mode: 'production',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.tsx?/,
        use: 'ts-loader'
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              url: false
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin()
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all',
          priority: 10,
        }
      }
    }
  }
};

module.exports = config;
