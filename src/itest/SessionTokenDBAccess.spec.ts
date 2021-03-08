import { SessionTokenDBAccess } from '../app/Authorization/SessionTokenDBAccess';
import { SessionToken } from '../app/Models/ServerModels';

describe('SessionTokenDBAccess itest suite', () => {

  let sessionTokenDBAccess: SessionTokenDBAccess;
  let someSessionToken: SessionToken;
  const randomString = Math.random().toString(36).substring(7);

  beforeAll(() => {
    sessionTokenDBAccess = new SessionTokenDBAccess();
    someSessionToken = {
      accessRights: [1, 2, 3],
      expirationTime: new Date(),
      tokenId: 'someTokenId' + randomString,
      userName: 'someUser',
      valid: true,
    }
  });

  test('store and retrieve SessionToken', async () => {
    await sessionTokenDBAccess.storeSessionToken(someSessionToken);
    const result = await sessionTokenDBAccess.getToken(someSessionToken.tokenId);

    // toEqual: exact same properties

    // [IMPORTANT]
    // toMatchObject: no need to be exact same but expect needs to includes all someSessionToken
    
    // expect(someSessionToken).toEqual(result);
    expect(result).toMatchObject(someSessionToken);
  });

  test('deleteToken', async () => {
    await sessionTokenDBAccess.deleteToken(someSessionToken.tokenId);
    const result = await sessionTokenDBAccess.getToken(someSessionToken.tokenId);

    expect(result).toBeUndefined();
  });

  test('deleteToken throw error', async () => {
    // 1)
    // nedbMock.remove.mockImplementationOnce((someToken: any, obj: any, cb) => {
    //   cb(null, 0);
    // });
    // await expect(sessionTokenDBAccess.deleteToken(tokenId))
    //   .rejects.toThrow('SessionToken not deleted!');
    // expect(nedbMock.remove).toBeCalledWith(({tokenId}), {}, expect.any(Function));

    // [IMPORTANT]
    // 2)
    // callback error control and specified error control is different.
    // when we need to show the defined error, we can use try catch here.
    try {
      await sessionTokenDBAccess.deleteToken(someSessionToken.tokenId);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error).toHaveProperty('message', 'SessionToken not deleted!');
    }
  })
});