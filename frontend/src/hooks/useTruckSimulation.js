import { useState, useEffect, useRef } from "react";

const WAREHOUSE = { latitude: 22.5726, longitude: 88.3639 };

export default function useTruckSimulation(truck, isRunning, direction = "toward") {
  const [position, setPosition] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!truck) {
      setPosition(null);
      return;
    }

    const lat = Number(truck.latitude);
    const lng = Number(truck.longitude);

    if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
      setPosition(null);
      return;
    }

    setPosition({ latitude: lat, longitude: lng });
  }, [truck?.truckId, truck?.id, truck?.latitude, truck?.longitude]);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!isRunning || !truck) return;

    const lat = Number(truck.latitude);
    const lng = Number(truck.longitude);
    if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) return;
    if (truck.status === "ARRIVED") return;

    const moveToward = direction === "toward";

    intervalRef.current = setInterval(() => {
      setPosition((prev) => {
        if (!prev) return prev;

        const dLat = WAREHOUSE.latitude - prev.latitude;
        const dLng = WAREHOUSE.longitude - prev.longitude;
        const dist = Math.sqrt(dLat * dLat + dLng * dLng);

        if (moveToward) {
          if (dist < 0.0005) return { latitude: WAREHOUSE.latitude, longitude: WAREHOUSE.longitude };
          const step = 0.00008;
          return {
            latitude: prev.latitude + (dLat / dist) * step,
            longitude: prev.longitude + (dLng / dist) * step,
          };
        } else {
          const step = 0.00008;
          if (dist < 0.0001) {
            return {
              latitude: prev.latitude + 0.0001,
              longitude: prev.longitude + 0.0001,
            };
          }
          return {
            latitude: prev.latitude - (dLat / dist) * step,
            longitude: prev.longitude - (dLng / dist) * step,
          };
        }
      });
    }, 300);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, truck?.truckId, truck?.id, truck?.latitude, truck?.longitude, truck?.status, direction]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const hasGps = truck
    ? !isNaN(Number(truck.latitude)) && !isNaN(Number(truck.longitude)) &&
      Number(truck.latitude) !== 0 && Number(truck.longitude) !== 0
    : false;

  return { position, hasGps };
}
