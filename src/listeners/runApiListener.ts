import Koa from "koa";
import Router from "koa-router";
import { koaBody } from "koa-body";
import cors from "koa-cors";
import isInvalidEvents from "../validators/isInvalidEvents.js";
import trackScript from "../scripts/trackScript.js";
import TrackRepository from "../repositories/TrackRepository.js";
import { type ServerConfig } from "../repositories/configRepository.js";

export default function runApiListener(
  serverConfig: ServerConfig,
  trackRepository: TrackRepository,
) {
  const app = new Koa();
  const router = new Router();

  router.get("/tracker", (context) => {
    context.body = trackScript;
  });

  router.post("/track", (context) => {
    const events = JSON.parse(context.request.body);
    context.status = 200;

    if (isInvalidEvents(events)) context.status = 422;
    else trackRepository.addTracks(events);

    context.body = "";
  });

  app.use(koaBody());
  app.use(cors());
  app.use(router.routes());

  app.listen(serverConfig.apiPort);
}
