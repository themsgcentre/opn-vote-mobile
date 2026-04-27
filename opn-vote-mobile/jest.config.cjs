/** @type {import('jest').Config} */
module.exports = {
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '^ionicons/(.*)$': '<rootDir>/node_modules/ionicons/$1',
  },
  // @ionic/core ships untranspiled ESM in .js — must run through jest-preset-angular like @angular.
  transformIgnorePatterns: [
    'node_modules/(?!.*\\.mjs$|@angular/common/locales/.*\\.js$|@angular|@ionic|ionicons|@stencil)',
  ],
};
