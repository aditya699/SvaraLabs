export function openSttSocket({ onDelta, onFinal, onError, onOpen, onClose } = {}) {
  const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
  const base = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/^http/, "ws")
    : `${proto}//${window.location.host}`;
  const url = `${base}/api/v1/stt`;

  const ws = new WebSocket(url);

  ws.onopen = () => {
    console.log("[STT] WS open:", url);
    onOpen?.();
  };
  ws.onclose = (e) => {
    console.log("[STT] WS closed:", e.code, e.reason);
    onClose?.();
  };
  ws.onerror = (e) => {
    console.error("[STT] WS error:", e);
    onError?.(e);
  };
  ws.onmessage = (evt) => {
    try {
      const msg = JSON.parse(evt.data);
      if (msg.type === "delta") onDelta?.(msg.text);
      else if (msg.type === "final") onFinal?.(msg.text);
      else if (msg.type === "error") onError?.(new Error(msg.message));
    } catch {
      // ignore non-JSON frames
    }
  };

  return {
    socket: ws,
    sendAudio: (base64Pcm16) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "audio", data: base64Pcm16 }));
      }
    },
    commit: () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "commit" }));
      }
    },
    close: () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    },
  };
}
