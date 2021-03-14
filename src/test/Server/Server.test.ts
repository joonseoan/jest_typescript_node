import { Authorizer } from '../../app/Authorization/Authorizer';
import { UsersDBAccess } from '../../app/Data/UsersDBAccess';
import { LoginHandler } from '../../app/Handlers/LoginHandler';
import { DataHandler } from '../../app/Handlers/DataHandler';
import { Server } from '../../app/Server/Server';

jest.mock('../../app/Handlers/LoginHandler');
jest.mock('../../app/Handlers/DataHandler');
jest.mock('../../app/Authorization/Authorizer');

const requestMock = {
  url: '',
};

const responseMock = {
  end: jest.fn(),
};

const listenMock = {
  listen: jest.fn(),
};

// [Important]
// changing http library class with overriding 
// defines http class with mock
jest.mock('http', () => {
  // defines a method, "createServer" in http class
  return {
    createServer: (cb: any) => {
      // callback
      cb(requestMock, responseMock);

      // defines property of createServer
      return {
        listen: listenMock.listen,
      }
      // same thing as the one above,
      // return listenMock;
    }
  };
});

describe('Server test suite', () => {
  test('should create server on port 8080', () => {
    // testing class and its method
    new Server().startServer();
    expect(listenMock.listen).toBeCalledWith(8080);
    expect(responseMock.end).toBeCalled();
  });

  test('should handle login requests', () => {
    // testing class and its method
    requestMock.url = 'http://localhost:8080/login';
    new Server().startServer();
    
    const handleRequestSpy = jest.spyOn(LoginHandler.prototype, 'handleRequest');
    expect(handleRequestSpy).toBeCalled();
    expect(LoginHandler).toBeCalledWith(requestMock, responseMock, expect.any(Authorizer));
  });

  test('should handle users requests', () => {
    // testing class and its method
    requestMock.url = 'http://localhost:8080/users';
    new Server().startServer();

    const handleRequestSpy = jest.spyOn(DataHandler.prototype, 'handleRequest');
    expect(handleRequestSpy).toBeCalled();
    expect(DataHandler).toBeCalledWith(requestMock, responseMock, expect.any(Authorizer), expect.any(UsersDBAccess));
  });
});
