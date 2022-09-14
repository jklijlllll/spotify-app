import { FunctionComponent, useEffect, useState } from "react";

const WebPlayback: FunctionComponent<{ token: String }> = ({ token }) => {
  const [player, setPlayer] = useState(undefined);
  const [is_paused, setPaused] = useState(false);
  const [is_active, setActive] = useState(false);

  const track = {
    name: "",
    album: {
      images: [{ url: "" }],
    },
    artists: [{ name: "" }],
  };
  const [current_track, setTrack] = useState(track);

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
        });

        player.addListener("not_ready", (device_id: any) => {
          console.log("Device ID has gone offline", device_id);
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

  if (is_active) {
    return (
      <>
        <div className="webplayback_container">
          <img
            src={current_track.album.images[1].url}
            className="now-playing__cover"
            alt=""
          />

          <div className="now_playing_info">
            <div className="now_playing_name">{current_track.name}</div>
            <div className="now_playing_artist">
              {current_track.artists[0].name}
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
