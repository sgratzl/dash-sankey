module.exports = {
  presets: ['@babel/preset-env', '@babel/preset-react'],
  env: {
    production: {
      plugins: ['styled-jsx/babel'],
    },
    development: {
      plugins: ['styled-jsx/babel'],
    },
    test: {
      plugins: ['styled-jsx/babel-test'],
    },
  },
};
