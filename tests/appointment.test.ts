
const mockSend = jest.fn();
const mockSNSend = jest.fn();
  jest.mock("@aws-sdk/lib-dynamodb", () => ({
    DynamoDBDocumentClient: {
      from: () => ({ send: mockSend })
    },
    PutCommand: jest.fn(),
    QueryCommand: jest.fn(),
    UpdateCommand: jest.fn(),
  }));
  jest.mock("@aws-sdk/client-sns", () => ({
    SNSClient: jest.fn(() => ({ send: mockSNSend })),
    PublishCommand: jest.fn(),
  }));

import { handlePost, handleGet } from "../src/handlers/appointment";
import { APIGatewayProxyEvent } from "aws-lambda";


describe("handlePost", () => {
  beforeEach(() => {
    mockSend.mockClear();
    mockSNSend.mockClear();
  });

  it("debe retornar 400 si faltan parámetros", async () => {
    const event = { body: JSON.stringify({ insuredId: "01234" }) } as APIGatewayProxyEvent;
    const result = await handlePost(event);
    expect(result.statusCode).toBe(400);
  });

  it("debe retornar 400 si countryISO es inválido", async () => {
    const event = { body: JSON.stringify({ insuredId: "01234", scheduleId: 1001, countryISO: "AR" }) } as APIGatewayProxyEvent;
    const result = await handlePost(event);
    expect(result.statusCode).toBe(400);
  });

  it("debe retornar 200 si la petición es válida", async () => {
    mockSend.mockResolvedValue({});
    mockSNSend.mockResolvedValue({});
    const event = { body: JSON.stringify({ insuredId: "01234", scheduleId: 1001, countryISO: "PE" }) } as APIGatewayProxyEvent;
    const result = await handlePost(event);
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).message).toBe("Agendamiento en proceso");
  });
});

describe("handleGet", () => {
  beforeEach(() => {
    mockSend.mockClear();
  });

  it("debe retornar 400 si falta insuredId", async () => {
    const event: APIGatewayProxyEvent = {
      body: null,
      headers: {},
      multiValueHeaders: {},
      httpMethod: "GET",
      isBase64Encoded: false,
      path: "",
      pathParameters: {},
      queryStringParameters: null,
      multiValueQueryStringParameters: null,
      stageVariables: null,
      requestContext: {} as any,
      resource: "",
    };
    const result = await handleGet(event);
    expect(result.statusCode).toBe(400);
  });

  it("debe retornar 200 y lista vacía si no hay citas", async () => {
    mockSend.mockResolvedValue({ Items: [] });
    const event: APIGatewayProxyEvent = {
      body: null,
      headers: {},
      multiValueHeaders: {},
      httpMethod: "GET",
      isBase64Encoded: false,
      path: "",
      pathParameters: { insuredId: "01234" },
      queryStringParameters: null,
      multiValueQueryStringParameters: null,
      stageVariables: null,
      requestContext: {} as any,
      resource: "",
    };
    const result = await handleGet(event);
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual([]);
  });

  it("debe retornar 200 y lista de citas si existen", async () => {
    mockSend.mockResolvedValue({ Items: [{ id: "1", insuredId: "01234", status: "pending" }] });
    const event: APIGatewayProxyEvent = {
      body: null,
      headers: {},
      multiValueHeaders: {},
      httpMethod: "GET",
      isBase64Encoded: false,
      path: "",
      pathParameters: { insuredId: "01234" },
      queryStringParameters: null,
      multiValueQueryStringParameters: null,
      stageVariables: null,
      requestContext: {} as any,
      resource: "",
    };
    const result = await handleGet(event);
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual([{ id: "1", insuredId: "01234", status: "pending" }]);
  });
});
