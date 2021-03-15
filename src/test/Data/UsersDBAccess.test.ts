import { UsersDBAccess } from '../../app/Data/UsersDBAccess';

jest.mock('nedb');

describe('UserDBAccess test suite', () => {
  let userDBAccess: UsersDBAccess;

  const user = {
    id: 'testId',
    name: 'someName',
    age: 24,
    email: 'some.email@email.com',
    workingPosition: 0,
  }

  const userName = 'someName';

  const nedbMock = {
    loadDatabase: jest.fn(),
    insert: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(() => {
    userDBAccess =  new UsersDBAccess(nedbMock as any);
    expect(nedbMock.loadDatabase).toBeCalled();
  })

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('putUser without error', async () => {
    nedbMock.insert.mockImplementationOnce((someUser: any, cb: any) => {
      cb();
    });

   await userDBAccess.putUser(user);
   expect(nedbMock.insert).toBeCalledWith(
     user,
     expect.any(Function),
   )
  });

  test('putUser with error', async () => {
    nedbMock.insert.mockImplementationOnce((someUser: any, cb: any) => {
      cb(new Error());
    });

   await expect(userDBAccess.putUser(user)).rejects.toThrow();
   expect(nedbMock.insert).toBeCalledWith(
     user,
     expect.any(Function),
   )
  });

  test('getUsersByName without error', async () => {
    nedbMock.find.mockImplementationOnce((someName: any, cb: any) => {
      cb(null, [ user ]);
    });

   await userDBAccess.getUsersByName(userName);
   expect(nedbMock.find).toBeCalledWith(
     { name: new RegExp(userName) },
     expect.any(Function),
   )
  });

  test('getUsersByName with error', async () => {
    nedbMock.find.mockImplementationOnce((someName: any, cb: any) => {
      cb(new Error());
    });

   await expect(userDBAccess.getUsersByName(userName)).rejects.toThrow();
   expect(nedbMock.find).toBeCalledWith(
     { name: new RegExp(userName) },
     expect.any(Function),
   )
  });
});