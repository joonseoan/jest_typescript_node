import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
    // root directory
    roots: ['<rootDir>/src/itest'],
    transform: {
      // .ts and tsx file to ts.jest
      '^.+\\.tsx?$': 'ts-jest'
    },
    testRegex: '(/__test__/.*|(\\.|/)(test|spec))\\.[jt]sx?$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    verbose: true,
    testEnvironment: "node",
}

export default config;

// for js file
// module.exports = {
//   // root directory
//   roots: ['<rootDir>/src/itest'],
//   transform: {
//     // .ts and tsx file to ts.jest
//     '^.+\\.tsx?$': 'ts-jest'
//   },
//   testRegex: '(/__test__/.*|(\\.|/)(test|spec))\\.[jt]sx?$',
//   moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
//   verbose: true,
//   collectCoverage: true,
//   collectCoverageFrom: ['<rootDir>/src/app/**/*.ts']
// }
