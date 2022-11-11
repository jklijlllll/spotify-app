import axios from "axios";
import { useEffect, useCallback } from "react";
import { TrackInterface } from "../Types/SpotifyApi";

interface HistoryParameters {
  current_track?: TrackInterface | null;
  recommended_tracks?: TrackInterface[];
  headers: any;
}

export default function useHistory({
  current_track,
  recommended_tracks,
  headers,
}: HistoryParameters): void {
  const maxLength = 100;

  const pushToHistory = (
    localHistory: TrackInterface[],
    replaceAll: boolean
  ) => {
    localStorage.setItem("history", JSON.stringify(localHistory));
    const changedEvent = new CustomEvent("changed", {
      detail: { replaceAll: replaceAll },
    });
    dispatchEvent(changedEvent);
  };

  const addToHistory = useCallback(
    (track: TrackInterface) => {
      let replaceAll = false;
      let localHistory: TrackInterface[] = localStorage.getItem("history")
        ? JSON.parse(localStorage.getItem("history")!)
        : [];
      let newTrack = localHistory.find((t) => t.uri === track.uri);

      if (!newTrack) {
        if (localHistory.length + 1 > maxLength) {
          replaceAll = true;
          localHistory.shift();
        }

        newTrack = track;

        axios
          .get("https://api.spotify.com/v1/audio-features", {
            headers: headers,
            params: { ids: track.id },
          })
          .then((response) => {
            newTrack!.audio_features = response.data.audio_features[0];
            localHistory.push(track);

            pushToHistory(localHistory, replaceAll);
          })
          .catch((error) => console.log(error));
      } else {
        replaceAll = true;

        if (newTrack.audio_features) {
          localHistory.splice(
            localHistory.findIndex((t) => t.uri === track.uri),
            1
          );
          localHistory.push(newTrack);
          pushToHistory(localHistory, replaceAll);
        } else {
          axios
            .get("https://api.spotify.com/v1/audio-features", {
              headers: headers,
              params: { ids: track.id },
            })
            .then((response) => {
              newTrack!.audio_features = response.data.audio_features[0];
              localHistory.splice(
                localHistory.findIndex((t) => t.uri === track.uri),
                1
              );

              localHistory.push(newTrack!);
              pushToHistory(localHistory, replaceAll);
            })
            .catch((error) => console.log(error));
        }
      }
    },
    [headers]
  );

  const addTracksToHistory = useCallback(
    (tracks: TrackInterface[]) => {
      let replaceAll = false;

      let localHistory: TrackInterface[] = localStorage.getItem("history")
        ? JSON.parse(localStorage.getItem("history")!)
        : [];

      let newTracks = [];

      for (const track of tracks) {
        if (!localHistory.find((t) => t.uri === track.uri)) {
          if (localHistory.length + 1 > maxLength) {
            replaceAll = true;
            localHistory.shift();
          }
          newTracks.push(track.id);
          localHistory.push(track);
        } else {
          replaceAll = true;
          localHistory.splice(
            localHistory.findIndex((t) => t.uri === track.uri),
            1
          );
          localHistory.push(track);
        }
      }

      if (newTracks.length === 0) pushToHistory(localHistory, replaceAll);
      else {
        axios
          .get("https://api.spotify.com/v1/audio-features", {
            headers: headers,
            params: { ids: newTracks.join(",") },
          })
          .then((response) => {
            for (const af of response.data.audio_features) {
              const index = localHistory.findIndex((t) => t.id === af.id);
              let newTrack = localHistory[index];
              newTrack.audio_features = af;
              localHistory[index] = newTrack;
            }
            pushToHistory(localHistory, replaceAll);
          })
          .catch((error) => console.log(error));
      }
    },
    [headers]
  );

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
