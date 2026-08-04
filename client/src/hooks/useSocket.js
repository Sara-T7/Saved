import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

let socketInstance = null;

export function useSocket() {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!socketInstance) {
      socketInstance = io("http://localhost:5000", {
        transports: ["websocket"],
        autoConnect: true,
      });
    }
    socketRef.current = socketInstance;
    return () => {};
  }, []);

  return socketRef;
}
