const ignorePaths = ['/lib', '/src', '/node_modules/'];

module.exports = {
  testPathIgnorePatterns: ignorePaths,
  collectCoverageFrom: [
    '**/*.spec.ts',
    '!**/*.test.ts'
  ],
  transform: {
    '\\.tsx?$': 'ts-jest',
  }
};
