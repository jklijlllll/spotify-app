import { FunctionComponent, useState } from "react";
import Recommendation from "../Recommendation";
import SearchBar from "../SearchBar";
import { CurrentComponent } from "../../Pages/Home/Home";
import Playlist from "../Playlist";

const Main: FunctionComponent<{
  navCollapse: boolean;
  curComp: CurrentComponent;
}> = ({ navCollapse, curComp }) => {
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
            <div className="search_container">
              <SearchBar />
            </div>

            <div className="recommendation_container">
              <Recommendation />
            </div>
          </>
        ) : (
          <Playlist />
        )}
      </div>
    </>
  );
};

export default Main;
