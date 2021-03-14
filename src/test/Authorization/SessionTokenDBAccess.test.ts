import { SessionTokenDBAccess } from '../../app/Authorization/SessionTokenDBAccess';
import * as Nedb from 'nedb';

// we do not need to access nedb
jest.mock('nedb');

describe('SessionTokenDBAccess test suite', () => {
  let sessionTokenDBAccess : SessionTokenDBAccess;

  const nedbMock = {
    loadDatabase: jest.fn(),
    insert: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
  }

  const sessionToken = {
    tokenId: '',
    userName: 'someUser',
    valid: true,
    expirationTime: new Date (60 * 60 * 1000),
    accessRights: [1 ,2, 3]
  }

  const tokenId = 'abcde';

  beforeEach(() => {
    sessionTokenDBAccess = new SessionTokenDBAccess(
      nedbMock as any
    );
    
    // [****IMPORTANT****]
    // The way to test the methods inside constructor
    // It does not test constructor (a) { this.a = a};
    // it test "methods running in constructor"

    // it tests this.nedb.loadDatabase(); in the class
    //  we can put expect everywhere
    expect(nedbMock.loadDatabase).toBeCalled();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('storeSessionToken without any error', async () => {
    // [IMPORTANT]
    // for testing callback
    
    /*
      mockImplementationOnce((arguments including callback) => {
        callback()
      });
    */ 

    nedbMock.insert.mockImplementationOnce((someToken: any, cb: any) => {
      cb();
    });

    await sessionTokenDBAccess.storeSessionToken(sessionToken);

    /*
      website: https://jestjs.io/docs/en/expect
      
      expect.any(constructor) matches anything that was created with the given constructor.
      You can use it inside "toEqual" or "toBeCalledWith" instead of a literal value. 
      For example, if you want to check that a mock function is called with a Function:
      expect.any(Function): Function is a callback.
    */

    // [IMPORTANT!!!]
    // expect.any(Function): means Function class's constructor invoke 
    //  because callback can be a constructor of Function class
    expect(nedbMock.insert).toBeCalledWith(sessionToken, expect.any(Function));
  });

  test('storeSessionToken with error', async () => {
    nedbMock.insert.mockImplementationOnce((someToken: any, cb: any) => {
      // [IMPORTANT]: making an error
      cb(new Error('something went wrong.'));
    });

    // [IMPORTANT]: Promise reject with error argument
    await expect(sessionTokenDBAccess.storeSessionToken(sessionToken))
      .rejects.toThrow('something went wrong');
    expect(nedbMock.insert).toBeCalledWith(sessionToken, expect.any(Function));
  });

  test('getToken without any error', async () => {
    nedbMock.find.mockImplementationOnce((someToken: any, cb: any) => {
      cb(null, ['token1' , 'token2']);
    });

    const expectedToken = 'token1';

    const result = await sessionTokenDBAccess.getToken(tokenId);
    expect(expectedToken).toBe(result);
    expect(nedbMock.find).toBeCalledWith({ tokenId }, expect.any(Function));
  });

  test('getToken with empty array return', async () => {
    nedbMock.find.mockImplementationOnce((someToken: any, cb: any) => {
      cb(null, []);
    });

    const result = await sessionTokenDBAccess.getToken(tokenId);
    expect(result).toBeUndefined();
    expect(nedbMock.find).toBeCalledWith(({ tokenId }), expect.any(Function));
  });

  test('getToken with error', async () => {
    nedbMock.find.mockImplementationOnce((someToken: any, cb: any) => {
      cb(new Error('something is wrong'), ['TOK']);
    });
    
    await expect(sessionTokenDBAccess.getToken(tokenId))
      .rejects.toThrow('something is wrong');
    expect(nedbMock.find).toBeCalledWith(({ tokenId }), expect.any(Function));
  });

  test('delete token without any error', async () => {
    nedbMock.remove.mockImplementationOnce((someToken: any, obj: any, cb) => {
      cb(null, 1);
    });

    await sessionTokenDBAccess.deleteToken(tokenId);
    expect(nedbMock.remove).toBeCalledWith(({tokenId}), {}, expect.any(Function));
  });

  test('delete token without 0 removed', async () => {
    nedbMock.remove.mockImplementationOnce((someToken: any, obj: any, cb) => {
      cb(null, 0);
    });

    await expect(sessionTokenDBAccess.deleteToken(tokenId))
      .rejects.toThrow('SessionToken not deleted!');
    expect(nedbMock.remove).toBeCalledWith(({tokenId}), {}, expect.any(Function));
  });

  test('delete token without error', async () => {
    nedbMock.remove.mockImplementationOnce((someToken: any, obj: any, cb) => {
      cb(new Error('something is wrong'));
    });

    await expect(sessionTokenDBAccess.deleteToken(tokenId))
      .rejects.toThrow('something is wrong');
    expect(nedbMock.remove).toBeCalledWith(({tokenId}), {}, expect.any(Function));
  });
});
