// Load ts-node in CommonJS mode
require("ts-node").register({
  transpileOnly: true,
  compilerOptions: {
    module: "CommonJS"
  }
});

// Load path aliases
require("tsconfig-paths").register({
  baseUrl: __dirname + "/../",
  paths: {
    "@/*": ["src/*"]
  }
});