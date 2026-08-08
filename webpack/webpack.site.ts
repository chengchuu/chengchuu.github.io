import path from "node:path";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import type { Configuration } from "webpack";
import { commonConfig, rootDir } from "./webpack.common";

const config: Configuration = {
  ...commonConfig,
  name: "site",
  entry: path.join(rootDir, "src/client/site.ts"),
  output: {
    path: path.join(rootDir, "dist/assets"),
    filename: "index.js",
    clean: false,
  },
  plugins: [new MiniCssExtractPlugin({ filename: "index.css" })],
};

export default config;
