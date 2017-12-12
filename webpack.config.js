var path = require('path');
var glob = require('glob');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');//将你的行内样式提取到单独的css文件里，
var HtmlWebpackPlugin = require('html-webpack-plugin'); //html模板生成器
var CleanPlugin = require('clean-webpack-plugin'); // 文件夹清除工具
var CopyWebpackPlugin = require('copy-webpack-plugin'); // 文件拷贝
var OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');//压缩css
var UglifyJSPlugin = require('uglifyjs-webpack-plugin');//压缩js

//取npm run 后的值
var currentTarget = process.env.npm_lifecycle_event;
//基本路径
const PATHS = {
    node_modulesPath: path.resolve('./node_modules'),
    libPath: path.resolve('src/libs/'),
    staticPath: path.resolve('src/static/')
};
//获取 html 多模块入口文件
var file_html = getEntry('./src/*.html','./src/');
var file_js = getEntry('./src/static/js/*.js','./src/static/js/');
var pages = Object.keys(file_html);

var resolve = {
    enforceExtension: false,
    alias: {
        jquery:  path.resolve(PATHS.libPath,  '/jquery-1.12.4.js'),
        modules: PATHS.node_modulesPath,
        static: PATHS.staticPath, //静态资源路径
        libs: PATHS.libPath, //第三方库文件路径
    },
    extensions: ['.html', '.js', '.less', '.css'],
    modules: ["node_modules"]
};
//入口
var entry = Object.assign(file_js);
var output = {
    path: path.join(__dirname, 'build'),//（输出目录）
    // publicPath: '/',	//模板、样式、脚本、图片等资源对应的server上的路径
    filename: 'static/js/[name]-[hash:6].js' //文件名称
};
var loaders = [
    {
        test: /\.less$/,
        loader: ExtractTextPlugin.extract('css-loader!css-loader')
    },
    {
        test: /\.(woff|woff2|ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'file-loader?name=static/fonts/[name].[ext]'
    },
    {
        test: /\.(png|jpg|gif)$/,
        loader: 'url-loader',
        query: {
            limit: 30720, //30kb 图片转base64。设置图片大小，小于此数则转换。
            name: './static/images/[name].[ext]?' //输出目录以及名称
        }
    },
    {test: /\.css$/, loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader' }) },
    {test: /\.html$/, loader: 'html-loader'}
];
var plugins = [
    new webpack.ProvidePlugin({ //全局配置加载
        $: "jquery",
        jQuery: "jquery",
        "window.jQuery": "jquery"
    }),
    new CleanPlugin(['build']),// 清空dist文件夹
    new webpack.optimize.CommonsChunkPlugin({
        name: 'common', // 将公共模块提取，生成名为`vendors`的chunk
        minChunks: 3 // 提取至少3个模块共有的部分
    }),
    new ExtractTextPlugin( "static/css/[name]-[hash:6].css"), //提取CSS行内样式，转化为link引入
    // new HtmlWebpackPlugin({
    //     filename: 'index.html',
    //     template: __dirname + '/src/index.html',
    //     inject: 'body',
    //     // 需要依赖的模块
    //     chunks: ['common', 'index'],
    //     // 根据依赖自动排序
    //     chunksSortMode: 'dependency'
    // }),
    new CopyWebpackPlugin([{
        from: './src/libs/layui',
        to: './libs/layui'
    }]),
    new CopyWebpackPlugin([{
        from: './src/static/images',
        to: './static/images'
    }]),
];
if(currentTarget == "build"){
    plugins.push(
        new UglifyJSPlugin({ //js压缩
            uglifyOptions:{
                ie8:true,
                ecma:5,
                output: {
                    comments: false
                },
                warnings: false
            }
        }),
        new OptimizeCssAssetsPlugin({ //压缩css
            cssProcessorOptions: {
                discardComments: {
                    removeAll: true
                }
            },
            canPrint: false
        })
    );
}
//浏览器打开，代理
var devServer = {
    historyApiFallback: true,
    inline: false,
    stats: { colors: true },
    host:'0.0.0.0',
    port: 3000,
    contentBase: './build'
    // proxy: {
    //     '/taskManage': {
    //         target: 'http://192.168.1.105:8080',
    //         pathRewrite: {'^/taskManage' : '/taskManage'},
    //         changeOrigin: true
    //     }
    // }
};
//生成HTML模板
pages.forEach(function(pathname) {
    var itemName  = pathname.split('\\'); //根据系统路径来取文件名,window下的做法//,其它系统另测
    var conf = {
        filename: pathname + '.html', //生成的html存放路径，相对于path
        template: path.resolve(__dirname, './src/' + pathname + '.html'), //html模板路径
        inject: true, //允许插件修改哪些内容，包括head与body
        hash: false, //是否添加hash值
        chunks: ['common', pathname],
        minify: { //压缩HTML文件
            removeComments: true,//移除HTML中的注释
            collapseWhitespace: false //删除空白符与换行符
        }
    };
    plugins.push(new HtmlWebpackPlugin(conf));
});
//基本配置
var config = {
    entry: entry,
    output: output,
    module: {
        rules: loaders
    },
    resolve: resolve,
    plugins: plugins,
    //使用webpack-dev-server服务器，提高开发效率
    devServer: devServer
};

module.exports = config;

//按文件名来获取入口文件（即需要生成的模板文件数量）
function getEntry(globPath, pathDir) {
    var files = glob.sync(globPath);
    var entries = {},
        entry, dirname, basename, pathname, extname;

    for (var i = 0; i < files.length; i++) {
        entry = files[i];//每一个完整路径
        dirname = path.dirname(entry);//文件路径
        extname = path.extname(entry);//文件扩展名
        basename = path.basename(entry, extname);//文件名
        pathname = path.normalize(path.join(dirname,  basename));//完整路径，不包含扩展名
        pathDir = path.normalize(pathDir);
        if(pathname.startsWith(pathDir)){
            pathname = path.normalize(pathname.substring(pathDir.length))
        }
        entries[pathname] = ['./' + entry];
    }
    return entries;
}