module.exports = {
  entry: "./index.js",
  output: {
    path: __dirname,
    filename: "bundle.js"
  },
  module: {
    loaders: [
      {test: /\.js$/, include: __dirname + "/index.js", loader: "babel"}
    ]
  },
}
