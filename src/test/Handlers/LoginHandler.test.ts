import { LoginHandler } from "../../app/Handlers/LoginHandler";
import { HTTP_CODES, HTTP_METHODS, SessionToken } from "../../app/Models/ServerModels";
import { Utils } from "../../app/Utils/Utils";

// [Mock]
describe('LoginHandler test suite', () => {
  let loginHandler: LoginHandler;
  
  // [ Definition: req, res, authorizeWork]
  const requestMock = {
    method: '',
  };

  let responseMock = {
    // just memorize it.
    writeHead: jest.fn(),
    write: jest.fn(),
    statusCode: 0,
  };

  const authorizerMock = {
    generateToken: jest.fn()
  };

  // [ IMPORTANT ]
  // (1) -------------  add mock function why?
  // When we need to assume the sub function inside of methods will correctly work or return correct value.
  // build empty function to be tested in the jest way.
  const getRequestBodyMock = jest.fn();

  beforeEach(() => {
    console.log('beforeEach'); // ---------------------------------------------------- 2), 5), 8), 11), 14)
  
    loginHandler = new LoginHandler(
      // request.method = '';  empty
      requestMock as any, 
      // mockValue: responseMock
      responseMock as any,
      // mockValue; authorizeMock
      authorizerMock as any,
    );
    
    // (2) mock function
    // replace the method with jest function above.
    Utils.getRequestBody = getRequestBodyMock;
  });

  afterEach(() => {
    console.log('afterEach: ') // -------------------------------------------------- 4), 7), 10), 13), 16)

    // [IMPORTANT]
    // 2) only for mock function to be clear!
    // not working for the property or variable which is not a jest.fn()
    jest.clearAllMocks();
    requestMock.method = '';

    // 1)
    // requestMock.method = '';
    // responseMock.writeHead.mockClear();
  });

  // [IMPORTANT!] it is before "beforeEach"
  console.log('just before test'); // ---------------------------------------------- 1)

  test('handleRequest for OPTION http method', async () => {
    console.log('first test'); // -------------------------------------------------- 3)
    
    // [IMPORTANT]
    // run as same order of the method/end point has
    // specifically it is applied here in test, not in beforeEach!
    requestMock.method = HTTP_METHODS.OPTIONS;
    await loginHandler.handleRequest();
    
    // [IMPORTANT]
    // after call it should be clear otherwise, next test will still have
    //  a call with OPTION!
    // please see "jest.clearAllMocks();" afterEach.
    expect(responseMock.writeHead).toBeCalledWith(HTTP_CODES.OK);
  });

  test('handleRequest for invalid http method', async () => {
    console.log('second test'); // ------------------------------------------------- 6)

    // [ IMPORTANT ]
    // it still has request.method = OPTION.
    // so we need to clear in afterEach or beforeEach!
    //  please see "requestMock.method = '';" afterEach.
    requestMock.method = 'somethingInvalidRequest';
    await loginHandler.handleRequest();
    expect(responseMock.writeHead).not.toHaveBeenCalled();
  });

  test('post request with valid login', async () => {
    console.log('third test'); // -------------------------------------------------- 9)
    
    requestMock.method = HTTP_METHODS.POST;
    
    // 3) -------------- mock function returns the correct value.
    // now run the replaced function instead of Utils.getRequestBody() 
    // and then we can assume that the dependent function "getRequestBody", returns the correct value.
    getRequestBodyMock.mockReturnValueOnce({
      username: 'someUser',
      password: 'password'
    });

    const someSessionToken: SessionToken = {
      tokenId: 'someTokenId',
      userName: 'someUser',
      valid: true,
      expirationTime: new Date(),
      accessRights: [1, 2, 3],
    }
    
    // mock function
    // await this.authorizer.generateToken(requestBody); is replaced with mock function
    authorizerMock.generateToken.mockReturnValueOnce(someSessionToken);
    
    await loginHandler.handleRequest();
    
    expect(responseMock.statusCode).toBe(HTTP_CODES.CREATED);
    expect(responseMock.writeHead).toBeCalledWith(
      HTTP_CODES.CREATED,
      { 'Content-Type': 'application/json' }
    );
    expect(responseMock.write).toBeCalledWith(JSON.stringify(someSessionToken));
  });

  test('post request with invalid login request', async () => {
    console.log('fourth test'); // ------------------------------------------------------------ 12)
  
    requestMock.method = HTTP_METHODS.POST;  
    getRequestBodyMock.mockReturnValueOnce({
      username: 'someUser',
      password: 'password',
    });

    // getGenerateToken : if correct return token, otherwise return null
    authorizerMock.generateToken.mockReturnValueOnce(null);
    await loginHandler.handleRequest();
    
    expect(responseMock.statusCode).toBe(HTTP_CODES.NOT_fOUND);
    expect(responseMock.write).toBeCalledWith('wrong username or password');
  });

  test('post request with unexpected error', async () => {
    console.log('fifth test'); // ------------------------------------------------------------ 15)
   
    requestMock.method = HTTP_METHODS.POST;
    // return Error class
    getRequestBodyMock.mockRejectedValueOnce(new Error('something went wrong.'));
    
    await loginHandler.handleRequest();

    expect(responseMock.statusCode).toBe(HTTP_CODES.INTERNAL_SERVER_ERROR);
    expect(responseMock.write).toBeCalledWith('Internal error: ' + 'something went wrong.');
  });
});