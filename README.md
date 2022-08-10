# ts-local-dynamo

**Test locally with Amazon DynamoDB Local Docker image**

[![version](https://img.shields.io/npm/v/ts-local-dynamo.svg?style=flat-square)](https://www.npmjs.com/package/ts-local-dynamo)

## Installing

```sh
npm install ts-local-dynamo
```

## Usage

Use the class that corresponds to the version of the
[AWS SDK for JavaScript](https://aws.amazon.com/sdk-for-javascript/) you are using:

- for [v2](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/), use `LocalDynamoV2`
- for [v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/), use `LocalDynamoV3`

### Starting

Start a local container using the static `start` method on your class. Provide any tables you'd like to have created in
the `config` parameter, e.g. for AWS SDK V3:

```typescript
const tables: CreateTableInput[] = []; // add your tables here
const localDynamo = LocalDynamoV3.start({ tables });
```

### Recreating Tables

You might want to clear the database, e.g. in between unit test runs. Use `recreateTables()` to do this.

### Getting a new Dynamo client

Use `LocalDynamo.newClient()` to get a new client (`DynamoDBClient` in v2, `DynamoDB` in v3) configured to
work against the local instance.

For details, see `DynamoDBClient.defaultNewClientParams`.

### Stopping

Stop the local container using `stop()`.

### Unit Testing

See `localDynamoV2.test.ts` and `localDynamoV3.test.ts` for examples of how to use with Jest specifically.

For example, with SDK v3:

```typescript
let dynamo: LocalDynamoV3;
beforeAll(async () => {
  const tables = []; // add your table definitions
  dynamo = await LocalDynamoV3.start({ tables });
});

beforeEach(async () => {
  if (dynamo) await dynamo.recreateTables();
});

afterAll(() => {
  if (dynamo) dynamo.stop();
});

test("my test", async () => {
  const client = dynamo.newClient();
  // do something with client here
});
```

### Configuration

You can specify an alternative Docker image name and a custom docker command. See `LocalDynamoConfig` for details.

## Contributing

We're happy to accept contributions!  Please open an issue before sending a PR to discuss proposed changes. This is so
we can discuss implementation and make sure there is no duplicate effort
