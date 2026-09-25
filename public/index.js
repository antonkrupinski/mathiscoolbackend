import http from "node:http";
import express from "express";
import { bootstrap } from "@mercuryworkshop/proxy-bootstrap";

const app = express();

// Scramjet needs cross-origin isolation for some browser/WASM paths.
app.use((_req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

const { routeRequest, routeUpgrade } = await bootstrap({
  transport: "libcurl"
});

// Bootstrap serves Scramjet's service worker, controller, core, WASM,
// transport client, and Wisp request/upgrade handlers.
app.use((req, res, next) => {
  if (routeRequest(req, res)) return;
  next();
});

app.use(express.static("public", { extensions: ["html"] }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "scramjet2", transport: "libcurl" });
});

const server = http.createServer(app);

server.on("upgrade", (req, socket, head) => {
  if (routeUpgrade(req, socket, head)) return;
  socket.end();
});

export default server;
