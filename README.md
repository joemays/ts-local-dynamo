# ts-local-dynamo

**Test locally with Amazon DynamoDB Local Docker image**

[![version](https://img.shields.io/npm/v/ts-local-dynamo.svg?style=flat-square)](https://www.npmjs.com/package/ts-local-dynamo)

## Installing

```sh
npm install ts-local-dynamo
```

## Usage

Use the class that corresponds to the version of the
[AWS SDK for JavaScript](https://aws.amazon.com/sdk-for-javascript/) you are using.

For [v2](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/):

```typescript
import { LocalDynamoV2 } from "ts-local-dynamo/dist/v2";
```

For [v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)

```typescript
import { LocalDynamoV3 } from "ts-local-dynamo/dist/v3";
```

### Starting

Start a local container using the static `start` method on your class. Provide any tables you'd like to have created in
the `config` parameter. For example, with AWS SDK V3:

```typescript
import { LocalDynamoV3 } from "ts-local-dynamo/dist/v3";

const tables: CreateTableInput[] = []; // add your tables here
const localDynamo = LocalDynamoV3.start({ tables });
```

### Recreating Tables

You might want to clear the database, e.g. in between unit test runs. Use `localDynamo.recreateTables()` to do this.

### Getting a new Dynamo client

Use `localDynamo.newClient()` to get a new client (`DynamoDBClient` in v2, `DynamoDB` in v3) configured to
work against the local instance.

For details, see `DynamoDBClient.defaultNewClientParams` in `base.ts`.

### Stopping

Stop the local container using `localDynamo.stop()`.

### Unit Testing

1. Start the local instance *before* running any tests.
2. Recreate tables before each test.
3. Stop the local instance *after* all tests are run.

For example, with SDK v3 and jest:

```typescript
import { LocalDynamoV3 } from "ts-local-dynamo/dist/v3";

let dynamo: LocalDynamoV3;

beforeAll(async () => {
  const tables: CreateTableInput[] = []; // add your table definitions
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
  // do something with client
});
```

### Configuration

You can specify an alternative Docker image name and a custom docker command. See `LocalDynamoConfig` for details.

## Contributing

We're happy to accept contributions!  Please open an issue before sending a PR to discuss proposed changes. This is so
we can discuss implementation and make sure there is no duplicate effort
