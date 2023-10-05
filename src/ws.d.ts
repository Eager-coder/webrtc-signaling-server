import { WebSocket as _WS, WebSocketServer as _WSS } from "ws";

declare module "ws" {
  class _WS extends WebSocket {}
  export interface WebSocket extends _WS {
    uid?: number;
  }
  export interface WebSocketServer extends _WSS {
    clients: Set<WebSocket>;
  }
}
