import http from "node:http";
import { WebSocketServer } from "ws";
import { server as wisp } from "@mercuryworkshop/wisp-js/server";

const server = http.createServer((_req, res) => {
  res.writeHead(200, {
    "content-type": "application/json",
    "cache-control": "no-store"
  });
  res.end(JSON.stringify({ ok: true, service: "transport" }));
});

server.on("upgrade", (req, socket, head) => {
  try {
    wisp.routeRequest(req, socket, head);
  } catch {
    socket.destroy();
  }
});

export default server;
