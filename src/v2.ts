import { defaultConfig, LocalDynamo, LocalDynamoConfig } from "./localDynamo";
import { DynamoDB } from "aws-sdk";

export interface LocalDynamoConfigV2
  extends LocalDynamoConfig<DynamoDB.CreateTableInput> {
}

export class LocalDynamoV2 extends LocalDynamo<DynamoDB.CreateTableInput> {
  /**
   * Creates and starts local dynamo with AWS SDK V2, optionally creating tables.
   * @param config config options
   */
  static async start<T>(
    config: LocalDynamoConfigV2 = {}
  ): Promise<LocalDynamoV2> {
    const result = new LocalDynamoV2({
      ...defaultConfig,
      ...config
    });
    await result.start();
    await result.createTables();
    return result;
  }

  public newClient(config: DynamoDB.ClientConfiguration = {}): DynamoDB {
    return new DynamoDB({ ...config, ...this.defaultNewClientParams });
  }

  protected async createTables() {
    const client = this.newClient();
    const promises = this.config.tables.map((t) =>
      client.createTable(t).promise()
    );
    return Promise.all(promises);
  }

  protected async deleteTables() {
    const client = this.newClient();
    const promises = this.config.tables.map((t) =>
      client.deleteTable({ TableName: t.TableName }).promise()
    );
    return Promise.all(promises);
  }
}
