import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";

export const useDynamicEntity = (entity, onUpdate) => {
  const [data, setData] = useState(entity.db?.html || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isFetchingRef = useRef(false);

  const fetchData = useCallback(async () => {
    if (!entity || !entity.api || isFetchingRef.current) return;

    try {
      isFetchingRef.current = true;
      setLoading(true);
      setError(null);

      if (entity.db) {
        const lastUpdatedAt = entity.db.apiParams?.lastUpdatedAt;
        const milliseconds = (entity.refreshDuration || 0) * 1000;
        const shouldCallApi =
          !lastUpdatedAt ||
          new Date(lastUpdatedAt).getTime() + milliseconds < Date.now();

        if (!shouldCallApi) {
          setData(entity.db.html || "");
          return;
        }
      }

      const params = new URLSearchParams(entity.db?.apiParams || {}).toString();
      const url = params ? `${entity.api}?${params}` : entity.api;
      const response = await axios.get(url);

      const db = {
        ...(response.data || {}),
        apiParams: {
          ...(response.data?.apiParams || {}),
          lastUpdatedAt: new Date().toISOString(),
        },
      };

      setData(db.html || "");
      if (onUpdate) {
        onUpdate(entity._id, db);
      }
    } catch (err) {
      console.error("Error fetching dynamic entity data:", err);
      setError(err.message || "Failed to fetch data");

      if (entity.db?.html) {
        setData(entity.db.html);
      }
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
    }
  }, [entity, onUpdate]);

  useEffect(() => {
    if (!entity || !entity.api) return undefined;

    // Fetching here is syncing with an external system; the loading flag set
    // before the request starts is intentional
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();

    // if (entity.refreshDuration) {
    //   const intervalId = setInterval(fetchData, entity.refreshDuration * 1000);
    //   return () => clearInterval(intervalId);
    // }

    return undefined;
  }, [entity, fetchData]);

  return { data, loading, error, refetch: fetchData };
};
