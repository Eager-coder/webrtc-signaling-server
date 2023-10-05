import { WebSocket } from "ws";

export class ClientList {
  clients: Map<WebSocket, { uid: string; isAvailable: boolean }>;

  constructor() {
    this.clients = new Map<WebSocket, { uid: string; isAvailable: boolean }>();
  }
  add(uid: string, socket: WebSocket) {
    this.clients.set(socket, { uid, isAvailable: true });
  }
  delete(socket: WebSocket) {
    this.clients.delete(socket);
  }
  get(uid: string): WebSocket | undefined {
    for (const [socket, clientData] of this.clients.entries()) {
      if (clientData.uid === uid) {
        return socket;
      }
    }

    return undefined;
  }
  broadcastExcept(uid: string, data: ResponseData): void {
    for (const [socket, clientData] of this.clients.entries()) {
      socket.send(JSON.stringify(data));
      if (clientData.uid !== uid) {
      }
    }
  }
  broadcast(data: ResponseData): void {
    for (const [socket, clientData] of this.clients.entries()) {
      socket.send(JSON.stringify(data));
    }
  }
  getUidsExcept(uid: string): string[] {
    const uids: string[] = [];

    for (const [socket, clientData] of this.clients.entries()) {
      console.log(clientData);
      if (clientData.uid !== uid) {
        uids.push(clientData.uid);
      }
    }
    return uids;
  }
  getUids(): string[] {
    const uids: string[] = [];

    for (const [socket, clientData] of this.clients.entries()) {
      uids.push(clientData.uid);
    }
    return uids;
  }
}
