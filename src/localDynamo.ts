import { execSync, ExecSyncOptionsWithStringEncoding } from "child_process";
import * as http from "http";

/**
 * Properties to start local dynamo.
 */
export interface LocalDynamoConfig<T> {
  /**
   * docker command, defaults to "docker"
   */
  dockerCommand?: string;
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
  tables: [],
};

const execOptions: ExecSyncOptionsWithStringEncoding = {
  timeout: 1000,
  encoding: "utf8",
};

/**
 * Class for testing with AWS local dynamo docker image.
 */
export abstract class LocalDynamo<T> {
  protected containerId?: string;
  protected port?: number;

  protected constructor(
    public readonly config: Required<LocalDynamoConfig<T>>
  ) {}

  protected start() {
    try {
      const runCmd = `${this.config.dockerCommand} run -d -p 8000 --rm ${this.config.image}`;
      const runOut = execSync(runCmd, execOptions);
      this.containerId = runOut.trim();
      const portCmd = `docker port ${this.containerId} 8000`;
      const portOut = execSync(portCmd, execOptions);
      this.port = Number(portOut.substring(portOut.lastIndexOf(":") + 1));
    } catch (err) {
      console.error(
        "Could not run dynamo docker container; is docker installed and able to run containers?"
      );
      this.stop();
    }
  }

  // inspired by https://github.com/sindresorhus/wait-for-localhost
  protected async wait(): Promise<void> {
    return new Promise((resolve, reject) => {
      const check = () => {
        if (this.port) {
          setTimeout(() => {
            http
              .request(
                { method: "GET", port: this.port, path: "/" },
                (response) => {
                  if (response.statusCode === 400) {
                    return resolve();
                  }
                  check();
                }
              )
              .on("error", check)
              .end();
          }, 100);
        } else {
          return reject("Local dynamo stopped");
        }
      };
      check();
    });
  }

  protected get defaultNewClientParams() {
    return {
      endpoint: `http://localhost:${this.port}`,
      region: "local",
      credentials: {
        accessKeyId: "fakeMyKeyId",
        secretAccessKey: "fakeSecretAccessKey",
      },
    };
  }

  protected abstract createTables(): Promise<any>;

  protected abstract deleteTables(): Promise<any>;

  public async recreateTables() {
    await this.deleteTables();
    await this.createTables();
  }

  public stop() {
    if (this.containerId) {
      try {
        execSync(
          `${this.config.dockerCommand} stop ${this.containerId}`,
          execOptions
        );
      } catch (err) {
        console.error(`Error stopping docker container '${this.containerId}'`);
      } finally {
        this.port = undefined;
        this.containerId = undefined;
      }
    }
  }
}
