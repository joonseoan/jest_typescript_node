import { DataHandler } from '../../app/Handlers/DataHandler';
import { HTTP_CODES, HTTP_METHODS } from '../../app/Models/ServerModels';
import { Utils } from '../../app/Utils/Utils';
import { UsersDBAccess } from '../../app/Data/UsersDBAccess';

describe('DataHandler suite', () => {
  let dataHandler: DataHandler;
  let usersDBAccess: UsersDBAccess;

  const requestMock = {
    method: '',
    url: '',
  };

  const responseMock = {
    writeHead: jest.fn(),
    write: jest.fn(),
    statusCode: 0, 
  };

  const authorizerMock = {
    validateToken: jest.fn(),
  }

  const usersDBAccessMock = {
    getUsersByName: jest.fn(),
  }

  const operationAuthorizedMock = jest.fn();
  const parseUrlMock = jest.fn();

  beforeEach(() => {    
    dataHandler = new DataHandler(
      requestMock as any,
      responseMock as any,
      authorizerMock as any,
      usersDBAccessMock as any,
    );

    (dataHandler as any).operationAuthorized = operationAuthorizedMock;
    Utils.parseUrl = parseUrlMock;
  });

  afterEach(() => {
    jest.clearAllMocks();
    requestMock.method = '';
    requestMock.url = '';
  });

  it('handleRequest for OPTION http method', async () => {
    requestMock.method = HTTP_METHODS.OPTIONS;
    await dataHandler.handleRequest();

    expect(responseMock.writeHead).toBeCalledWith(HTTP_CODES.OK);
  });

  it('handlerRequest with invalid http method', async () => {
    requestMock.method = 'abcded';
    await dataHandler.handleRequest();

    expect(responseMock.writeHead).not.toHaveBeenCalled();
  });

  it('handleGet', async () => {
    requestMock.method = HTTP_METHODS.GET;
    operationAuthorizedMock.mockReturnValueOnce(true);
    requestMock.url='http://localhost:8080/users?name=someName1'
    parseUrlMock.mockReturnValueOnce({
      query: {
        name: 'someName1'
      },
    });

    const users = [{
      age: 22,
      email: 'some@emai.com',
      id: 'someId',
      name: 'someName',
      workingPosition: 2,
    }];

    usersDBAccessMock.getUsersByName.mockReturnValueOnce(users);

    await dataHandler.handleRequest();

    expect(responseMock.writeHead).toBeCalledWith(
      HTTP_CODES.OK,
      { 'Content-Type': 'application/json' }
    );
    expect(responseMock.write).toBeCalledWith(JSON.stringify(users));
  });

  it('handleGet with unauthorized', async () => {
    requestMock.method = HTTP_METHODS.GET;
    operationAuthorizedMock.mockReturnValueOnce(false);
    
    await dataHandler.handleRequest();

    expect(responseMock.statusCode).toBe(HTTP_CODES.UNAUTHORIZED);
    expect(responseMock.write).toBeCalledWith('Unauthorized operation!');
  });

  it('handleGet with bad request', async () => {
    requestMock.method = HTTP_METHODS.GET;
    operationAuthorizedMock.mockReturnValueOnce(true);
    requestMock.url='http://localhost:8080/users?name='
    parseUrlMock.mockReturnValueOnce({
      query: {
        name: '',
      }
    });

    await dataHandler.handleRequest();

    expect(responseMock.statusCode).toBe(HTTP_CODES.BAD_REQUEST);
    expect(responseMock.write).toBeCalledWith('Missing name parameter in the request!');
  });

  it('handleGet with try catch', async () => {
    requestMock.method = HTTP_METHODS.GET;
    operationAuthorizedMock.mockReturnValueOnce(true);
    requestMock.url='http://localhost:8080/users?name=someName1'
    parseUrlMock.mockReturnValueOnce({
      query: {
        name: 'someName1',
      }
    });

    usersDBAccessMock.getUsersByName.mockRejectedValueOnce(new Error('something wrong'));

    await dataHandler.handleRequest()
    
    expect(responseMock.statusCode).toBe(HTTP_CODES.INTERNAL_SERVER_ERROR);
    expect(responseMock.write).toBeCalledWith('Internal error: ' +  'something wrong');
  });
});


describe('operationAuthorized suite', () => {

  let dataHandler: DataHandler;

  const requestMock = {
    headers: {
      authorization: '',
    }
  }

  const responseMock = {}; 

  const authorizerMock = {
    validateToken: jest.fn(),
  }

  const usersDBAccessMock = {};

  beforeEach(() => {
    dataHandler = new DataHandler(
      requestMock as any,
      responseMock as any,
      authorizerMock as any,
      usersDBAccessMock as any,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    requestMock.headers.authorization = '';
  });

  it('operationAuthorized return right auth', async () => {
    requestMock.headers.authorization = 'afafdaf';
    authorizerMock.validateToken.mockReturnValueOnce({
      status: 0,
      accessRights: [0, 1, 2, 3],
    });

    const auth = await (dataHandler as any).operationAuthorized(0);
    expect(auth).toBe(true);
    expect(auth).toBeTruthy();
  });

  it('operationAuthorized return unauthorized', async () => {
    requestMock.headers.authorization = 'afafdaf';
    authorizerMock.validateToken.mockReturnValueOnce({
      status: 0,
      accessRights: [1, 2, 3],
    });

    const auth = await (dataHandler as any).operationAuthorized(0);
    expect(auth).toBe(false);
    expect(auth).toBeFalsy();
  });

  it('operationAuthorized without tokenId', async () => {
    requestMock.headers.authorization = '';

    const auth = await (dataHandler as any).operationAuthorized(0);
    expect(auth).toBe(false);
    expect(auth).toBeFalsy();
  });
});