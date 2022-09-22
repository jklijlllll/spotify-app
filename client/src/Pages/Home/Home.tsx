import axios from "axios";
import React, { useEffect } from "react";
import { FunctionComponent, useState } from "react";
import Main from "../../Components/Main";
import NavBar from "../../Components/NavBar";
import WebPlayback from "../../Components/WebPlayback";

interface UserContextInterface {
  token: string;
  headers: {
    Authorization: string;
  };
  is_active: boolean;
  deviceId: string;
  userProfile: any;
}

export const UserContext = React.createContext<UserContextInterface | null>(
  null
);

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
  const [is_active, setActive] = useState<boolean>(false);
  const [deviceId, setDeviceId] = useState<string>("");
  const [navCollapse, setNavCollapse] = useState<boolean>(false);
  const [curComp, setCurComp] = useState<CurrentComponent>(
    CurrentComponent.Recommendations
  );

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const userContext: UserContextInterface = {
    token: token,
    headers: headers,
    is_active: is_active,
    deviceId: deviceId,
    userProfile: null,
  };

  useEffect(() => {
    axios
      .get("https://api.spotify.com/v1/me", { headers: headers })
      .then((response) => {
        userContext.userProfile = response.data;
        console.log(response.data);
      })
      .catch((error) => console.log(error));
  }, [token]);

  // TODO: allow player to work on refresh, localstorage
  return (
    <UserContext.Provider value={userContext}>
      <div className="app_container">
        <Main navCollapse={navCollapse} curComp={curComp} />
      </div>

      <div
        className="playback_container"
        style={{
          width: navCollapse ? "calc(100% - 75px)" : "calc(100% - 250px)",
          left: navCollapse ? "75px" : "250px",
        }}
      >
        <WebPlayback
          current_track={current_track}
          setTrack={setTrack}
          setActive={setActive}
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
    </UserContext.Provider>
  );
};

export default Home;

export enum CurrentComponent {
  Recommendations,
  Playlists,
}
