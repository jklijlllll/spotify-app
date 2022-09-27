import { FunctionComponent, useContext, useEffect, useState } from "react";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import PauseIcon from "@mui/icons-material/Pause";
import axios from "axios";
import { Fade, IconButton, Slider, Tooltip } from "@mui/material";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeDownIcon from "@mui/icons-material/VolumeDown";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import DevicesIcon from "@mui/icons-material/Devices";
import ComputerIcon from "@mui/icons-material/Computer";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import SpeakerIcon from "@mui/icons-material/Speaker";
import DevicesOtherIcon from "@mui/icons-material/DevicesOther";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { UserContext } from "../../Pages/Home/Home";

// TODO: add device control
// TODO: save player state and volume on reload
// TODO: retain volume on playback transfer
// TODO: fix player position when song is loading but not playing
// TODO: add loading indicator
const WebPlayback: FunctionComponent<{
  current_track: any;
  setTrack: any;

  setActive: any;

  setDeviceId: any;
}> = ({ current_track, setTrack, setActive, setDeviceId }) => {
  const [player, setPlayer] = useState<any>(undefined);
  const [is_paused, setPaused] = useState(true);
  const [volume, setVolume] = useState(50);
  const [position, setPosition] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [updateTime, setUpdateTime] = useState<number>(0);
  const [devicesOpen, setDevicesOpen] = useState<boolean>(false);
  const [devicesInfo, setDevicesInfo] = useState<any[]>([]);
  const [is_liked, setIsLiked] = useState<boolean>(false);

  const userContext = useContext(UserContext);

  const getPosition = () => {
    if (is_paused) {
      return position;
    }
    let cur_position = position + (performance.now() - updateTime);
    return cur_position > duration ? duration : cur_position;
  };

  useEffect(() => {
    if (userContext?.token !== "") {
      const script = document.createElement("script");
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;

      document.body.appendChild(script);

      window.onSpotifyWebPlaybackSDKReady = () => {
        const player = new window.Spotify.Player({
          name: "Web Playback SDK",
          getOAuthToken: (cb: any) => {
            cb(userContext?.token);
          },
          volume: 0.25,
        });

        setVolume(25);
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

          console.log(state);
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
  }, [userContext?.token]);

  const transferPlayback = (deviceId: string) => {
    axios
      .put(
        "https://api.spotify.com/v1/me/player",
        { device_ids: [deviceId], play: false },
        { headers: userContext?.headers }
      )
      .then((response) => {})
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    if (userContext?.deviceId === "") return;

    transferPlayback(userContext?.deviceId!);
  }, [userContext?.deviceId]);

  useEffect(() => {
    if (!userContext!.is_active) return;
    player.setVolume(volume / 100);
    const volumeInterval = setInterval(() => {
      player.getVolume().then((volume: any) => {
        setVolume(volume * 100);
      });
    }, 1000);
    return () => clearInterval(volumeInterval);
  }, [volume, userContext!.is_active]);

  useEffect(() => {
    const updateInterval = setInterval(() => {
      setPosition(getPosition());
      setUpdateTime(performance.now());
    }, 100);
    return () => clearInterval(updateInterval);
  }, [position, is_paused]);

  useEffect(() => {
    if (!userContext?.is_active) return;

    if (
      sessionStorage.getItem("current_track") === null ||
      JSON.parse(sessionStorage.getItem("current_track")!).uri !==
        current_track.uri
    ) {
      axios
        .get("https://api.spotify.com/v1/me/tracks/contains", {
          params: { ids: current_track.uri.replace("spotify:track:", "") },
          headers: userContext?.headers,
        })
        .then((response) => {
          sessionStorage.setItem(
            "current_track",
            JSON.stringify({
              uri: current_track.uri,
              isLiked: response.data[0],
            })
          );
          setIsLiked(response.data[0]);
        })
        .catch((error) => console.log(error));
    } else {
      setIsLiked(JSON.parse(sessionStorage.getItem("current_track")!).isLiked);
    }
  }, [userContext?.is_active, current_track]);

  const likeTrack = () => {
    axios
      .put(
        "https://api.spotify.com/v1/me/tracks",
        { ids: [current_track.uri.replace("spotify:track:", "")] },
        { headers: userContext?.headers }
      )
      .then((response) => setIsLiked(true))
      .catch((error) => console.log(error));
  };

  const unLikeTrack = () => {
    axios
      .delete("https://api.spotify.com/v1/me/tracks", {
        params: { ids: current_track.uri.replace("spotify:track:", "") },
        headers: userContext?.headers,
      })
      .then((response) => setIsLiked(false))
      .catch((error) => console.log(error));
  };

  // TODO: update device info on device change
  // TODO: fix transfer device issue
  const updateDeviceInfo = () => {
    axios
      .get("https://api.spotify.com/v1/me/player/devices", {
        headers: userContext?.headers,
      })
      .then((response) => {
        setDevicesInfo(response.data.devices);
      })
      .catch((error) => console.log(error));
  };
  useEffect(() => {
    if (!devicesOpen) return;
    updateDeviceInfo();
  }, [devicesOpen]);

  let artist_names = "";
  if (current_track.artists.length > 0) {
    artist_names = current_track.artists
      .map((artist: any) => artist.name)
      .join(", ");
  }

  if (userContext?.is_active) {
    return (
      <>
        <div className="position_container">
          <Slider
            sx={{
              width: "calc(100% - 20px)",
              "& .MuiSlider-rail": {
                width: "calc(100% + 20px)",
                left: "-10px",
                color: "gray",
              },
              "& .MuiSlider-track": {
                left: "-10px !important",
                color: "black",
              },
              "& .MuiSlider-thumb": {
                color: "black",
              },
            }}
            max={duration}
            value={position}
            onChange={(event: any, newValue: any) => {
              player.seek(newValue).then(() => {
                setPosition(newValue);
                setUpdateTime(performance.now());
              });
            }}
            valueLabelDisplay="auto"
            valueLabelFormat={(x) => {
              let minutes = Math.floor(x / 60000);
              let seconds = Math.floor((x - minutes * 60000) / 1000);

              let minString = minutes.toString();
              let secString = seconds.toString();

              if (seconds < 10) secString = "0" + secString;

              let timeStamp = minString + ":" + secString;

              return timeStamp;
            }}
          />
        </div>
        <div className="webplayback_info">
          <img
            src={current_track.album.images[1].url}
            className="now_playing_cover"
            alt=""
          />
          <div className="song_info">
            <div className="now_playing_info">
              <div className="now_playing_name">{current_track.name}</div>
              <div className="now_playing_artist">{artist_names}</div>
            </div>
            <div className="like_icon_container">
              {is_liked ? (
                <IconButton
                  onClick={() => {
                    unLikeTrack();
                  }}
                >
                  <FavoriteIcon fontSize="large" />
                </IconButton>
              ) : (
                <IconButton
                  onClick={() => {
                    likeTrack();
                  }}
                >
                  <FavoriteBorderIcon fontSize="large" />
                </IconButton>
              )}
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
                        height: "140px",
                      }}
                      orientation="vertical"
                      value={volume}
                      onChange={(event: any, newValue: any) => {
                        setVolume(newValue);
                      }}
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
              <Tooltip
                title={
                  <div className="devices_container">
                    <h1 className="devices_title">Devices</h1>
                    {devicesInfo.map((result, key) => (
                      <div
                        className="device"
                        key={key}
                        style={{ color: result.is_active ? "green" : "black" }}
                        onClick={() => {
                          setDevicesOpen(false);
                          transferPlayback(result.id);
                        }}
                      >
                        {result.type.toLowerCase() === "computer" ? (
                          <ComputerIcon />
                        ) : result.type.toLowerCase() === "smartphone" ? (
                          <SmartphoneIcon />
                        ) : result.type.toLowerCase() === "speaker" ? (
                          <SpeakerIcon />
                        ) : (
                          <DevicesOtherIcon />
                        )}
                        <h2>{result.name}</h2>
                      </div>
                    ))}
                  </div>
                }
                open={devicesOpen}
                onClick={() => {
                  setDevicesOpen((open) => !open);
                }}
                arrow
                placement="top-start"
              >
                <IconButton sx={{ marginRight: "20px" }}>
                  <DevicesIcon fontSize="large" />
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
