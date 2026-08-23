import { useEffect } from "react";

/**
 * Subscribes to the live truck feed from Socket.IO.
 * Listens for both event name candidates seen so far so it keeps
 * working whichever one backend ships — confirm the final one later.
 *
 * @param {import('socket.io-client').Socket} socket
 * @param {(updater: (prev: any[]) => any[]) => void} setTrucks
 */
export function useTruckSocket(socket, setTrucks) {
  useEffect(() => {
    if (!socket) return;

    const upsert = (data) => {
      const id = data.truckId || data.id;
      setTrucks((prev) => {
        const exists = prev.some((t) => (t.truckId || t.id) === id);
        if (exists) {
          return prev.map((t) => ((t.truckId || t.id) === id ? { ...t, ...data } : t));
        }
        return [...prev, data];
      });
    };

    socket.on("truck:update", upsert);
    socket.on("truck:locationUpdated", upsert);

    return () => {
      socket.off("truck:update", upsert);
      socket.off("truck:locationUpdated", upsert);
    };
  }, [socket, setTrucks]);
}
