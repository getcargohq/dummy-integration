import express, { NextFunction, Response, Request, Router } from "express";
import { Logger } from "winston";
import bodyParser from "body-parser";
import cors from "cors";
import { Integration } from "./types";

type Dependencies = {
  logger: Logger;
  integration: Integration;
};

export const buildApp = (dependencies: Dependencies) => {
  const { logger, integration } = dependencies;

  const integrationRouter = Router();

  integrationRouter.get("/manifest", (req, res) => {
    res.json(integration.manifest);
  });

  integrationRouter.post("/authenticate", async (req, res) => {
    const result = await integration.authenticate(req.body);

    res.json(result);
  });

  integrationRouter.post("/listUsers", async (req, res) => {
    if (integration.listUsers === undefined) {
      res.status(404);
      return;
    }

    const result = await integration.listUsers(req.body);

    res.json(result);
  });

  integrationRouter.post("/actions/:slug/validate", async (req, res) => {
    const { slug } = req.params;

    if (integration.actions[slug] === undefined) {
      res.status(404);
      return;
    }

    const result = await integration.actions[slug].validate(req.body);

    res.json(result);
  });

  integrationRouter.post("/actions/:slug/execute", async (req, res) => {
    const { slug } = req.params;

    if (integration.actions[slug] === undefined) {
      res.status(404);
      return;
    }

    const result = await integration.actions[slug].execute(req.body);

    res.json(result);
  });

  integrationRouter.post("/model/fetch", async (req, res) => {
    if (integration.model === undefined) {
      res.status(404);
      return;
    }

    const result = await integration.model.fetch(req.body);

    res.json(result);
  });

  integrationRouter.post("/model/count", async (req, res) => {
    if (
      integration.model === undefined ||
      integration.model.count === undefined
    ) {
      res.status(404);
      return;
    }

    const result = await integration.model.count(req.body);

    res.json(result);
  });

  integrationRouter.post("/autocomplete", async (req, res) => {
    if (integration.autocomplete === undefined) {
      res.status(404);
      return;
    }

    const result = await integration.autocomplete(req.body);

    res.json(result);
  });

  integrationRouter.post("/getDynamicSchema", async (req, res) => {
    if (integration.getDynamicSchema === undefined) {
      res.status(404);
      return;
    }

    const result = await integration.getDynamicSchema(req.body);

    res.json(result);
  });

  integrationRouter.post("/completeOauth", async (req, res) => {
    if (integration.completeOauth === undefined) {
      res.status(404);
      return;
    }

    const result = await integration.completeOauth(req.body);

    res.json(result);
  });

  const app = express();

  app.use(bodyParser.json());
  app.use(cors());

  app.use("/", integrationRouter);

  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error(err);
    res.status(500).json({
      errorMessage: "Internal Server Error",
    });
  });

  return app;
};
