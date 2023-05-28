import { CreateTableCommandInput, ListTablesCommand } from '@aws-sdk/client-dynamodb';
import { afterAll, beforeAll, beforeEach, expect, test } from 'vitest';
import { LocalDynamo } from './local-dynamo.js';

const sampleTable: CreateTableCommandInput = {
  AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
  KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
  ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
  TableName: 'TestTable'
};

let dynamo: LocalDynamo;
beforeAll(async () => {
  dynamo = await LocalDynamo.start({ tables: [sampleTable] });
});

beforeEach(async () => {
  if (dynamo) await dynamo.recreateTables();
});

afterAll(async () => {
  if (dynamo) await dynamo.stop();
});

test('Table created successfully', async () => {
  const client = dynamo.newClient();
  const command = new ListTablesCommand({});
  const result = await client.send(command);
  expect(result.TableNames).toContain('TestTable');
});
