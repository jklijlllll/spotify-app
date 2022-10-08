import axios from "axios";
import React, { useEffect } from "react";
import { FunctionComponent, useState, useMemo } from "react";
import Main from "../../Components/Main";
import NavBar from "../../Components/NavBar";
import WebPlayback from "../../Components/WebPlayback";
import { TrackInterface, UserInterface } from "../../Types/SpotifyApi";

interface UserContextInterface {
  token: string;
  headers: {
    Authorization: string;
  };
  is_active: boolean;
  deviceId: string;
  userProfile: UserInterface | null;
}

export const UserContext = React.createContext<UserContextInterface | null>(
  null
);

export enum CurrentComponent {
  Recommendations,
  Playlists,
}

const Home: FunctionComponent<{ token: string }> = ({ token }) => {
  const [current_track, setTrack] = useState<TrackInterface | null>(null);
  const [is_active, setActive] = useState<boolean>(false);
  const [deviceId, setDeviceId] = useState<string>("");
  const [navCollapse, setNavCollapse] = useState<boolean>(false);
  const [curComp, setCurComp] = useState<CurrentComponent>(
    CurrentComponent.Recommendations
  );
  const [updateRec, setUpdateRec] = useState<number>(0);
  const [updatePlay, setUpdatePlay] = useState<number>(0);

  let updateArray = [updateRec, updatePlay];
  let setUpdateArray = [setUpdateRec, setUpdatePlay];

  const [userProfile, setUserProfile] = useState<UserInterface | null>(null);

  const headers = useMemo(() => {
    return { Authorization: `Bearer ${token}` };
  }, [token]);

  const userContext: UserContextInterface = {
    token: token,
    headers: headers,
    is_active: is_active,
    deviceId: deviceId,
    userProfile: userProfile,
  };

  useEffect(() => {
    if (localStorage.getItem("user_profile") === null) {
      axios
        .get("https://api.spotify.com/v1/me", { headers: headers })
        .then((response) => {
          setUserProfile(response.data);
          localStorage.setItem("user_profile", JSON.stringify(response.data));
          console.log(response);
        })
        .catch((error) => console.log(error));
    } else {
      setUserProfile(JSON.parse(localStorage.getItem("user_profile")!));
    }
  }, [token, headers]);

  // TODO: allow player to work on refresh, localstorage (playlist track options updates current_track like status)
  // TODO: only provide context where necessary
  // TODO: refractor common api calls into global functions
  // TODO: store past recommended/played songs (used for finding adding new songs to playlist)
  return (
    <UserContext.Provider value={userContext}>
      <div className="app_container">
        <Main
          navCollapse={navCollapse}
          curComp={curComp}
          update={updateArray}
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
          update={setUpdateArray}
        />
      </div>
    </UserContext.Provider>
  );
};

export default Home;
