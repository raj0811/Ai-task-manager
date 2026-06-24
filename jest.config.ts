/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
        '^.+\\.(t|j)s$': ['ts-jest', { isolatedModules: false }],
    },
    moduleFileExtensions: ['ts', 'js', 'json'],
    rootDir: 'src',
    testRegex: '.*\\.spec\\.ts$',
    globalSetup: '../jest.setup.ts',
    globalTeardown: '../jest.cleanup.ts',
    testTimeout: 15000,
};