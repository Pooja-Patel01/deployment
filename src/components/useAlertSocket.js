import { useEffect, useRef, useCallback } from "react";

const useAlertSocket = (onNewAlert) => {
  const wsRef = useRef(null);
  const retriesRef = useRef(0);
  const maxRetries = 5;

  const connect = useCallback(() => {
    // Browser WebSocket support check
    if (!window.WebSocket) {
      console.warn("WebSocket not supported, falling back to polling");
      const interval = setInterval(() => {
        const token = localStorage.getItem("token");
        fetch("http://127.0.0.1:8000/alerts", {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data) && data.length > 0) {
              onNewAlert(data[0]);
            }
          })
          .catch(() => {});
      }, 30000);
      return () => clearInterval(interval);
    }

    try {
      const ws = new WebSocket("ws://127.0.0.1:8000/ws/alerts");
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected");
        retriesRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "new_alert" && data.payload) {
            onNewAlert(data.payload);
          }
        } catch {
          console.warn("Invalid WebSocket message");
        }
      };

      ws.onclose = () => {
        console.warn("WebSocket closed, retrying...");
        if (retriesRef.current < maxRetries) {
          const delay = Math.min(1000 * 2 ** retriesRef.current, 30000);
          retriesRef.current += 1;
          setTimeout(connect, delay);
        }
      };

      ws.onerror = () => {
        ws.close();
      };

    } catch {
      console.warn("WebSocket connection failed");
    }
  }, [onNewAlert]);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [connect]);
};

export default useAlertSocket;