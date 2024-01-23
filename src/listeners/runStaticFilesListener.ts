import Koa from "koa";
import path from "path";
import { fileURLToPath } from "url";
import Router from "koa-router";
import send from "koa-send";
import serve from "koa-static";
import { type ServerConfig } from "../repositories/configRepository.js";

export default function runStaticFilesListeners(serverConfig: ServerConfig) {
  const appStatic = new Koa();
  const routerStatic = new Router();

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  appStatic.use(serve(__dirname + "/static"));

  // По поводу такого подхода можно развести много разговоров
  // Можно задублировать, что я предпочитаю не делать, но это более читабельно
  // Можно использовать шаблон, но он будет действовать на диапазон выходящий за пределы этих трех значений
  // Могу переписать на любой из вариантов выше, если нужно, но сам остановился на этом
  ["1", "2", "3"].forEach((addressNumber) =>
    routerStatic.get(`/${addressNumber}.html`, async (context) => {
      const pathToHtmlFile = path.join("static/index.html");
      await send(context, pathToHtmlFile);
    }),
  );

  appStatic.use(routerStatic.routes());
  appStatic.listen(serverConfig.staticFilesPort);
}
