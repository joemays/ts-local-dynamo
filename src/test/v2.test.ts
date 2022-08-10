import { DynamoDB } from "aws-sdk";
import { LocalDynamoV2 } from "../v2";

const sampleTable: DynamoDB.CreateTableInput = {
  AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
  KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
  ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
  TableName: "TestTable",
};

let dynamo: LocalDynamoV2;
beforeAll(async () => {
  dynamo = await LocalDynamoV2.start({ tables: [sampleTable] });
});

beforeEach(async () => {
  if (dynamo) await dynamo.recreateTables();
});

afterAll(() => {
  if (dynamo) dynamo.stop();
});

test("Table created successfully", async () => {
  const client = dynamo.newClient();
  const result = await client.listTables().promise();
  expect(result.TableNames).toContain("TestTable");
});
