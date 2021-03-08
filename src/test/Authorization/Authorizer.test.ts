import { Authorizer } from "../../app/Authorization/Authorizer";
import { SessionTokenDBAccess } from '../../app/Authorization/SessionTokenDBAccess';
import { UserCredentialsDbAccess } from '../../app/Authorization/UserCredentialsDbAccess';
import { SessionToken, TokenState } from "../../app/Models/ServerModels";

// [IMPORTANT]
// MOCKING ENTIRE MODULE
/*
  Calling jest.mock('./module_path') returns 
  a useful "automatic mock" you can use to spy on calls 
  to the class constructor and all of its methods. 
  
  It replaces the ES6 class with a mock constructor, 
  and replaces all of its methods with mock functions 
  that always return "undefined"

  [IMPORTANT]
  Please note that if you use arrow functions in your classes, 
  they will not be part of the mock.
*/
// in order to test this method without actually hitting the API 
//  (and thus creating slow and fragile tests), 
//  we can use the jest.mock(...) function to automatically mock the axios module.
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
    // for the reason that constructor above has default argument, 
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
    /*
      jest.spyOn allows you to mock either the whole module or the individual functions of the module.
      At its most general usage, it can be used to track calls on a method:
    */

    // by using spy.on's global object, in the class's date and math function
    //  is using spy.on's definition, not definition:
      // date: new Date(Date.now() + 60 * 60 * 1000);
      // math: Math.random().toString(36).slice(2);

    // making all global.Date class to mock function.
    const math = jest.spyOn(global.Math, 'random').mockReturnValueOnce(0);

    // jest.spyOn(global.Date) // making all global.Date class to mock function.
    const time = jest.spyOn(global.Date, 'now').mockReturnValueOnce(0);

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
    expect(time).toHaveBeenCalled();
    expect(math).toHaveBeenCalled();
    expect(expectedSessionToken).toEqual(sessionToken);

    // testing mock function itself
    // toBeCalledWith : testing argument.
    expect(sessionTokenDBAccessMock.storeSessionToken).toBeCalledWith(sessionToken);
  });

  test('generateToken with null', async () => {
    userCredentialsDBAccessMock.getUserCredential.mockReturnValueOnce(null);
    const sessionToken = await authorizer.generateToken(someAccount);

    expect(sessionToken).toEqual(null);
    expect(sessionToken).toBeFalsy();
  });
});

describe('validateToken suite', () => {
  let authorizer: Authorizer;

  const sessionTokenDBAccessMock = {
    getToken: jest.fn(),
  }

  const userCredentialsDBAccessMock = {};

  beforeEach(() => {
    authorizer = new Authorizer(
      sessionTokenDBAccessMock as any,
      userCredentialsDBAccessMock as any,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('validateToken with undefined', async () => {
    const tokenId = jest.spyOn(global.Math, 'random').mockReturnValueOnce(10);
    sessionTokenDBAccessMock.getToken.mockReturnValueOnce(undefined);
    const expectedTokenRights = {
      accessRights: [],
      state: TokenState.INVALID,
    }
    const tokenRights = await authorizer.validateToken(tokenId.toString());

    expect(expectedTokenRights).toEqual(tokenRights);
  });

  test('validateToken with falsy token.valid', async () => {
    const tokenId = jest.spyOn(global.Math, 'random').mockReturnValueOnce(10);
    sessionTokenDBAccessMock.getToken.mockReturnValueOnce({
      userName: 'someone',
      accessRights: [1, 2, 3],
      valid: false,
      tokenId: tokenId.toString(),
      expirationTime: new Date(60 * 60 * 1000),
    });
    
    const expectedTokenRights = {
      accessRights: [],
      state: TokenState.INVALID,
    }
    const tokenRights = await authorizer.validateToken(tokenId.toString());

    expect(expectedTokenRights).toEqual(tokenRights);
  });

  test('validateToken with expired date', async () => {
    const tokenId = jest.spyOn(global.Math, 'random').mockReturnValueOnce(10);
    sessionTokenDBAccessMock.getToken.mockReturnValueOnce({
      userName: 'someone',
      accessRights: [1, 2, 3],
      valid: true,
      tokenId: tokenId.toString(),
      expirationTime: new Date(-1),
    });

    const expectedTokenRights = {
      accessRights: [],
      state: TokenState.EXPIRED,
    }

    const tokenRights = await authorizer.validateToken(tokenId.toString());
    expect(expectedTokenRights).toEqual(tokenRights);
  });

  test('validateToken with valid tokenId', async () => {
    const tokenId = jest.spyOn(global.Math, 'random').mockReturnValueOnce(10);
    sessionTokenDBAccessMock.getToken.mockReturnValueOnce({
      userName: 'someone',
      accessRights: [1, 2, 3],
      valid: true,
      tokenId: tokenId.toString(),
      expirationTime: new Date(new Date().getTime() + (60 * 60 * 1000)),
    });

    const expectedTokenRights = {
      accessRights: [1, 2, 3],
      state: TokenState.VALID,
    }

    const tokenRights = await authorizer.validateToken(tokenId.toString());
    expect(expectedTokenRights).toEqual(tokenRights);
  })
});
