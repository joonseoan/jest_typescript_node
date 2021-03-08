// typescript-specific functionality
import { mocked } from 'ts-jest/utils';

import { Launcher } from '../app/Launcher';
import { Server } from '../app/Server/Server';

// [ IMPORTANT ]

// 2)
// just to show console.log('starting fake server.')
//  which means Server class is running

// overriding a class
// jest.mock('../app/Server/Server', () => {
//   return {
//     Server: jest.fn(() => {
//       return {
//         startServer: () => {
//           console.log('starting fake server.');
//         }
//       }
//     })
//   }
// });

// 1)
jest.mock('../app/Server/Server');

describe('Launcher test suite', () => {
  // [IMPORTANT]
  // building class-based mock
  // "true": deep mock
  const mockedServer = mocked(Server, true);

  test('create server', () => {
    new Launcher();
    // by implementing mockedServer above,
    //  we can test "Server class and its methods are called"
    expect(mockedServer).toBeCalled();
  });

  test('launchApp', () => {
    // [IMPORTANT]
    // we can use prototype to get method and replace it with mock function.
    Launcher.prototype.launchApp = jest.fn();
    new Launcher().launchApp();
    expect(Launcher.prototype.launchApp).toBeCalled();
  });
});