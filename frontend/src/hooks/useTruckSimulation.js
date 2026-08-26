import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Frontend-only truck movement simulation.
 *
 * Uses the truck's API latitude/longitude as the INITIAL position.
 * Simulates movement by incrementing lat/lng by a small amount per tick.
 * Never modifies the original truck object.
 *
 * @param {Object|null} truck - Normalized truck object from the API
 * @param {boolean} isRunning - Whether simulation is active
 * @returns {{ latitude: number, longitude: number }}
 */
export default function useTruckSimulation(truck, isRunning) {
  const [position, setPosition] = useState({ latitude: 0, longitude: 0 });
  const intervalRef = useRef(null);
  const truckIdRef = useRef(null);

  // Initialize position when truck changes
  useEffect(() => {
    if (!truck) {
      setPosition({ latitude: 0, longitude: 0 });
      truckIdRef.current = null;
      return;
    }

    const lat = Number(truck.latitude);
    const lng = Number(truck.longitude);

    // Only initialize if coordinates are valid
    if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
      setPosition({ latitude: lat, longitude: lng });
      truckIdRef.current = truck.truckId || truck.id;
    } else {
      setPosition({ latitude: 0, longitude: 0 });
      truckIdRef.current = null;
    }
  }, [truck?.truckId, truck?.id, truck?.latitude, truck?.longitude]);

  // Simulation interval
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Don't run if not running or no valid truck
    if (!isRunning || !truck) return;

    const lat = Number(truck.latitude);
    const lng = Number(truck.longitude);

    if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) return;

    // Don't simulate for ARRIVED trucks
    if (truck.status === "ARRIVED") return;

    intervalRef.current = setInterval(() => {
      setPosition((prev) => ({
        latitude: prev.latitude + 0.00005,
        longitude: prev.longitude + 0.00005,
      }));
    }, 300);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, truck?.truckId, truck?.id, truck?.latitude, truck?.longitude, truck?.status]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Check if GPS data is available
  const hasGps = truck
    ? !isNaN(Number(truck.latitude)) &&
      !isNaN(Number(truck.longitude)) &&
      Number(truck.latitude) !== 0 &&
      Number(truck.longitude) !== 0
    : false;

  return { position, hasGps };
}
