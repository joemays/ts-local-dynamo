import { GenericContainer, StartedTestContainer } from "testcontainers";

/**
 * Properties to start local dynamo.
 */
export interface LocalDynamoConfig<T> {
  /**
   * docker image, defaults to "amazon/dynamodb-local"
   */
  image?: string;
  /**
   * tables to create
   */
  tables?: T[];
}

export const defaultConfig = {
  dockerCommand: "docker",
  image: "amazon/dynamodb-local",
  tables: []
};

/**
 * Class for testing with AWS local dynamo docker image.
 */
export abstract class LocalDynamo<T> {
  public port!: number;
  private container!: StartedTestContainer;

  protected constructor(
    public readonly config: Required<LocalDynamoConfig<T>>
  ) {
  }

  protected get defaultNewClientParams() {
    return {
      endpoint: `http://localhost:${this.port}`,
      region: "local",
      credentials: {
        accessKeyId: "fakeMyKeyId",
        secretAccessKey: "fakeSecretAccessKey"
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

  protected async start() {
    try {
      const containerPort = 8000;
      this.container = await new GenericContainer(this.config.image)
        .withExposedPorts(containerPort)
        .start();
      this.port = this.container.getMappedPort(containerPort);
    } catch (err) {
      console.error(
        "Could not run dynamo docker container; is docker installed and able to run containers?"
      );
      await this.stop();
    }
  }

  protected abstract createTables(): Promise<any>;

  protected abstract deleteTables(): Promise<any>;
}
