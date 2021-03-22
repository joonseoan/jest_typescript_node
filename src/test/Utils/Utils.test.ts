import { IncomingMessage } from 'http';
import { Utils } from '../../app/Utils/Utils';

describe('Utils test suite', () => {

  const requestMock = {
    on: jest.fn()
  };

  jest.mock('http', () => {
    return {
      request: jest.fn().mockImplementation((url, options, cb) => {
        cb(requestMock)
      }),
    };
  });

  const someObject = {
    name: 'John',
    age: 30,
    city: 'Paris'
  };
  
  const someObjectAsString = JSON.stringify(someObject);

  // stubs
  test('getRequestPath valid request', () => {
    // [ Important ]
    // Utils.getRequestBasePath(req)
    // In order to have the identical type, just do typecasting.
    // for req.url
    const request = { 
      url: 'http://localhost:8080/login',
    } as IncomingMessage;

    const urlPath = Utils.getRequestBasePath(request);
    expect(urlPath).toBe('login');
  });

  // stubs
  test('getRequestPath invalid request', () => {
    const request = {
      url: 'http://localhost:8080',
    } as IncomingMessage;

    const urlPath = Utils.getRequestBasePath(request);
    // toBeFalsy: '', null, and undefined
    expect(urlPath).toBeFalsy();
  });

  // stubs
  test('getRequestBasePath without url', () => {
    const request = {
      url: '',
    } as IncomingMessage;

    const urlPath = Utils.getRequestBasePath(request);
    expect(urlPath).toBeFalsy();
  });

  test('Invalid URL', () => {
    // without try catch
    function throwError() {
      Utils.parseUrl('');
    }

    // not including error message
    // expect(throwError).toThrow();
    expect(throwError).toThrow();
    
    // [IMPORTANT]
    // for the throw error, must use function.
    // expect(Utils.parseUrl('')).toThrowError();
  });

  test('Invalid URL with arrow function', () => {
    // using callback
    expect(() => {
      Utils.parseUrl('');
    }).toThrow();
  });

  test('Invalid URL with arrow function with Catch', () => {
    // try catch test when the original method does not have try catch
    try {
      Utils.parseUrl('');
    } catch (error) {
      // Error Object
      expect(error).toBeInstanceOf(Error);
      // message: message property with value.
      // it is able to test correct message from "new Error('Empty URL')"
      expect(error).toHaveProperty('message', 'Empty url!');
    }
  });

  // joon: todo with callback
  test('parse URL with query: ', () => {
    const parsedUrl = Utils.parseUrl('http://localhost:8080/login?user=user&password=pass');

    const expectedQuery = {
      user: 'user',
      password: 'pass'
    };

    // by using parsedUrl.query
    expect(parsedUrl.query).toEqual(expectedQuery);
  });

  it('parseURL with login', () => {
    const parsedUrl = Utils.parseUrl('http://localhost:8080/login');

    // for the primitive values, it must use "toBe"
    expect(parsedUrl.href).toBe('http://localhost:8080/login');
    expect(parsedUrl.port).toBe('8080');
    expect(parsedUrl.protocol).toBe('http:');

    expect(parsedUrl.query).toEqual({});
  });

  it('getRequestBody with valid request', () => {
    const request = {
      on: jest.fn()
    } as any;
    
    Utils.getRequestBody(request);
    expect(request.on).toBeCalled();
  });

  test('getRequestBody data with valid JSON', async () => {
    requestMock.on.mockImplementation((event, cb) => {
        if (event == 'data') {
          cb(someObjectAsString)
        } else {
          cb()
        }
    });
    const response = await Utils.getRequestBody(requestMock as any);
    expect(response).toEqual(someObject)
  });

  test('getRequestBody with invalid JSON', async () => {
    requestMock.on.mockImplementation((event, cb) => {
      if (event == 'data') {
        cb('5' + someObjectAsString);
      } else {
        cb();
      }
    });
    await expect(Utils.getRequestBody(requestMock as any)).rejects.toThrow('Unexpected token { in JSON at position 1');
  });

  test('getRequestBody with unexpected error', async () => {
    const someError = new Error('something went wrong!')
    requestMock.on.mockImplementation((event, cb) => {
      if (event == 'error') {
        cb(someError)
      } else if(event == 'data') {
        cb(someObjectAsString)
      }
    });
    await expect(Utils.getRequestBody(requestMock as any)).rejects.toThrow(someError.message);
  });
});


// [Important particularly error control]
// Pre-requisite lecture
/*
import { Utils } from '../app/Utils';

// [describe.only]: test this suite only
// [describe.skip]: skip the entire unit testing and suite
describe('Utils test suite', () => {
  
  // [ IMPORTANT ]
  // first invoked and pre-setup before all unit test
  beforeAll(() => {
    console.log('beforeAll')
  });

  // [ IMPORTANT ]
  // invoked as many as the number of unit test
  //  because it setups before each unit test.
  beforeEach(() => {
    console.log('beforeEach');
  });

  // "it" or "test" method can be used. both are exactly same.
  // [test.only]: test this unit test only. Other unit test will be skipped.
  // [test.skip]: skip the this unit testing
  test('first test', () => {
    console.log('test work!!');

    // [ typescript based jest setup ]
    const result = Utils.toUpperCase('hello');
    expect(result).toBe('HELLO');
  });

  test('parse simple url', () => {
    const parsedUrl = Utils.parseUrl('http://localhost:8080/login');

    // for the primitive values, it must use "toBe"
    expect(parsedUrl.href).toBe('http://localhost:8080/login');
    expect(parsedUrl.port).toBe('8080');
    expect(parsedUrl.protocol).toBe('http:');

    // for object value, use "toEqual"
    expect(parsedUrl.query).toEqual({});
  });

  test('parse URL with query: ', () => {
    const parsedUrl = Utils.parseUrl('http://localhost:8080/login?user=user&password=pass');

    const expectedQuery = {
      user: 'user',
      password: 'pass'
    };

    // by using parsedUrl.query
    expect(parsedUrl.query).toEqual(expectedQuery);
    
    // it can be a reference as well
    expect(expectedQuery).toEqual(expectedQuery);
  });

  // [ IMPORTANT ]
  // [test.todo] for reminder
  // test.todo('Invalid Url');

  test('Invalid URL', () => {

    function throwError() {
      Utils.parseUrl('');
    }

    // must use callback inside of expect
    // not including error message
    // expect(throwError).toThrow();
    expect(throwError).toThrow();
    
    // [IMPORTANT]
    // for the throw error, it cannot directly specify the method. must use function.
    // expect(Utils.parseUrl('')).toThrowError();
  });

  test('Invalid URL with arrow function', () => {
    expect(() => {
      Utils.parseUrl('');
    }).toThrow();
    
  });

  test('Invalid URL with arrow function with Catch', () => {
    // try catch test
    try {
      Utils.parseUrl('');
    } catch (error) {
      // Error Object
      expect(error).toBeInstanceOf(Error);
      // message: message property with value.
      // it is able to test correct message from "new Error('Empty URL')"
      expect(error).toHaveProperty('message', 'Empty URL');
    }
  });
});
*/