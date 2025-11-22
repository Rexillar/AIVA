module.exports = {
  'client/**/*.{js,jsx}': ['eslint --fix', 'prettier --write'],
  'server/**/*.js': ['eslint --fix', 'prettier --write'],
  '*.{md,json}': ['prettier --write']
};
