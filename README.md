# ts-local-dynamo

**Test locally with Amazon DynamoDB Local Docker image**

[![version](https://img.shields.io/npm/v/ts-local-dynamo.svg?style=flat-square)](https://www.npmjs.com/package/ts-local-dynamo)

Note: as of v2.0.0 we no longer support AWS SDK v2.

## Installing

```sh
pnpm install ts-local-dynamo
```

### Starting

Start a local container using the static `start` method on your class. Provide any tables you'd like to have created in
the `config` parameter.

For example, with AWS SDK V3:

```typescript
import { LocalDynamo } from 'ts-local-dynamo';

const tables: CreateTableInput[] = []; // add your tables here
const localDynamo = await LocalDynamo.start({ tables });
```

### Recreating Tables

To clear the database in between unit test runs, use `await localDynamo.recreateTables()`.

### Getting a new Dynamo client

Use `localDynamo.newClient()` to get a new AWS SDK Dynamo client configured to work with the container instance.

### Stopping

Stop the local container using `localDynamo.stop()`.

### Unit Testing

1. Start the local instance _before_ running any tests.
2. Recreate tables before each test.
3. Stop the local instance _after_ all tests are run.

For example, with vitest or jest:

```typescript
import { LocalDynamo } from 'ts-local-dynamo';

let dynamo: LocalDynamo;

beforeAll(async () => {
  const tables: CreateTableInput[] = []; // add your table definitions
  dynamo = await LocalDynamo.start({ tables });
});

beforeEach(async () => {
  if (dynamo) await dynamo.recreateTables();
});

afterAll(async () => {
  if (dynamo) await dynamo.stop();
});

test('my test', async () => {
  const client = dynamo.newClient();
  // do something with client
});
```

### Configuration

You can specify an alternative Docker image name. See `LocalDynamoConfig` for details.

## Contributing

We're happy to accept contributions! Please open an issue before sending a PR to discuss proposed changes. This is so
we can discuss implementation and make sure there is no duplicate effort
