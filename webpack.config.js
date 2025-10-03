const path = require('path');
const webpack = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    mode: isProduction ? 'production' : 'development',
    
    entry: {
      main: './packages/ui/src/main.tsx',
      desktop: './apps/desktop/src/index.ts',
      terminal: './apps/terminal/src/index.ts',
      debugger: './apps/debugger/src/index.ts'
    },
    
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? '[name].[contenthash].js' : '[name].js',
      chunkFilename: isProduction ? '[name].[contenthash].chunk.js' : '[name].chunk.js',
      clean: true,
      publicPath: '/',
      // Optimize for long-term caching
      assetModuleFilename: 'assets/[name].[contenthash][ext]'
    },
    
    resolve: {
      extensions: ['.tsx', '.ts', '.jsx', '.js'],
      alias: {
        '@auraos/core': path.resolve(__dirname, 'packages/core/src'),
        '@auraos/ui': path.resolve(__dirname, 'packages/ui/src'),
        '@auraos/ai': path.resolve(__dirname, 'packages/ai/src'),
        '@auraos/hooks': path.resolve(__dirname, 'packages/hooks/src'),
        '@auraos/common': path.resolve(__dirname, 'packages/common/src'),
        '@auraos/desktop': path.resolve(__dirname, 'apps/desktop/src'),
        '@auraos/terminal': path.resolve(__dirname, 'apps/terminal/src'),
        '@auraos/debugger': path.resolve(__dirname, 'apps/debugger/src')
      }
    },
    
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                transpileOnly: true,
                experimentalWatchApi: true
              }
            }
          ],
          exclude: /node_modules/
        },
        {
          test: /\.(js|jsx)$/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: [
                  ['@babel/preset-env', { targets: 'defaults' }],
                  ['@babel/preset-react', { runtime: 'automatic' }]
                ],
                plugins: [
                  // Remove console.log in production
                  isProduction && ['transform-remove-console', { exclude: ['error', 'warn'] }]
                ].filter(Boolean)
              }
            }
          ],
          exclude: /node_modules/
        },
        {
          test: /\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            'postcss-loader'
          ]
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/i,
          type: 'asset',
          parser: {
            dataUrlCondition: {
              maxSize: 8 * 1024 // 8KB
            }
          }
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource'
        }
      ]
    },
    
    plugins: [
      new webpack.DefinePlugin({
        __DEV__: JSON.stringify(!isProduction),
        __PROD__: JSON.stringify(isProduction),
        __VERSION__: JSON.stringify(process.env.npm_package_version)
      }),
      
      new webpack.ProvidePlugin({
        React: 'react'
      }),
      
      // CSS extraction
      isProduction && new MiniCssExtractPlugin({
        filename: '[name].[contenthash].css',
        chunkFilename: '[name].[contenthash].chunk.css'
      }),
      
      // Bundle analyzer
      process.env.ANALYZE && new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        openAnalyzer: false,
        generateStatsFile: true,
        statsFilename: 'bundle-stats.json',
        reportFilename: 'bundle-report.html'
      })
    ].filter(Boolean),
    
    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: isProduction,
              drop_debugger: isProduction,
              pure_funcs: isProduction ? ['console.log', 'console.info'] : []
            },
            mangle: {
              keep_classnames: false,
              keep_fnames: false
            }
          },
          extractComments: false
        }),
        new CssMinimizerPlugin()
      ],
      
      // Split chunks for better caching
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          // Vendor chunks
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react-vendor',
            chunks: 'all',
            priority: 20
          },
          router: {
            test: /[\\/]node_modules[\\/](react-router|react-router-dom)[\\/]/,
            name: 'router-vendor',
            chunks: 'all',
            priority: 19
          },
          ui: {
            test: /[\\/]node_modules[\\/](framer-motion|@tanstack)[\\/]/,
            name: 'ui-vendor',
            chunks: 'all',
            priority: 18
          },
          utils: {
            test: /[\\/]node_modules[\\/](lodash|date-fns|uuid)[\\/]/,
            name: 'utils-vendor',
            chunks: 'all',
            priority: 17
          },
          // App chunks
          desktop: {
            test: /[\\/]apps[\\/]desktop[\\/]/,
            name: 'desktop-app',
            chunks: 'all',
            priority: 15
          },
          terminal: {
            test: /[\\/]apps[\\/]terminal[\\/]/,
            name: 'terminal-app',
            chunks: 'all',
            priority: 14
          },
          debugger: {
            test: /[\\/]apps[\\/]debugger[\\/]/,
            name: 'debugger-app',
            chunks: 'all',
            priority: 13
          },
          // Core chunks
          core: {
            test: /[\\/]packages[\\/](core|ai|hooks|common)[\\/]/,
            name: 'core',
            chunks: 'all',
            priority: 12
          },
          // Default chunk
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true
          }
        }
      },
      
      // Runtime chunk for better caching
      runtimeChunk: {
        name: 'runtime'
      }
    },
    
    // Performance hints
    performance: {
      hints: isProduction ? 'warning' : false,
      maxEntrypointSize: 500000,
      maxAssetSize: 500000
    },
    
    // Source maps
    devtool: isProduction ? 'source-map' : 'eval-source-map',
    
    // Development server
    devServer: {
      static: {
        directory: path.join(__dirname, 'public')
      },
      compress: true,
      port: 3000,
      hot: true,
      historyApiFallback: true,
      // Enable gzip compression
      compress: true,
      // Optimize file watching
      watchFiles: {
        paths: ['packages/**/*', 'apps/**/*'],
        options: {
          usePolling: false,
          ignored: ['**/node_modules/**', '**/dist/**']
        }
      }
    }
  };
};
