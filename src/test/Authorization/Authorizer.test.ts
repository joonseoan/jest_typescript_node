import { Authorizer } from "../../app/Authorization/Authorizer";
import { SessionTokenDBAccess } from '../../app/Authorization/SessionTokenDBAccess';
import { UserCredentialsDbAccess } from '../../app/Authorization/UserCredentialsDbAccess';
import { SessionToken } from "../../app/Models/ServerModels";

// [IMPORTANT]
// MOCKING ENTIRE MODULE
/*
  Calling jest.mock('./module_path') returns 
  a useful "automatic mock" you can use to spy on calls 
  to the class constructor and all of its methods. 
  
  It replaces the ES6 class with a mock constructor, 
  and replaces all of its methods with mock functions 
  that always return undefined

  [IMPORTANT]
  Please note that if you use arrow functions in your classes, 
  they will not be part of the mock.
*/

jest.mock('../../app/Authorization/SessionTokenDBAccess');
jest.mock('../../app/Authorization/UserCredentialsDbAccess');

describe('Authorizer test suite', () => {
  let authorizer: Authorizer;

  const sessionTokenDBAccessMock = {
    storeSessionToken: jest.fn()
  };

  const userCredentialsDBAccessMock = {
    getUserCredential: jest.fn()
  };

  const someAccount = {
    username: 'someone',
    password: 'password',
  };

  beforeEach(() => {
    authorizer = new Authorizer(
      sessionTokenDBAccessMock as any,
      userCredentialsDBAccessMock as any,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('constructor arguments', () => {
    /*
      [ constructor in Authorizer class ]
      public constructor( 
        sessionTokenDBAccess = new SessionTokenDBAccess, // it is same as sessionDBAccess? = new SessionTokenAccess
        userCredentialsDBAccess = new UserCredentialsDbAccess
      ) {
        this.sessionTokenDBAccess = sessionTokenDBAccess;
        this.userCredentialsDBAccess = userCredentialsDBAccess;
      }
    */

    // [ IMPORTANT ]
    // for the reason that constructor has default argument, 
    //  argument can be unavailable for the instantiation, new Authorizer().
      
    // [ IMPORTANT ]
    // another issue is that by implementing default argument,
    //  even without the arguments, 
    //  sessionTokenDBAccess and userCredentialDBAccess in constructor
    //    will be automatically activated
    // => solution: we need to mock them like the ones above.
    /*
      jest.mock('../../app/Authorization/SessionTokenDBAccess');
      jest.mock('../../app/Authorization/UserCredentialsDbAccess');
    */
    
    // now it will not immediately call the access arguments.
    new Authorizer();
    // after new Authorizer(), the access will be called.
    expect(SessionTokenDBAccess).toBeCalled();
    expect(SessionTokenDBAccess).toHaveBeenCalled();
     
    expect(UserCredentialsDbAccess).toBeCalled();
    expect(UserCredentialsDbAccess).toHaveBeenCalled();
  });

  test('should return SessionToken for valid credential', async () => {
    // [IMPORTANT]
    // 0: set the same time.
    jest.spyOn(global.Math, 'random').mockReturnValueOnce(0);
    jest.spyOn(global.Date, 'now').mockReturnValueOnce(0);

    userCredentialsDBAccessMock.getUserCredential.mockReturnValueOnce({
      username: 'someone',
      password: 'password',
      accessRights: [1, 2, 3],
    });

    const expectedSessionToken: SessionToken = {
      userName: 'someone',
      accessRights: [1, 2, 3],
      valid: true,
      // spyOn because we cannot control Math.random
      tokenId: '',
      // spyOn because we cannot control Date().now
      expirationTime: new Date(60 * 60 * 1000),
    };

    const sessionToken = await authorizer.generateToken(someAccount);
    expect(expectedSessionToken).toEqual(sessionToken);
    // toBeCallesWith : testing argument.
    expect(sessionTokenDBAccessMock.storeSessionToken).toBeCalledWith(sessionToken);
  });
});