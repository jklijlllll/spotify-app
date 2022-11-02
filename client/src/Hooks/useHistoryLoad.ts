import { useState, useEffect } from "react";
import { TrackInterface } from "../Types/SpotifyApi";

export default function useHistoryLoad(
  offset: number,
  limit: number,
  replace: boolean
) {
  const [histLoading, setLoading] = useState<boolean>(false);
  const [histTracks, setTracks] = useState<TrackInterface[]>([]);

  const [histHasMore, setHasMore] = useState<boolean>(false);

  const [historyTracks, setHistoryTracks] = useState<TrackInterface[]>([]);

  const maxLength = historyTracks.length;

  const updateTracks = () => {
    if (localStorage.getItem("history")) {
      setHistoryTracks(JSON.parse(localStorage.getItem("history")!).reverse());
    }
  };

  useEffect(() => {
    updateTracks();

    window.addEventListener("changed", updateTracks);

    return () => {
      window.removeEventListener("changed", updateTracks);
    };
  }, []);

  useEffect(() => {
    setTracks([]);
  }, []);

  useEffect(() => {
    setTracks(historyTracks.slice(0, histTracks.length));
    // eslint-disable-next-line
  }, [historyTracks]);

  useEffect(() => {
    if (histLoading) return;
    setLoading(true);

    let endIndex;

    if (limit + offset >= maxLength) {
      endIndex = maxLength;
      setHasMore(false);
    } else {
      endIndex = limit + offset;
      setHasMore(true);
    }

    const newTracks = historyTracks.slice(offset, endIndex);

    if (replace) {
      setTracks(newTracks);
    } else {
      setTracks((t) => [...t, ...newTracks]);
    }
    setLoading(false);
    // eslint-disable-next-line
  }, [offset, historyTracks]);

  return { histLoading, histHasMore, histTracks };
}
