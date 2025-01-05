import path from 'path';
import ESLintPlugin from 'eslint-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';

export default (_env, argv) => {
    process.env.NODE_ENV = argv.mode ?? 'development';

    return {
        entry: { index: path.resolve(import.meta.dirname, './src/index.ts') },
        output: {
            filename: '[name].js',
            path: path.resolve(import.meta.dirname, 'dist'),
            library: { type: 'module' },
            clean: true
        },
        experiments: { outputModule: true },
        devServer: { static: './public' },
        devtool: process.env.NODE_ENV === 'development' ? 'source-map' : false,
        resolve: {
            modules: ['node_modules'],
            extensions: ['.ts', '.js'],
            mainFields: ['browser', 'module', 'main'],
            alias: { src: path.resolve(import.meta.dirname, 'src') }
        },
        module: {
            rules: [
                { test: /\.js$/, exclude: /node_modules/ },
                { test: /\.ts$/, exclude: /node_modules/, use: [{ loader: 'ts-loader' }] }
            ]
        },
        plugins: [new ESLintPlugin({ configType: 'flat' })],
        optimization: {
            minimize: true,
            minimizer: [new TerserPlugin({ terserOptions: { format: { comments: false } }, extractComments: false })]
        },
        performance: { hints: false }
    };
};
