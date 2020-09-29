module.exports = {
  preset: 'ts-jest',
  setupFiles: ['./src/jest-setup.test.ts'],
  testPathIgnorePatterns: ['/node_modules/', 'setup.test.ts'],
  collectCoverageFrom: ['src/**'],
}
