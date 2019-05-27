## 以史为鉴
> 以铜为鉴，可以正衣冠；以人为鉴，可以明得失；以史为鉴，可以知兴替。

## 组合式开发
将不同的核心模块分别抽象，再根据项目需要最终组合在一起的开发方式。

## 开发前准备


### 示例项目列表

在进入具体的实战篇之前，先交代下后面实战篇中会涉及的示例项目：

1.  基础脚手架：[react-boilerplate](https://github.com/AlanWei/react-boilerplate)
2.  企业管理系统脚手架：[react-boilerplate-pro](https://github.com/AlanWei/react-boilerplate-pro)
3.  侧边栏组件：[react-sider](https://github.com/AlanWei/react-sider)
4.  包含鉴权的路由：[react-acl-router](https://github.com/AlanWei/react-acl-router)
5.  国际化多语言文件注入：[react-intl-context](https://github.com/AlanWei/react-intl-context)

### 拓展学习资料

1.  [AlanWei/blog](https://github.com/AlanWei/blog)：笔者的 GitHub 博客，里面有更多关于 React、组件库、前端数据层、服务端渲染的资料。
2.  [pure render](https://zhuanlan.zhihu.com/purerender)：阿里数据中台前端团队分享前端相关经验。
3.  [前端精读评论](https://zhuanlan.zhihu.com/FrontendPerusal)：阿里数据中台前端团队分享前端界的好文精读。
4.  [前端新能源](https://zhuanlan.zhihu.com/ne-fe)：分享前端有深度的新思想和新方法。
5.  [蚂蚁金服体验科技](https://zhuanlan.zhihu.com/xtech)：探索极致用户体验与最佳工程实践。

## 自研脚手架
> 本节参考代码：  
> [react-boilerplate](https://github.com/AlanWei/react-boilerplate)

在 React 生态中，虽然已经有了像 [`create-react-app`](https://github.com/facebook/create-react-app) 这样官方指定的脚手架项目，但为了深入理解一个前端脚手架所需要承担的责任与能够解决的问题，让我们删繁就简一起来搭建一个只包含最少依赖的功能齐全的项目脚手架。

### HTML

#### 在 HTML 中添加标题 `title`
将应用标题作为 webpack 插件中的一个变量注入到 HTML 模板中，需要选择一个模板语言来增强普通 HTML 的功能。这里我们以 [EJS](http://ejs.co/) 为例讲解如何实现变量注入。

```html
<title><%= htmlWebpackPlugin.options.title %></title>

```

除了 `title` 部分，我们还需要将 webpack 编译完成后的 JavaScript 与 CSS 的文件路径也注入到 HTML 模板中。

```html
<% for (var chunk in htmlWebpackPlugin.files.css) { %>
  <link rel="preload" href="<%= htmlWebpackPlugin.files.css[chunk] %>" as="style">
<% } %>
<% for (var chunk in htmlWebpackPlugin.files.chunks) { %>
  <link rel="preload" href="<%= htmlWebpackPlugin.files.chunks[chunk].entry %>" as="script">
<% } %>

```

除去变量注入外，EJS 等这类 HTML 模板语言还支持条件判断等编程语言的功能，如下面这段代码就实现了根据 webpack 配置来决定应用是否可以被搜索引擎检索。

```html
<% if (htmlWebpackPlugin.options.IS_SEO_ENABLED) { %>
<meta name="robots" content="index, follow">
<% } else { %>
<meta name="robots" content="noindex, nofollow">
<% } %>

```

### CSS

在 webpack 中合理地配置 CSS 的编译方式，使得 Sass（Less/stylus）、CSS 及 webpack 可以无缝衔接。

#### 项目中的 CSS：

```js
{
  test: /\.scss$/,
  exclude: /node_modules/,
  use: IS_PROD ? [
    MiniCssExtractPlugin.loader,
    {
      loader: 'css-loader',
      options: { minimize: true },
    },
    {
      loader: 'postcss-loader',
      options: {
        plugins: () => [autoprefixer({ browsers: 'last 5 versions' })],
        sourceMap: true,
      },
    },
    {
      loader: 'sass-loader',
      options: {
        includePaths: [
          SOURCE_DIR,
        ],
      },
    },
  ] : [
    {
      loader: 'style-loader',
      options: { singleton: true },
    },
    'css-loader',
    {
      loader: 'postcss-loader',
      options: {
        plugins: () => [autoprefixer({ browsers: 'last 5 versions' })],
        sourceMap: true,
      },
    },
    {
      loader: 'sass-loader',
      options: {
        includePaths: [
          SOURCE_DIR,
        ],
      },
    },
  ],
}

```

这里需要注意的有两点，一是 `sass-loader` 的 `includePaths` 设置为 `src/` 目录，这是为了项目中的 scss 文件可以方便地使用绝对路径相互引用，而不需要使用较为繁琐且不利于重构的相对路径。二是开发时使用 `style-loader` 而不是 `css-loader` 来加载 CSS，这是为了结合 `webpack-dev-server` 的热更新（hot reload）功能，在本地开发时将所有的 CSS 都直接内嵌至 HTML 中以加快热更新的速度。

#### node\_modules 中的 CSS：

```js
{
  test: /\.css$/,
  include: /node_modules/,
  use: [
    MiniCssExtractPlugin.loader,
    'css-loader',
    {
      loader: 'postcss-loader',
      options: {
        plugins: () => [autoprefixer({ browsers: 'last 5 versions' })],
        sourceMap: true,
      },
    },
  ],
}

```

在项目开发的过程中，我们很有可能还需要引入一些包含 CSS 的第三方库。这里需要注意的是，为了避免有些第三方库提供的 CSS 没有做浏览器兼容性处理，我们在加载 `node_moduels` 中的 CSS 之前还要使用 `postcss-loader` 再统一处理一遍，以确保所有进入生产环境的 CSS 都经过了相应的浏览器兼容性处理。

#### 样式变量与 mixin

正如前文中所提到的，CSS 作为独立的一部分一直以来受到前端工程化的影响都比较小。但与此同时许多开发者一味地追求开发效率，很多时候忽略了应该以一门编程语言的态度去对待 CSS。

最常见的例子就是对于 CSS 中颜色的处理，许多开发者都是直接复制设计稿中的十六进制代码，丝毫没有考虑到不同颜色在整体项目中的复用性与统一性。对于 mixin 的使用也是一样，例如卡片阴影等这些需要多个 CSS 属性组合的样式，很多时候也都是采取复制粘贴 CSS 代码的方式解决。

这些都是我们在实际开发中应该尽量去避免出现的问题。在样式表的根目录 `styles/` 文件夹中我们完全可以将这些通用的变量与 mixin 提前定义好：

```
// variables.scss
$grey-1: #ffffff !default;
$grey-2: #fafafa !default;
$grey-3: #f5f5f5 !default;
...

$blue-1: #e6f7ff !default;
$blue-2: #bae7ff !default;
$blue-3: #91d5ff !default;
...

// mixins.scss
@mixin text-ellipsis() {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

```

并在编写具体的页面样式时坚持不使用任何硬编码的值来保证项目样式的统一性，为后续维护中的样式变更打下良好的基础。

### 文件目录

从通用的角度来讲，一般一个完整的前端项目都至少需要包含以下九个部分：

1.  `layouts/`: 存放布局级别的组件
2.  `views/`: 存放页面级别的组件
3.  `components/`: 存放业务级别的 UI 组件
4.  `hocs/`: 存放业务级别的逻辑组件（看情况可与 `components/` 合并，但建议分开）
5.  `app/`: 存放应用级别的配置信息，如菜单、路由等，以及应用初始化的相关代码，如初始化 redux store 等
6.  `utils/`: 存放通用的功能性函数，如数据聚合、处理等
7.  `styles/`: 存放全局的 CSS 样式、变量、mixins 等
8.  `assets/`: 存放静态资源，如图标、图片等
9.  `i18n/`: 存放应用国际化需要的多语言文件

### 脚手架的维护

虽然在设计脚手架时的一大原则就是尽可能少地引入第三方依赖，但因为 React 并不是一个大而全的框架，所以在搭建脚手架时还是难免需要引入 redux、react-router、babel、webpack 等这些必需的第三方依赖。而在后续维护中，根据业务场景的不同我们可以有以下两种不同的维护方式。

一是稳定压倒一切，即不更新依赖，使用搭建完成的脚手架直到不能够满足业务的需要时再推倒重来。

二是及时更新，即对脚手架所有的第三方依赖进行定期（半个月或一个月）的升级，保证脚手架所使用的第三方依赖永远都是最新的稳定版本。对于业务场景并不复杂的企业来说，稳定压倒一切是提升生产力的不二法门。而对于大厂或者说业务场景较为复杂的企业来说，及时更新却是必须的。

做好技术基础设施建设是解决未来不可预见的技术难题的基础，技术项目的落后很多时候是一步落后，步步落后，在遇到具体问题时再去寻求完美的解决方案是不现实的。



## 页面布局方案


## 附录
### webpack配置

```js
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const autoprefixer = require('autoprefixer');
const path = require('path');
const pkg = require('./package.json');

const ENV = process.env.NODE_ENV || 'development';
const ASSET_PATH = process.env.ASSET_PATH || '/';
const VERSION = `v${pkg.version}`;
const IS_PROD = ENV === 'production';

const SOURCE_DIR = path.resolve(__dirname, 'src');
const OUTPUT_DIR = path.resolve(__dirname, 'build');
const CLIENT_DIR = path.join(OUTPUT_DIR, VERSION);

module.exports = {
  mode: ENV,
  target: 'web',
  context: SOURCE_DIR,
  entry: {
    client: './index.js',
  },
  output: {
    path: CLIENT_DIR,
    publicPath: ASSET_PATH,
    filename: 'assets/[name].[hash:8].js',
    libraryTarget: 'umd',
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
  module: {
    rules: [{
      test: /\.(jsx|js)$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
      },
    }, {
      test: /\.scss$/,
      exclude: /node_modules/,
      use: IS_PROD ? [
        MiniCssExtractPlugin.loader,
        'css-loader',
        {
          loader: 'postcss-loader',
          options: {
            plugins: () => [autoprefixer({ browsers: 'last 5 versions' })],
            sourceMap: true,
          },
        },
        {
          loader: 'sass-loader',
          options: {
            includePaths: [
              SOURCE_DIR,
            ],
          },
        },
      ] : [
        {
          loader: 'style-loader',
          options: { singleton: true },
        },
        'css-loader',
        {
          loader: 'postcss-loader',
          options: {
            plugins: () => [autoprefixer({ browsers: 'last 5 versions' })],
            sourceMap: true,
          },
        },
        {
          loader: 'sass-loader',
          options: {
            includePaths: [
              SOURCE_DIR,
            ],
          },
        },
      ],
    }, {
      test: /\.css$/,
      include: /node_modules/,
      use: [
        MiniCssExtractPlugin.loader,
        'css-loader',
        {
          loader: 'postcss-loader',
          options: {
            plugins: () => [autoprefixer({ browsers: 'last 5 versions' })],
            sourceMap: true,
          },
        },
      ],
    }, {
      test: /\.(svg|woff2?|ttf|eot|jpe?g|png|gif)(\?.*)?$/i,
      use: IS_PROD ? {
        loader: 'file-loader',
        options: {
          name: '[name].[hash:8].[ext]',
          outputPath: 'assets/images/',
        },
      } : {
        loader: 'url-loader',
      },
    }],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'assets/css/style.[hash:8].css',
      chunkFilename: 'assets/css/[id].[hash:8].css',
    }),
    new CopyWebpackPlugin([
      { from: 'favicon.ico' },
    ]),
    new HtmlWebpackPlugin({
      title: 'React App',
      filename: './index.html',
      template: './index.ejs',
    }),
  ],
  devtool: IS_PROD ? 'source-map' : 'eval-source-map',
  devServer: {
    port: process.env.PORT || 8080,
    host: 'localhost',
    publicPath: '/',
    contentBase: SOURCE_DIR,
    historyApiFallback: true,
  },
};

```