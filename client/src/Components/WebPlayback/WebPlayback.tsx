import { FunctionComponent, useEffect, useState } from "react";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import PauseIcon from "@mui/icons-material/Pause";
import axios from "axios";
import { IconButton } from "@mui/material";

// TODO: add volume control
// TODO: add device control
const WebPlayback: FunctionComponent<{
  token: string;
  current_track: any;
  setTrack: any;
  is_active: any;
  setActive: any;
  deviceId: any;
  setDeviceId: any;
}> = ({
  token,
  current_track,
  setTrack,
  is_active,
  setActive,
  deviceId,
  setDeviceId,
}) => {
  const [player, setPlayer] = useState<any>(undefined);
  const [is_paused, setPaused] = useState(false);

  useEffect(() => {
    if (token !== "") {
      const script = document.createElement("script");
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;

      document.body.appendChild(script);

      window.onSpotifyWebPlaybackSDKReady = () => {
        const player = new window.Spotify.Player({
          name: "Web Playback SDK",
          getOAuthToken: (cb: any) => {
            cb(token);
          },
          volume: 0.5,
        });

        setPlayer(player);

        player.addListener("ready", (device_id: any) => {
          console.log("Ready with Device ID", device_id);
          setDeviceId(device_id.device_id);
        });

        player.addListener("not_ready", (device_id: any) => {
          console.log("Device ID has gone offline", device_id);
          setDeviceId("");
        });

        player.addListener("player_state_changed", (state: any) => {
          if (!state) {
            return;
          }

          setTrack(state.track_window.current_track);
          setPaused(state.paused);

          player.getCurrentState().then((state: any) => {
            !state ? setActive(false) : setActive(true);
          });
        });
        player.connect();
      };
    }
  }, [token]);

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const body = { device_ids: [deviceId], play: true };
  useEffect(() => {
    if (deviceId === "") return;

    axios
      .put("https://api.spotify.com/v1/me/player", body, { headers })
      .then((response) => {})
      .catch((error) => {
        console.log(error);
      });
  }, [deviceId]);

  if (is_active) {
    return (
      <>
        <div className="webplayback_info">
          <img
            src={current_track.album.images[1].url}
            className="now_playing_cover"
            alt=""
          />

          <div className="now_playing_info">
            <div className="now_playing_name">{current_track.name}</div>
            <div className="now_playing_artist">
              {current_track.artists[0].name}
            </div>
          </div>
        </div>
        <div className="playback_controls">
          <IconButton onClick={() => player!.previousTrack()}>
            <SkipPreviousIcon fontSize="large" />
          </IconButton>
          <IconButton
            onClick={() => {
              player!.togglePlay();
            }}
          >
            {!is_paused ? (
              <PauseIcon fontSize="large" />
            ) : (
              <PlayArrowIcon fontSize="large" />
            )}
          </IconButton>
          <IconButton onClick={() => player!.nextTrack()}>
            <SkipNextIcon fontSize="large" />
          </IconButton>
        </div>
      </>
    );
  } else {
    return <></>;
  }
};

export default WebPlayback;
