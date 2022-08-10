import {
  CreateTableCommandInput,
  ListTablesCommand,
} from "@aws-sdk/client-dynamodb";
import { LocalDynamoV3 } from "./localDynamoV3";

const sampleTable: CreateTableCommandInput = {
  AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
  KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
  ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
  TableName: "TestTable",
};

let dynamo: LocalDynamoV3;
beforeAll(async () => {
  dynamo = await LocalDynamoV3.start({ tables: [sampleTable] });
});

beforeEach(async () => {
  if (dynamo) await dynamo.recreateTables();
});

afterAll(() => {
  if (dynamo) dynamo.stop();
});

test("Table created successfully", async () => {
  const client = dynamo.newClient();
  const command = new ListTablesCommand({});
  const result = await client.send(command);
  expect(result.TableNames).toContain("TestTable");
});
