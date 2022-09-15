import { FunctionComponent, useEffect, useState } from "react";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import PauseIcon from "@mui/icons-material/Pause";
import axios from "axios";
import { Fade, IconButton, Slider, Tooltip } from "@mui/material";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeDownIcon from "@mui/icons-material/VolumeDown";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";

// TODO: add device control
// TODO: save player state on reload
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
  const [volume, setVolume] = useState(50);
  const [position, setPosition] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [updateTime, setUpdateTime] = useState<number>(0);

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

        setVolume(50);
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
          setPosition(state.position);
          setDuration(state.duration);
          setUpdateTime(performance.now());

          player.getCurrentState().then((state: any) => {
            !state ? setActive(false) : setActive(true);
          });
        });
        player.connect();
      };
    }
  }, [token]);

  const getPosition = () => {
    if (is_paused) {
      return position;
    }
    let cur_position = position + (performance.now() - updateTime) / 1000;
    return cur_position > duration ? duration : cur_position;
  };

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

  useEffect(() => {
    if (!is_active) return;

    player.setVolume(volume / 100);
  }, [volume]);

  if (is_active) {
    return (
      <>
        <div className="position_container">
          <Slider
            sx={{
              width: "calc(100% - 20px)",
              "& .MuiSlider-rail": {
                width: "calc(100% + 20px)",
                left: "-10px",
              },
            }}
          />
        </div>
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
          <div className="device_controls">
            <div className="device_controls_container">
              <Tooltip
                title={
                  <div className="volume_control">
                    <Slider
                      sx={{
                        '& input[type="range"]': {
                          WebkitAppearance: "slider-vertical",
                        },
                        color: "black",
                        backgroundColor: "transparent",
                        height: "280px",
                      }}
                      orientation="vertical"
                      value={volume}
                      onChange={(event: any, newValue: any) => {
                        setVolume(newValue);
                      }}
                      aria-label="Temperature"
                      valueLabelDisplay="auto"
                    />
                  </div>
                }
                arrow
                TransitionComponent={Fade}
                TransitionProps={{ timeout: 600 }}
              >
                <IconButton>
                  {volume === 0 ? (
                    <VolumeOffIcon fontSize="large" />
                  ) : volume < 50 ? (
                    <VolumeDownIcon fontSize="large" />
                  ) : (
                    <VolumeUpIcon fontSize="large" />
                  )}
                </IconButton>
              </Tooltip>
            </div>
          </div>
        </div>
      </>
    );
  } else {
    return <></>;
  }
};

export default WebPlayback;
