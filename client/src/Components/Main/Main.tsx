import { FunctionComponent, useState } from "react";
import Recommendation from "../Recommendation";
import SearchBar from "../SearchBar";
import { CurrentComponent } from "../../Pages/Home/Home";
import Playlist from "../Playlist";

// TODO: overlay options
const Main: FunctionComponent<{
  navCollapse: boolean;
  curComp: CurrentComponent;
  update: number[];
}> = ({ navCollapse, curComp, update }) => {
  return (
    <>
      <div
        className="main_container"
        style={{
          width: navCollapse ? "calc(100% - 75px)" : "calc(100% - 250px)",
          left: navCollapse ? "75px" : "250px",
        }}
      >
        {curComp === CurrentComponent.Recommendations ? (
          <>
            <Recommendation update={update[CurrentComponent.Recommendations]} />
          </>
        ) : (
          <Playlist update={update[CurrentComponent.Playlists]} />
        )}
      </div>
    </>
  );
};

export default Main;
