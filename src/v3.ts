import { defaultConfig, LocalDynamo, LocalDynamoConfig } from "./localDynamo";
import {
  CreateTableCommand,
  CreateTableInput,
  DeleteTableCommand,
  DynamoDBClient,
  DynamoDBClientConfig,
} from "@aws-sdk/client-dynamodb";

export interface LocalDynamoConfigV3
  extends LocalDynamoConfig<CreateTableInput> {}

export class LocalDynamoV3 extends LocalDynamo<CreateTableInput> {
  /**
   * Creates and starts local dynamo with AWS SDK V3, optionally creating tables.
   * @param config config options
   */
  static async start<T>(
    config: LocalDynamoConfigV3 = {}
  ): Promise<LocalDynamoV3> {
    const result = new LocalDynamoV3({
      ...defaultConfig,
      ...config,
    });
    await result.start();
    await result.createTables();
    return result;
  }

  public newClient(config: DynamoDBClientConfig = {}): DynamoDBClient {
    return new DynamoDBClient({ ...config, ...this.defaultNewClientParams });
  }

  protected async createTables() {
    const client = this.newClient();
    const promises = this.config.tables.map((t) =>
      client.send(new CreateTableCommand(t))
    );
    return Promise.all(promises);
  }

  protected async deleteTables() {
    const client = this.newClient();
    const promises = this.config.tables.map((t) =>
      client.send(new DeleteTableCommand({ TableName: t.TableName }))
    );
    return Promise.all(promises);
  }
}
