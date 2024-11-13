import * as dotenv from "dotenv";

dotenv.config();

export const config = {
  host: process.env.HOST!,
  port: parseInt(process.env.PORT!, 10),
  environment: process.env.NODE_ENV,
};
