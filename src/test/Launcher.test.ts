// typescript-specific functionality
import { mocked } from 'ts-jest/utils';

import { Launcher } from '../app/Launcher';
import { Server } from '../app/Server/Server';

// [ IMPORTANT ]

// 2)
// just to show console.log('starting fake server.')
//  which means Server class is running

// the way of overriding a class to mock
jest.mock('../app/Server/Server', () => {
  // 1) return class
  return {
    Server: jest.fn(() => {
      // 2) return method
      return {
        startServer: () => {
          console.log('starting fake server.');
        }
      }
    })
  }
});

// 1)
// ** it is to block Server class and its constructor to be directly called
// jest.mock('../app/Server/Server');

describe('Launcher test suite', () => {
  // [IMPORTANT]
  // ** it is to replace Server class with mock class to be indirectly called
  // building "class-based mock"
  // "true": deep mock for "createServer" method
  const mockedServer = mocked(Server, true);

  test('create server', () => {
    new Launcher();
    // by implementing the mockedServer above,
    //  we can test "Server class and its method "createServer" are called"
    expect(mockedServer).toBeCalled();
  });

  test('launchApp', () => {
    // [IMPORTANT]
    // we can use prototype to get testing class's method and replace it with mock function.
    Launcher.prototype.launchApp = jest.fn();
    new Launcher().launchApp();
    expect(Launcher.prototype.launchApp).toBeCalled();
  });
});