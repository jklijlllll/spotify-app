import { FunctionComponent } from "react";
import KeyboardTabIcon from "@mui/icons-material/KeyboardTab";
import { IconButton } from "@mui/material";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import QueueMusicIcon from "@mui/icons-material/QueueMusic";
import LogoutIcon from "@mui/icons-material/Logout";
import { CurrentComponent } from "../../Pages/Home/Home";

// TODO: add logout functionality
const NavBar: FunctionComponent<{
  navCollapse: boolean;
  setNavCollapse: any;
  setCurComp: any;
}> = ({ navCollapse, setNavCollapse, setCurComp }) => {
  return (
    <>
      {navCollapse ? (
        <>
          <div className="sidebar_content">
            <div className="sidebar_header">
              <img
                className="sidebar_icon"
                src={require("../../Media/Spotify_Icon_RGB_White.png")}
                alt="spotify icon"
              />
            </div>

            <div
              className="sidebar_item"
              onClick={() => {
                setCurComp(CurrentComponent.Recommendations);
              }}
            >
              <LibraryMusicIcon
                fontSize="large"
                sx={{
                  paddingTop: "10px",
                  paddingBottom: "10px",
                  paddingLeft: "20px",
                  color: "white",
                }}
              />
            </div>
            <div
              className="sidebar_item_last"
              onClick={() => {
                setCurComp(CurrentComponent.Playlists);
              }}
            >
              <QueueMusicIcon
                fontSize="large"
                sx={{
                  paddingTop: "10px",
                  paddingBottom: "10px",
                  paddingLeft: "20px",
                  color: "white",
                }}
              />
            </div>
            <div className="sidebar_item_last">
              <LogoutIcon
                fontSize="large"
                sx={{
                  paddingTop: "10px",
                  paddingBottom: "10px",
                  paddingLeft: "20px",
                  color: "white",
                }}
              />
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
                }}
              />
            </IconButton>
          </div>
        </>
      ) : (
        <>
          <div className="sidebar_content">
            <div className="sidebar_header">
              <h1 className="sidebar_title">Spotify App</h1>
            </div>

            <div className="sidebar_group_title_container">
              <h4 className="sidebar_group_title">Features</h4>
            </div>

            <div
              className="sidebar_item"
              onClick={() => {
                setCurComp(CurrentComponent.Recommendations);
              }}
            >
              <LibraryMusicIcon
                fontSize="large"
                sx={{
                  paddingTop: "10px",
                  paddingBottom: "10px",
                  paddingLeft: "20px",
                  color: "white",
                }}
              />

              <h4 className="sidebar_item_text">Recommendations</h4>
            </div>
            <div
              className="sidebar_item_last"
              onClick={() => {
                setCurComp(CurrentComponent.Playlists);
              }}
            >
              <QueueMusicIcon
                fontSize="large"
                sx={{
                  paddingTop: "10px",
                  paddingBottom: "10px",
                  paddingLeft: "20px",
                  color: "white",
                }}
              />

              <h4 className="sidebar_item_text">Playlists</h4>
            </div>

            <div className="sidebar_group_title_container">
              <h4 className="sidebar_group_title">Authorization</h4>
            </div>
            <div className="sidebar_item_last">
              <LogoutIcon
                fontSize="large"
                sx={{
                  paddingTop: "10px",
                  paddingBottom: "10px",
                  paddingLeft: "20px",
                  color: "white",
                }}
              />

              <h4 className="sidebar_item_text">Logout</h4>
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
                  transform: "rotate(180deg)",
                }}
              />
            </IconButton>
          </div>
        </>
      )}
    </>
  );
};

export default NavBar;
