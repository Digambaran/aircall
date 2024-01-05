const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const InlineChunkHtmlPlugin = require('inline-chunk-html-plugin');

console.log(process.argv);
var isProd = true;
module.exports = {
   module: {
      rules: [
         {
            oneOf: [
               {
                  test: /\.html$/,
                  use: [
                     {
                        loader: 'html-loader',
                        options: { minimize: true },
                     },
                  ],
               },

               {
                  test: /\.module\.css$/,
                  include: path.resolve(__dirname, 'src'),
                  use: [
                     {
                        /**
                         * To use mini-css-extract-plugin here, include it also in plugin entry
                         * MARK-666
                         */
                        loader: isProd ? MiniCssExtractPlugin.loader : 'style-loader',
                     },
                     {
                        loader: 'css-loader',
                        /**
                         * https://webpack.js.org/loaders/css-loader/#modules
                         * refer ablove link for details
                         * for local scoping and scoped hashed names for class and ids
                         */
                        options: {
                           modules: {
                              mode: 'local',
                              auto: true,
                              localIdentName: isProd ? '[hash:base64]' : '[path][name]__[local]--[hash:base64:5]',
                              localIdentContext: path.resolve(__dirname, 'src'),
                              localIdentHashSalt: 'digambaran',
                              /**
                               * style class like .foo-baz will be a names export as fooBaz in import
                               */
                              namedExport: true,
                              exportGlobals: false,
                              exportLocalsConvention: 'camelCaseOnly',
                              // used for pre rendering - set to true
                              exportOnlyLocals: false,
                           },
                        },
                     },
                  ],
               },
               isProd
                  ? {
                       /**
                        * If in production, minify css and put it into a static file for serving
                        */
                       test: /\.css$/,
                       use: [
                          {
                             loader: MiniCssExtractPlugin.loader,
                          },
                          {
                             loader: 'css-loader',
                             options: {
                                modules: {
                                   exportGlobals: false,
                                },
                             },
                          },
                       ],
                    }
                  : {
                       test: /\.css$/,
                       use: ['style-loader', 'css-loader'],
                    },
               {
                  test: /\.(js|jsx)$/,
                  exclude: /node_modules/,
                  loader: 'babel-loader',
                  exclude: /node_modules/,
                  options: {
                     presets: [
                        '@babel/preset-env',
                        [
                           '@babel/preset-react',
                           {
                              /**
                               * "automatic" option lets us to not import react into scope just to
                               * use JSX. In "classic" option, React needs to be in scope everywhere
                               * you use JSX. Introduced in React 17.
                               */
                              runtime: 'automatic',
                           },
                        ],
                     ],
                     /**
                      * This is a feature of `babel-loader` for webpack (not Babel itself).
                      * It enables caching results in ./node_modules/.cache/babel-loader/
                      * directory for faster rebuilds.
                      *  */
                     cacheDirectory: true,
                     cacheCompression: false,
                     compact: true,
                  },
               },
            ],
         },
      ],
   },
   optimization: Object.assign(
      {},
      isProd && {
         splitChunks: {
            cacheGroups: {
               vendor: {
                  /**
                   * extract react & react-dom into a new chunk for caching
                   */
                  test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
                  name: 'vendor',
                  chunks: 'all',
               },
            },
         },
         runtimeChunk: {
            name: 'runtime',
         },
      }
   ),
   resolve: {
      /**
       * If .js is not included here, webpack will run into error
       * because all the internal libraries importing js files wont
       * be able to resolve files and errors like this:
       * ERROR in ./node_modules/.pnpm/webpack@5.89.0_@swc+core@1.3.96_webpack-cli@5.1.4/node_modules/webpack/hot/dev-server.js 64:18-38
       * Module not found: Error: Can't resolve './emitter' in 'C:\Users\arjun\Documents\Dev\JS\React\otpwidget\node_modules\.pnpm\webpack@5.89.0_@swc+core@1.3.96_webpack-cli@5.1.4\node_modules\webpack\hot'
       */
      extensions: ['.tsx', '.ts', '.js', '.jsx'],
      alias: {
         styles: path.resolve(__dirname, 'src/css'),
      },
   },
   output: {
      path: path.resolve(__dirname, 'dist'),
      /**
       * If you don't include this, you might get an error like:
       * Automatic publicPath is not supported in this browser
       */
      publicPath: '',
      /**
       * clean can be configured to move changing files into an ignored/ folder,
       * or use "dry" option to log changing file names etc..
       * true => will overwrite changed files
       */
      clean: true,
      // There will be one main bundle, and one file per asynchronous chunk.
      // In development, it does not produce real files.
      filename: isProd ? 'static/js/[name].[contenthash:8].js' : 'static/js/bundle.js',
      // There are also additional JS chunk files if you use code splitting.
      chunkFilename: isProd ? 'static/js/[name].[contenthash:8].chunk.js' : 'static/js/[name].chunk.js',
      assetModuleFilename: 'static/media/[name].[hash][ext]',
   },
   plugins: [
      new HtmlWebPackPlugin(
         /**
          * HTMLWebpackPlugin on the base level is simply a tool that adds the bundle created by
          * the bundler ( webpack in this case ) and add it to the script tag in an html file, index.html by default
          * can also be used to add tags at different places, there are plugins for this plugin!! -- ( https://github.com/jantimon/html-webpack-plugin#plugins )
          * and can also be used to minify using html-minifier-terser -- ( https://github.com/terser/html-minifier-terser )
          */ Object.assign(
            {},
            {
               template: 'public/index.html',
               inject: true,
            },
            isProd
               ? {
                    /**
                     * minifyJS is applied to the JS inside <script> tag, it is different from terser or swc or esbuild minify.
                     *  -they minify the bundle itself. webpack 5 comes with terser builtin, so unless custom conf is to be provided,
                     *  -no need to add it to plugins.
                     * minifyCSS applies to CSS in <style> tag, not the css files if extracting css ( mini-css-extract-plugin ) is used ( in production ),
                     *  -in dev, style-loader injects css to <style> tag. so it can be minimized if needed.
                     */
                    minify: {
                       collapseWhitespace: true,
                       keepClosingSlash: true,
                       minifyJS: true,
                       minifyCSS: true,
                       minifyURLs: true,
                       removeComments: true,
                       removeRedundantAttributes: true,
                       removeStyleLinkTypeAttributes: true,
                       removeScriptTypeAttributes: true,
                       removeEmptyAttributes: true,
                       useShortDoctype: true,
                    },
                 }
               : undefined
         )
      ),
      new InlineChunkHtmlPlugin(HtmlWebPackPlugin, [/runtime.+[.]js/]),
      new MiniCssExtractPlugin({
         filename: isProd ? 'static/css/[name].[contenthash:8].css' : 'static/css/main.css',
         chunkFilename: isProd ? 'static/css/[name].[contenthash:8].chunk.css' : 'static/css/[name].chunk.css',
      }),
   ],
   devtool: isProd ? false : 'source-map',
};
