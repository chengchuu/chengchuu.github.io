import path from "node:path";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import type { Configuration } from "webpack";
import { commonConfig, rootDir } from "./webpack.common";

const config: Configuration = {
  ...commonConfig,
  name: "theme",
  entry: path.join(rootDir, "src/client/theme-runtime.ts"),
  output: {
    path: path.join(rootDir, "dist/assets"),
    filename: "theme-runtime.js",
    clean: false,
  },
  plugins: [new MiniCssExtractPlugin({ filename: "theme.css" })],
};

export default config;
