import { FunctionComponent, useState } from "react";
import SearchBar from "../SearchBar";

const Main: FunctionComponent<{
  token: string;
  setTrack: any;
  is_active: any;
  deviceId: any;
}> = ({ token, setTrack, is_active, deviceId }) => {
  return (
    <div className="main_container">
      <div className="search_container">
        <SearchBar
          token={token}
          setTrack={setTrack}
          is_active={is_active}
          deviceId={deviceId}
        />
      </div>
    </div>
  );
};

export default Main;
