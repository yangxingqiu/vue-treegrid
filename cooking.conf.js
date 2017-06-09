var cooking = require('cooking');

// 调用 set 方法传入自定义配置
cooking.set({
  entry: './src/index.js', // 指定入口文件
  dist: './dist', // 设置打包后的文件目录
  clean: false,
  format: 'umd',
  minimize: false,
  extends: ['vue2']
});
cooking.add('output.filename', 'index.js');
// 生成 webpack 配置并导出
module.exports = cooking.resolve();