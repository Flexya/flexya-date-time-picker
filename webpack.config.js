const ExtractTextPlugin = require('extract-text-webpack-plugin');

const toFileName = (name, extension) =>
	name + (process.argv.indexOf('-p') !== -1 ? '.min' : '') + '.' + extension;

module.exports = {
	entry: './src/js/flexya-date-time-picker.js',
	output: {
		path: __dirname + '/dist',
		filename: toFileName('flexya-date-time-picker', 'js')
	},
	plugins: [
		new ExtractTextPlugin(toFileName('flexya-date-time-picker', 'css'))
	],
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: { presets: ['env'] }
				}
			},
			{
				test: /\.scss$/,
				use: ExtractTextPlugin.extract({
					use: [{
						loader: 'css-loader',
						options: { sourceMap: true }
					}, {
						loader: 'sass-loader',
						options: { sourceMap: true }
					}]
				})
			}
		]
	},
	devtool: 'source-map'
};
