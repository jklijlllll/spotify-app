import { FunctionComponent, useState } from "react";
import Main from "../../Components/Main";
import NavBar from "../../Components/NavBar";
import WebPlayback from "../../Components/WebPlayback";

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
  const [navCollapse, setNavCollapse] = useState(false);
  const [curComp, setCurComp] = useState<CurrentComponent>(
    CurrentComponent.Recommendations
  );

  // TODO: allow player to work on refresh, localstorage
  return (
    <>
      <div className="app_container">
        <Main
          token={token}
          is_active={is_active}
          deviceId={deviceId}
          navCollapse={navCollapse}
          curComp={curComp}
        />
      </div>

      <div
        className="playback_container"
        style={{
          width: navCollapse ? "calc(100% - 75px)" : "calc(100% - 250px)",
          left: navCollapse ? "75px" : "250px",
        }}
      >
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

      <div
        className="sidebar_container"
        style={{ width: navCollapse ? "75px" : "250px" }}
      >
        <NavBar
          navCollapse={navCollapse}
          setNavCollapse={setNavCollapse}
          setCurComp={setCurComp}
        />
      </div>
    </>
  );
};

export default Home;

export enum CurrentComponent {
  Recommendations,
  Playlists,
}
