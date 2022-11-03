import { useEffect, useCallback } from "react";
import { TrackInterface } from "../Types/SpotifyApi";

interface HistoryParameters {
  current_track?: TrackInterface | null;
  recommended_tracks?: TrackInterface[];
}

export default function useHistory({
  current_track,
  recommended_tracks,
}: HistoryParameters): void {
  const maxLength = 100;

  const addToHistory = useCallback((track: TrackInterface) => {
    const changedEvent = new CustomEvent("changed", {
      detail: { replaceAll: false },
    });
    let localHistory: TrackInterface[] = localStorage.getItem("history")
      ? JSON.parse(localStorage.getItem("history")!)
      : [];
    localHistory = localHistory.filter(
      (t: TrackInterface) => t.uri !== track.uri
    );
    if (localHistory.length + 1 > maxLength) localHistory.shift();

    localHistory.push(track);
    localStorage.setItem("history", JSON.stringify(localHistory));
    dispatchEvent(changedEvent);
  }, []);

  const addTracksToHistory = useCallback((tracks: TrackInterface[]) => {
    const changedEvent = new CustomEvent("changed", {
      detail: { replaceAll: true },
    });
    let localHistory: TrackInterface[] = localStorage.getItem("history")
      ? JSON.parse(localStorage.getItem("history")!)
      : [];

    for (const track of tracks) {
      if (!localHistory.find((t) => t.uri === track.uri)) {
        if (localHistory.length + 1 > maxLength) localHistory.shift();
        localHistory.push(track);
      }
    }
    localStorage.setItem("history", JSON.stringify(localHistory));
    dispatchEvent(changedEvent);
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("history"))
      localStorage.setItem("history", JSON.stringify([]));

    if (current_track && current_track !== null && current_track.name !== "") {
      addToHistory(current_track);
    }
  }, [current_track, addToHistory]);

  useEffect(() => {
    if (
      recommended_tracks &&
      typeof recommended_tracks !== "undefined" &&
      recommended_tracks.length > 0
    ) {
      addTracksToHistory(recommended_tracks);
    }
  }, [recommended_tracks, addTracksToHistory]);
}
