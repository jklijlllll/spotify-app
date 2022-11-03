import { useState, useEffect } from "react";
import { TrackInterface } from "../Types/SpotifyApi";

// TODO: add playback on click
export default function useHistoryLoad(
  offset: number,
  limit: number,
  replace: boolean
) {
  const [histLoading, setLoading] = useState<boolean>(false);
  const [histTracks, setTracks] = useState<TrackInterface[]>([]);

  const [histHasMore, setHasMore] = useState<boolean>(false);

  const [historyTracks, setHistoryTracks] = useState<TrackInterface[]>([]);
  const [replaceAll, setReplaceAll] = useState<boolean>(false);

  const maxLength = historyTracks.length;

  const updateTracks = (event?: any) => {
    if (localStorage.getItem("history")) {
      setHistoryTracks(JSON.parse(localStorage.getItem("history")!).reverse());
      if (event) setReplaceAll(event.detail.replaceAll);
    }
  };

  useEffect(() => {
    updateTracks();

    window.addEventListener("changed", function (e) {
      updateTracks(e);
    });

    return () => {
      window.removeEventListener("changed", function (e) {
        updateTracks(e);
      });
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
      if (replaceAll) {
        setTracks(historyTracks.slice(0, endIndex));
        setReplaceAll(false);
      } else setTracks((t) => [...t, ...newTracks]);
    }
    setLoading(false);
    // eslint-disable-next-line
  }, [offset, historyTracks]);

  return { histLoading, histHasMore, histTracks };
}
