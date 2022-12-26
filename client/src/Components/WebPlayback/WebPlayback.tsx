import {
  FunctionComponent,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import PauseIcon from "@mui/icons-material/Pause";
import axios from "axios";
import {
  Fade,
  IconButton,
  Slider,
  Tooltip,
  CircularProgress,
} from "@mui/material";
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
import { milliToMinandSec } from "../../Functions/milliToMinAndSec";
import useHistory from "../../Hooks/useHistory";
import {
  ArtistInterface,
  DeviceInterface,
  TrackInterface,
  WebPlaybackState,
} from "../../Types/SpotifyApi";
import "./WebPlayback.css";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// TODO: add device control
// TODO: save player state and volume on reload
// TODO: retain volume on playback transfer

const theme = createTheme({
  components: {
    MuiIconButton: {
      styleOverrides: {
        root: {
          height: "64px",
          width: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
      },
    },
  },
});

const WebPlayback: FunctionComponent<{
  current_track: TrackInterface | null;
  setTrack: React.Dispatch<React.SetStateAction<TrackInterface | null>>;
  setActive: React.Dispatch<React.SetStateAction<boolean>>;
  setDeviceId: React.Dispatch<React.SetStateAction<string>>;
}> = ({ current_track, setTrack, setActive, setDeviceId }) => {
  const [player, setPlayer] = useState<any>(undefined);
  const [is_paused, setPaused] = useState<boolean>(true);
  const [volume, setVolume] = useState<number>(25);
  const [position, setPosition] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [updateTime, setUpdateTime] = useState<number>(0);
  const [devicesOpen, setDevicesOpen] = useState<boolean>(false);
  const [devicesInfo, setDevicesInfo] = useState<DeviceInterface[]>([]);
  const [is_liked, setIsLiked] = useState<boolean>(false);

  const userContext = useContext(UserContext);

  const iconColor = "white";
  const iconHoverColor = "#1d1d1d";

  useHistory({ current_track: current_track, headers: userContext?.headers });

  const getPosition = useCallback(
    (
      is_paused: boolean,
      position: number,
      updateTime: number,
      duration: number
    ) => {
      if (is_paused) {
        return position;
      }
      let cur_position = position + (performance.now() - updateTime);
      return cur_position > duration ? duration : cur_position;
    },
    []
  );

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

        player.addListener(
          "player_state_changed",
          (state: WebPlaybackState) => {
            if (!state) {
              return;
            }

            axios
              .get(
                `https://api.spotify.com/v1/tracks/${state.track_window.current_track.id}`,
                { headers: userContext?.headers }
              )
              .then((response) => {
                console.log(response.data);
                setTrack(response.data);
                setPaused(state.paused);
                setPosition(state.position);
                setDuration(state.duration);
                setUpdateTime(performance.now());
                player.getCurrentState().then((state: WebPlaybackState) => {
                  !state ? setActive(false) : setActive(true);
                });
              })
              .catch((error) => console.log(error));
          }
        );
        player.connect();
      };
    }
  }, [
    userContext?.token,
    userContext?.headers,
    setActive,
    setDeviceId,
    setTrack,
  ]);

  const transferPlayback = useCallback(
    (deviceId: string) => {
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
    },
    [userContext?.headers]
  );

  useEffect(() => {
    if (userContext?.deviceId === "") return;

    transferPlayback(userContext?.deviceId!);
  }, [userContext?.deviceId, transferPlayback]);

  useEffect(() => {
    if (userContext === null || !userContext.is_active || player === undefined)
      return;

    player.setVolume(volume / 100);
    const volumeInterval = setInterval(() => {
      player.getVolume().then((volume: any) => {
        setVolume(volume * 100);
      });
    }, 1000);
    return () => clearInterval(volumeInterval);
  }, [volume, player, userContext]);

  useEffect(() => {
    const updateInterval = setInterval(() => {
      setPosition(getPosition(is_paused, position, updateTime, duration));
      setUpdateTime(performance.now());
    }, 100);
    return () => clearInterval(updateInterval);
  }, [position, is_paused, getPosition, duration, updateTime]);

  useEffect(() => {
    if (!userContext?.is_active || current_track === null) return;

    if (
      sessionStorage.getItem("current_track") === null ||
      JSON.parse(sessionStorage.getItem("current_track")!).uri !==
        current_track.uri
    ) {
      axios
        .get("https://api.spotify.com/v1/me/tracks/contains", {
          params: { ids: current_track.id },
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
  }, [userContext, current_track]);

  const likeTrack = () => {
    axios
      .put(
        "https://api.spotify.com/v1/me/tracks",
        { ids: [current_track!.id] },
        { headers: userContext?.headers }
      )
      .then((response) => setIsLiked(true))
      .catch((error) => console.log(error));
  };

  const unLikeTrack = () => {
    axios
      .delete("https://api.spotify.com/v1/me/tracks", {
        params: { ids: current_track!.id },
        headers: userContext?.headers,
      })
      .then((response) => setIsLiked(false))
      .catch((error) => console.log(error));
  };

  // TODO: update device info on device change
  // TODO: fix transfer device issue
  const updateDeviceInfo = useCallback(() => {
    axios
      .get("https://api.spotify.com/v1/me/player/devices", {
        headers: userContext?.headers,
      })
      .then((response) => {
        setDevicesInfo(response.data.devices);
      })
      .catch((error) => console.log(error));
  }, [userContext?.headers]);

  useEffect(() => {
    if (!devicesOpen) return;
    updateDeviceInfo();
  }, [devicesOpen, updateDeviceInfo]);

  if (userContext?.is_active && current_track !== null) {
    return (
      <ThemeProvider theme={theme}>
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
                color: "white",
              },
              "& .MuiSlider-thumb": {
                color: "white",
              },
            }}
            max={duration}
            value={position}
            onChange={(event: any) => {
              player.seek(event.target.value).then(() => {
                setPosition(event.target.value);
                setUpdateTime(performance.now());
              });
            }}
            valueLabelDisplay="auto"
            valueLabelFormat={(x) => milliToMinandSec(x)}
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
              <div className="now_playing_artist">
                {current_track.artists
                  .map((artist: ArtistInterface) => artist.name)
                  .join(", ")}
              </div>
            </div>

            {is_liked ? (
              <IconButton
                onClick={() => {
                  unLikeTrack();
                }}
                sx={{ "&:hover": { backgroundColor: iconHoverColor } }}
              >
                <FavoriteIcon fontSize="large" sx={{ color: iconColor }} />
              </IconButton>
            ) : (
              <IconButton
                onClick={() => {
                  likeTrack();
                }}
                sx={{ "&:hover": { backgroundColor: iconHoverColor } }}
              >
                <FavoriteBorderIcon
                  fontSize="large"
                  sx={{ color: iconColor }}
                />
              </IconButton>
            )}
          </div>

          <div className="playback_controls">
            <IconButton
              onClick={() => player!.previousTrack()}
              sx={{ "&:hover": { backgroundColor: iconHoverColor } }}
            >
              <SkipPreviousIcon fontSize="large" sx={{ color: iconColor }} />
            </IconButton>
            <IconButton
              onClick={() => {
                player!.togglePlay();
              }}
              sx={{ "&:hover": { backgroundColor: iconHoverColor } }}
            >
              {!is_paused ? (
                <PauseIcon fontSize="large" sx={{ color: iconColor }} />
              ) : (
                <PlayArrowIcon fontSize="large" sx={{ color: iconColor }} />
              )}
            </IconButton>
            <IconButton
              onClick={() => player!.nextTrack()}
              sx={{ "&:hover": { backgroundColor: iconHoverColor } }}
            >
              <SkipNextIcon fontSize="large" sx={{ color: iconColor }} />
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
                        color: "white",
                        backgroundColor: "transparent",
                        height: "140px",
                      }}
                      orientation="vertical"
                      value={volume}
                      onChange={(event: any) => {
                        setVolume(event.target.value);
                      }}
                      valueLabelDisplay="auto"
                    />
                  </div>
                }
                componentsProps={{
                  tooltip: { sx: { backgroundColor: "#212121" } },
                  arrow: { sx: { color: "#212121" } },
                }}
                arrow
                TransitionComponent={Fade}
                TransitionProps={{ timeout: 600 }}
              >
                <IconButton
                  sx={{
                    marginRight: "20px",
                    "&:hover": { backgroundColor: iconHoverColor },
                  }}
                >
                  {volume === 0 ? (
                    <VolumeOffIcon fontSize="large" sx={{ color: iconColor }} />
                  ) : volume < 50 ? (
                    <VolumeDownIcon
                      fontSize="large"
                      sx={{ color: iconColor }}
                    />
                  ) : (
                    <VolumeUpIcon fontSize="large" sx={{ color: iconColor }} />
                  )}
                </IconButton>
              </Tooltip>
              <Tooltip
                componentsProps={{
                  tooltip: { sx: { backgroundColor: "#212121" } },
                  arrow: { sx: { color: "#212121" } },
                }}
                title={
                  <div className="devices_container">
                    <h1 className="devices_title">Devices</h1>
                    {devicesInfo.map((result, key) => (
                      <div
                        className="device"
                        key={key}
                        style={{ color: result.is_active ? "green" : "white" }}
                        onClick={() => {
                          setDevicesOpen(false);
                          transferPlayback(result.id);
                        }}
                      >
                        {result.type.toLowerCase() === "computer" ? (
                          <ComputerIcon
                            sx={{
                              color: result.is_active ? "green" : iconColor,
                            }}
                          />
                        ) : result.type.toLowerCase() === "smartphone" ? (
                          <SmartphoneIcon
                            sx={{
                              color: result.is_active ? "green" : iconColor,
                            }}
                          />
                        ) : result.type.toLowerCase() === "speaker" ? (
                          <SpeakerIcon
                            sx={{
                              color: result.is_active ? "green" : iconColor,
                            }}
                          />
                        ) : (
                          <DevicesOtherIcon
                            sx={{
                              color: result.is_active ? "green" : iconColor,
                            }}
                          />
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
                <IconButton
                  sx={{
                    marginRight: "20px",
                    "&:hover": { backgroundColor: iconHoverColor },
                  }}
                >
                  <DevicesIcon fontSize="large" sx={{ color: iconColor }} />
                </IconButton>
              </Tooltip>
            </div>
          </div>
        </div>
      </ThemeProvider>
    );
  } else {
    return (
      <div className="webplayback_info" style={{ justifyContent: "center" }}>
        <CircularProgress
          style={{
            height: "54px",
            width: "54px",
            paddingTop: "5px",
            paddingBottom: "5px",
          }}
        />
      </div>
    );
  }
};

export default WebPlayback;
