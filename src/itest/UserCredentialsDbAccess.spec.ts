import { UserCredentialsDbAccess } from '../app/Authorization/UserCredentialsDbAccess';
import { UserCredentials } from '../app/Models/ServerModels';

describe('userCredentialDBAccess suite', () => {

  let userCredentialDBAccess: UserCredentialsDbAccess;
  let userCredentials: UserCredentials;

  beforeAll(() => {
    userCredentialDBAccess = new UserCredentialsDbAccess();
    userCredentials = {
      accessRights: [1, 2, 3],
      username: "someUser",
      password: 'abcde'
    }
  });

  test('putUserCredential without any error', async () => {
    await userCredentialDBAccess.putUserCredential(userCredentials);
    const result = await userCredentialDBAccess.getUserCredential(
      userCredentials.username,
      userCredentials.password,
    );

    expect(result).toMatchObject(userCredentials);
  });

  test('deleteUserCredential without any error', async () => {
    await userCredentialDBAccess.deleteUserCredential(userCredentials);
    const result = await userCredentialDBAccess.getUserCredential(
      userCredentials.username,
      userCredentials.password,
    );

    expect(result).toBeNull();
  });

  test('deleteUserCredential with error', async () => {
    try {
      await userCredentialDBAccess.deleteUserCredential(userCredentials);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error).toHaveProperty('message', 'UserCredentials not deleted!')    
    }
  });
});
