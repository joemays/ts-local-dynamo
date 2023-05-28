import {
  CreateTableCommand,
  CreateTableInput,
  DeleteTableCommand,
  DynamoDBClient,
  DynamoDBClientConfig
} from '@aws-sdk/client-dynamodb';
import { GenericContainer, StartedTestContainer } from 'testcontainers';

/**
 * Properties to start local dynamo.
 */
export interface LocalDynamoConfig {
  /**
   * docker image, defaults to "amazon/dynamodb-local"
   */
  image?: string;
  /**
   * tables to create
   */
  tables?: CreateTableInput[];
}

export const defaultConfig = {
  dockerCommand: 'docker',
  image: 'amazon/dynamodb-local',
  tables: []
};

/**
 * Class for testing with AWS local dynamo docker image.
 */
export class LocalDynamo {
  public port!: number;
  private container!: StartedTestContainer;

  /**
   * Creates and starts local dynamo, optionally creating tables.
   * @param config config options
   */
  static async start(config: LocalDynamoConfig = {}): Promise<LocalDynamo> {
    const result = new LocalDynamo({
      ...defaultConfig,
      ...config
    });
    await result.start();
    await result.createTables();
    return result;
  }

  protected constructor(public readonly config: Required<LocalDynamoConfig>) {}

  protected get defaultNewClientParams() {
    return {
      endpoint: `http://localhost:${this.port}`,
      region: 'local',
      credentials: {
        accessKeyId: 'fakeMyKeyId',
        secretAccessKey: 'fakeSecretAccessKey'
      }
    };
  }

  public async recreateTables() {
    await this.deleteTables();
    await this.createTables();
  }

  public async stop() {
    await this.container?.stop();
  }

  public newClient(config: DynamoDBClientConfig = {}): DynamoDBClient {
    return new DynamoDBClient({ ...config, ...this.defaultNewClientParams });
  }

  protected async start() {
    try {
      const containerPort = 8000;
      this.container = await new GenericContainer(this.config.image).withExposedPorts(containerPort).start();
      this.port = this.container.getMappedPort(containerPort);
    } catch (err) {
      console.error('Could not run dynamo docker container; is docker installed and able to run containers?');
      await this.stop();
    }
  }

  protected async createTables() {
    const client = this.newClient();
    const promises = this.config.tables.map(t => client.send(new CreateTableCommand(t)));
    return Promise.all(promises);
  }

  protected async deleteTables() {
    const client = this.newClient();
    const promises = this.config.tables.map(t => client.send(new DeleteTableCommand({ TableName: t.TableName })));
    return Promise.all(promises);
  }
}
