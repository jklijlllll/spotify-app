import { useState, useEffect } from "react";
import { TrackInterface } from "../Types/SpotifyApi";

export default function useHistoryLoad(
  offset: number,
  limit: number,
  replace: boolean
) {
  const [loading, setLoading] = useState<boolean>(false);
  const [tracks, setTracks] = useState<TrackInterface[]>([]);

  const [hasMore, setHasMore] = useState<boolean>(false);

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
    setTracks(historyTracks.slice(0, tracks.length));
    // eslint-disable-next-line
  }, [historyTracks]);

  useEffect(() => {
    if (loading) return;
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
  }, [offset]);

  return { loading, hasMore, tracks };
}
