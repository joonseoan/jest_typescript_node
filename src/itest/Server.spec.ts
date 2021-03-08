import * as axios from 'axios';
import { UserCredentialsDbAccess } from '../app/Authorization/UserCredentialsDbAccess';
import { HTTP_CODES, SessionToken, UserCredentials } from '../app/Models/ServerModels';

// testing server on the client point of view by implementing axios

axios.default.defaults.validateStatus = function () {
  return true;
};

const serverUrl = 'http://localhost:8080';
const itestUserCredential: UserCredentials = {
  accessRights: [1, 2, 3],
  password: 'itestPassword',
  username: 'itestUser',
};

describe('Server itest suite', () => {

  let userCredentialDBAccess: UserCredentialsDbAccess;
  let sessionToken: SessionToken;

  beforeAll(() => {
    userCredentialDBAccess = new UserCredentialsDbAccess();
  });

  test('server reachable', async () => {
    const response = await axios.default.options(serverUrl);
    // response.status: axios status
    expect(response.status).toBe(HTTP_CODES.OK);
  });

  test('put credential inside database', async () => {
    await userCredentialDBAccess.putUserCredential(itestUserCredential);
  });

  test('reject invalid credentials', async () => {
    const response = await axios.default.post(
      serverUrl + '/login',
      {
        username: 'wrongname',
        password: 'wrongpassword',
      }
    );

    expect(response.status).toBe(HTTP_CODES.NOT_fOUND);
  });

  test('get valid credentials', async () => {
    const response = await axios.default.post(
      serverUrl + '/login',
      {
        username: itestUserCredential.username,
        password: itestUserCredential.password,
      }
    );

    expect(response.status).toBe(HTTP_CODES.CREATED);
    sessionToken = response.data;
  });

  test('Query data', async () => {
    const response = await axios.default.get(
      serverUrl + '/users?name=some', {
        headers: {
          Authorization: sessionToken.tokenId,
        },
      },
    );

    expect(response.status).toBe(HTTP_CODES.OK);
  });

  test('Query data with invalid tokenId', async () => {
    const response = await axios.default.get(
      serverUrl + '/users?name=some', {
        headers: {
          Authorization: 'invalidToken',
        },
      },
    );

    expect(response.status).toBe(HTTP_CODES.UNAUTHORIZED);
  });
});
