import winston from "winston";
import os from "os";

import { config } from "./config";
import { buildDummyIntegration } from "./src";
import { buildApp } from "./app";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

const dummyIntegration = buildDummyIntegration();

const app = buildApp({ logger, integration: dummyIntegration });

app.listen(config.port, async () => {
  logger.info("server.running", {
    env: config.environment,
    port: config.port,
  });

  logger.info("server.information", {
    hostname: os.hostname(),
    platform: os.platform(),
    osRelease: os.release(),
    totalMemory: `${(os.totalmem() / 1024 ** 3).toFixed(2)} GB`, // bytes to GB
  });
});
