import { FunctionComponent, useEffect, useState } from "react";
import Login from "../../Components/Login";
import Main from "../../Components/Main";
import WebPlayback from "../../Components/WebPlayback";
import useAuth from "../../useAuth";

const Home: FunctionComponent<{ token: string }> = ({ token }) => {
  const track = {
    name: "",
    album: {
      images: [{ url: "" }],
    },
    artists: [{ name: "" }],
    uri: "",
  };
  const [current_track, setTrack] = useState(track);
  const [is_active, setActive] = useState(false);
  const [deviceId, setDeviceId] = useState("");

  // TODO: allow player to work on refresh, localstorage
  return (
    <>
      <div className="app_container">
        <Main
          token={token}
          setTrack={setTrack}
          is_active={is_active}
          deviceId={deviceId}
        />
      </div>

      <div className="playback_container">
        <WebPlayback
          token={token}
          current_track={current_track}
          setTrack={setTrack}
          is_active={is_active}
          setActive={setActive}
          deviceId={deviceId}
          setDeviceId={setDeviceId}
        />
      </div>
    </>
  );
};

export default Home;
