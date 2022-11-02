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
    const changedEvent = new Event("changed");
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

  useEffect(() => {
    if (!localStorage.getItem("history"))
      localStorage.setItem("history", JSON.stringify([]));

    if (current_track && current_track !== null && current_track.name !== "") {
      addToHistory(current_track);
    }
  }, [current_track, addToHistory]);

  useEffect(() => {
    if (!localStorage.getItem("history"))
      localStorage.setItem("history", JSON.stringify([]));

    let localHistory = localStorage.getItem("history")
      ? JSON.parse(localStorage.getItem("history")!)
      : [];

    if (
      recommended_tracks &&
      typeof recommended_tracks !== "undefined" &&
      recommended_tracks.length > 0
    ) {
      let newTracks = localHistory;

      for (let i = 0; i < recommended_tracks.length; i++) {
        newTracks = newTracks.filter(
          (track: TrackInterface) => track.uri !== recommended_tracks[i].uri
        );
        newTracks.push(recommended_tracks[i]);
      }

      addToHistory(newTracks);
    }
  }, [recommended_tracks, addToHistory]);
}
