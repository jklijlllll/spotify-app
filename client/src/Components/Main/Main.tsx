import { FunctionComponent, useState } from "react";
import Recommendation from "../Recommendation";
import SearchBar from "../SearchBar";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { CurrentComponent } from "../../Pages/Home/Home";

const Main: FunctionComponent<{
  token: string;
  is_active: any;
  deviceId: any;
  navCollapse: boolean;
  curComp: CurrentComponent;
}> = ({ token, is_active, deviceId, navCollapse, curComp }) => {
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
              <SearchBar
                token={token}
                is_active={is_active}
                deviceId={deviceId}
              />
            </div>

            <div className="recommendation_container">
              <Recommendation
                token={token}
                is_active={is_active}
                deviceId={deviceId}
              />
            </div>
          </>
        ) : (
          <></>
        )}
      </div>
    </>
  );
};

export default Main;
