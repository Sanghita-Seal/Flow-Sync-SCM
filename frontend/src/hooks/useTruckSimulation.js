import { useState, useEffect, useRef } from "react";

export default function useTruckSimulation(truck, isRunning) {
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

    intervalRef.current = setInterval(() => {
      setPosition((prev) => {
        if (!prev) return prev;
        return {
          latitude: prev.latitude + 0.00005,
          longitude: prev.longitude + 0.00005,
        };
      });
    }, 300);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, truck?.truckId, truck?.id, truck?.latitude, truck?.longitude, truck?.status]);

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
