import { WebSocket, WebSocketServer } from "ws";
import dotenv from "dotenv";

dotenv.config();

const PORT = Number(process.env.PORT);
const wss = new WebSocketServer({ port: PORT });

export interface RequestData {
  event:
    | "client:connect"
    | "client:disconnect"
    | "client:offer"
    | "client:answer"
    | "client:iceCandidate"
    | "client:call"
    | "client:answerCall";
  uid: number;
  [data: string]: any;
}

export interface ResponseData {
  event:
    | "server:userlist"
    | "server:offer"
    | "server:answer"
    | "server:iceCandidate";

  [data: string]: any;
}

function broadcast(data: ResponseData, sockets: Set<WebSocket>) {
  for (let socket of sockets) {
    socket.send(JSON.stringify(data));
  }
}

function getUids(sockets: Set<WebSocket>) {
  let uids: Set<number> = new Set();
  for (let socket of sockets) {
    if (socket.uid) {
      uids.add(socket.uid);
    }
  }
  return Array.from(uids);
}

function getByUid(sockets: Set<WebSocket>, uid: number) {
  for (let socket of sockets) {
    if (socket?.uid === uid) {
      return socket;
    }
  }
  return undefined;
}

wss.on("connection", function connection(socket: WebSocket) {
  // clientList.add(socket)

  socket.on("message", (dataString: string) => {
    let data: RequestData;
    try {
      data = JSON.parse(dataString.toString());
    } catch (error) {
      return socket.send("We do not support this event");
    }

    switch (data.event) {
      case "client:connect": {
        console.log(data.uid, "connected");
        socket.uid = data.uid;
        const response: ResponseData = {
          event: "server:userlist",
          userlist: getUids(wss.clients),
        };

        broadcast(response, wss.clients);
        break;
      }

      case "client:offer": {
        const { receiverUid, offer } = data;
        const receiverSocket = getByUid(wss.clients, receiverUid);

        const response: ResponseData = {
          event: "server:offer",
          offer: offer,
          callerUid: socket.uid,
        };

        receiverSocket?.send(JSON.stringify(response));
        break;
      }
      case "client:answer": {
        const { callerUid, answer } = data;

        const receiverSocket = getByUid(wss.clients, callerUid);

        const response: ResponseData = {
          event: "server:answer",
          answer,
          answererUid: socket.uid,
        };

        receiverSocket?.send(JSON.stringify({ ...response }));
        break;
      }
      case "client:iceCandidate": {
        const { receiverUid, candidates } = data;
        const receiverSocket = getByUid(wss.clients, receiverUid);
        console.log(socket.uid, receiverSocket?.uid);

        const response: ResponseData = {
          event: "server:iceCandidate",
          candidates,
          receiverUid,
        };
        receiverSocket?.send(JSON.stringify(response));
        break;
      }
      case "client:call": {
      }
      default: {
        socket.send(
          JSON.stringify({ message: "We do not support this event" })
        );
      }
    }
  });
  socket.onclose = () => {
    const data: ResponseData = {
      event: "server:userlist",
      userlist: getUids(wss.clients),
    };
    broadcast(data, wss.clients);
  };
});
export { WebSocket };
