import { FunctionComponent } from "react";
import KeyboardTabIcon from "@mui/icons-material/KeyboardTab";
import { IconButton } from "@mui/material";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import QueueMusicIcon from "@mui/icons-material/QueueMusic";
import LogoutIcon from "@mui/icons-material/Logout";
import { CurrentComponent } from "../../Pages/Home/Home";
import HistoryIcon from "@mui/icons-material/History";
import "./NavBar.css";

const NavBar: FunctionComponent<{
  navCollapse: boolean;
  setNavCollapse: React.Dispatch<React.SetStateAction<boolean>>;
  setCurComp: React.Dispatch<React.SetStateAction<CurrentComponent>>;
  update: React.Dispatch<React.SetStateAction<number>>[];
}> = ({ navCollapse, setNavCollapse, setCurComp, update }) => {
  const recommendationIcon = (
    <LibraryMusicIcon
      fontSize="large"
      sx={{
        paddingTop: "10px",
        paddingBottom: "10px",
        paddingLeft: "20px",
        color: "white",
      }}
    />
  );

  const playlistIcon = (
    <QueueMusicIcon
      fontSize="large"
      sx={{
        paddingTop: "10px",
        paddingBottom: "10px",
        paddingLeft: "20px",
        color: "white",
      }}
    />
  );

  const historyIcon = (
    <HistoryIcon
      fontSize="large"
      sx={{
        paddingTop: "10px",
        paddingBottom: "10px",
        paddingLeft: "20px",
        color: "white",
      }}
    />
  );

  const logoutIcon = (
    <LogoutIcon
      fontSize="large"
      sx={{
        paddingTop: "10px",
        paddingBottom: "10px",
        paddingLeft: "20px",
        color: "white",
      }}
    />
  );
  return (
    <>
      <div className="sidebar_content">
        <div className="sidebar_header">
          {navCollapse ? (
            <img
              className="sidebar_icon"
              src={require("../../Media/Spotify_Icon_RGB_White.png")}
              alt="spotify icon"
            />
          ) : (
            <h1 className="sidebar_title">Spotify App</h1>
          )}
        </div>

        {navCollapse ? (
          <></>
        ) : (
          <div className="sidebar_group_title_container">
            <h4 className="sidebar_group_title">Features</h4>
          </div>
        )}

        <div
          className="sidebar_item"
          onClick={() => {
            setCurComp(CurrentComponent.Recommendations);
            update[CurrentComponent.Recommendations](
              (value: number) => value + 1
            );
          }}
        >
          {recommendationIcon}
          {navCollapse ? (
            <></>
          ) : (
            <h4 className="sidebar_item_text">Recommendations</h4>
          )}
        </div>

        <div
          className="sidebar_item_last"
          onClick={() => {
            setCurComp(CurrentComponent.Playlists);
            update[CurrentComponent.Playlists]((value: number) => value + 1);
          }}
        >
          {playlistIcon}
          {navCollapse ? (
            <></>
          ) : (
            <h4 className="sidebar_item_text">Playlists</h4>
          )}
        </div>

        <div className="sidebar_item_last">
          {historyIcon}
          {navCollapse ? <></> : <h4 className="sidebar_item_text">History</h4>}
        </div>

        {navCollapse ? (
          <></>
        ) : (
          <div className="sidebar_group_title_container">
            <h4 className="sidebar_group_title">Authorization</h4>
          </div>
        )}
        <div
          className="sidebar_item_last"
          onClick={() => {
            dispatchEvent(new Event("logout"));
          }}
        >
          {logoutIcon}
          {navCollapse ? <></> : <h4 className="sidebar_item_text">Logout</h4>}
        </div>
      </div>
      <div className="sidebar_collapser">
        <IconButton
          onClick={() => {
            setNavCollapse((b: boolean) => !b);
          }}
        >
          <KeyboardTabIcon
            fontSize="large"
            sx={{
              color: "white",
              transform: navCollapse ? "" : "rotate(180deg)",
            }}
          />
        </IconButton>
      </div>
    </>
  );
};

export default NavBar;
