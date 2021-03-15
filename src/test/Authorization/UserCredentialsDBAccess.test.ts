import { UserCredentialsDbAccess } from '../../app/Authorization/UserCredentialsDbAccess';
import { UserCredentials } from '../../app/Models/ServerModels';

jest.mock('nedb');

describe('UserCredentialsDBAccess test suite', () => {
  let userCredentialsDBAccess: UserCredentialsDbAccess;

  const userCredentials = {
    accessRights: [1, 2, 3],
    username: "someUser",
    password: 'abcde',
  }

  const userName = 'someUser';
  const userPassword = 'somePassword';
  
  const nedbMock = {
    loadDatabase: jest.fn(),
    insert: jest.fn(),
    remove: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(() => {
    userCredentialsDBAccess = new UserCredentialsDbAccess(
      nedbMock as any,
    );
    
    expect(nedbMock.loadDatabase).toBeCalled();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('putUserCredential with valid args', async () => {
    nedbMock.insert.mockImplementationOnce((
      userCredentials: UserCredentials, 
      cb: any,
    ) => {
      cb(null, [{}]);
    });

    await userCredentialsDBAccess.putUserCredential(userCredentials);
    expect(nedbMock.insert).toBeCalledWith(userCredentials, expect.any(Function));
  });

  test('putUserCredential with error', async () => {
    nedbMock.insert.mockImplementationOnce((userCredentials: UserCredentials, cb: any) => {
      cb(new Error ());
    });

    // for Promise Error
    await expect(userCredentialsDBAccess.putUserCredential(userCredentials)).rejects.toThrow();
    expect(nedbMock.insert).toBeCalledWith(userCredentials, expect.any(Function));
  });

  test('getUserCredential with valid input', async () => {
    nedbMock.find.mockImplementationOnce((someUser: any, cb: any) => {
      cb(null, [{...userCredentials}]);
    });

    await userCredentialsDBAccess.getUserCredential(userName, userPassword);
    expect(nedbMock.find).toBeCalledWith({
      username: userName,
      password: userPassword,
    },
    expect.any(Function));
  });

  test('getUserCredential with null return', async () => {
    nedbMock.find.mockImplementationOnce((someUser: any, cb: any) => {
      cb(null, []);
    });

    const result = await userCredentialsDBAccess.getUserCredential(userName, userPassword);
    expect(nedbMock.find).toBeCalledWith({
      username: userName,
      password: userPassword,
    }, expect.any(Function));
    expect(result).toBeNull();
  });

  test('getUserCredential with error', async () => {
    nedbMock.find.mockImplementationOnce((someUser: any, cb: any) => {
      cb(new Error());
    });

    await expect(userCredentialsDBAccess.getUserCredential(userName, userPassword))
      .rejects
      .toThrow();
    
    expect(nedbMock.find).toBeCalledWith({
      username: userName,
      password: userPassword,
    }, expect.any(Function));
  });

  test('deleteUserCredential with valid input', async () => {
    nedbMock.remove.mockImplementationOnce((someUser: any, {}: object, cb: any) => {
      cb(null, 1);
    });

    await userCredentialsDBAccess.deleteUserCredential(userCredentials);
    expect(nedbMock.remove).toBeCalledWith(
      { 
        username: userCredentials.username,
        password: userCredentials.password,
      },
      {},
      expect.any(Function),
    );
  });

  test('deleteUserCredential with callback error', async () => {
    nedbMock.remove.mockImplementationOnce((someUser: any, {}: object, cb: any) => {
      cb(new Error());
    });

    await expect(userCredentialsDBAccess.deleteUserCredential(userCredentials))
      .rejects
      .toThrow();
    expect(nedbMock.remove).toBeCalledWith(
      { 
        username: userCredentials.username,
        password: userCredentials.password,
      },
      {},
      expect.any(Function),
    );
  });

  test('deleteUserCredential with nothing removed', async () => {
    nedbMock.remove.mockImplementationOnce((someUser: any, {}: object, cb: any) => {
      cb(null, 0);
    });

    try {
      await expect(userCredentialsDBAccess.deleteUserCredential(userCredentials))
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error).toHaveProperty('message', 'UserCredentials not deleted!');
    }
    expect(nedbMock.remove).toBeCalledWith(
      { 
        username: userCredentials.username,
        password: userCredentials.password,
      },
      {},
      expect.any(Function),
    );
  });
});