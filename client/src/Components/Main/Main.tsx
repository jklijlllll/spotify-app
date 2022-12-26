import { FunctionComponent } from "react";
import Recommendation from "../Recommendation";
import { CurrentComponent } from "../../Pages/Home/Home";
import Playlist from "../Playlist";
import "./Main.css";

const Main: FunctionComponent<{
  navCollapse: boolean;
  curComp: CurrentComponent;
  update: number[];
}> = ({ navCollapse, curComp, update }) => {
  return (
    <>
      <div
        style={{
          left: navCollapse ? "65px" : "240px",
          width: navCollapse ? "calc(100% - 65px)" : "calc(100% - 230px)",
        }}
        className="main_container"
      >
        {curComp === CurrentComponent.Recommendations ? (
          <Recommendation update={update[CurrentComponent.Recommendations]} />
        ) : (
          <Playlist update={update[CurrentComponent.Playlists]} />
        )}
      </div>
    </>
  );
};

export default Main;
