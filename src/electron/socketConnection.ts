import { WebSocket } from "ws";
export function socketConnect() {
  const ws = new WebSocket("ws://localhost:8000");
}
