import path from "node:path";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import TerserPlugin from "terser-webpack-plugin";
import type { Configuration } from "webpack";

export const rootDir = path.resolve(__dirname, "..");

export const commonConfig: Configuration = {
  mode: "production",
  devtool: false,
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader",
          options: {
            transpileOnly: true,
            compilerOptions: { noEmit: false },
          },
        },
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({ extractComments: false })],
  },
  performance: {
    hints: "warning",
    maxAssetSize: 300_000,
    maxEntrypointSize: 300_000,
  },
};
