import { FunctionComponent, useState, useRef, useCallback } from "react";
import KeyboardTabIcon from "@mui/icons-material/KeyboardTab";
import { IconButton, Popover } from "@mui/material";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import QueueMusicIcon from "@mui/icons-material/QueueMusic";
import LogoutIcon from "@mui/icons-material/Logout";
import { CurrentComponent } from "../../Pages/Home/Home";
import HistoryIcon from "@mui/icons-material/History";
import "./NavBar.css";
import { ArtistInterface, TrackInterface } from "../../Types/SpotifyApi";
import useHistoryLoad from "../../Hooks/useHistoryLoad";

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

  const [historyAnchor, setHistoryAnchor] = useState<HTMLDivElement | null>(
    null
  );

  const historyOpen = Boolean(historyAnchor);
  const historyId = historyOpen ? "simple-popover" : undefined;

  const handleHistoryClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setHistoryAnchor(event.currentTarget);
  };

  const handleHistoryClose = () => {
    setHistoryAnchor(null);
  };

  const [offset, setOffset] = useState<number>(0);
  const limit = 5;

  const { histLoading, histHasMore, histTracks } = useHistoryLoad(
    offset,
    limit,
    false
  );

  const observer = useRef<IntersectionObserver>();
  const lastTrackElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (histLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && histHasMore) {
          setOffset((prevOffset) => prevOffset + limit);
        }
      });
      if (node) observer.current.observe(node);
    },
    [histLoading, histHasMore]
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
          className="sidebar_item"
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

        <div
          className="sidebar_item_last"
          aria-describedby={historyId}
          onClick={handleHistoryClick}
        >
          {historyIcon}
          {navCollapse ? <></> : <h4 className="sidebar_item_text">History</h4>}
        </div>

        <Popover
          id={historyId}
          open={historyOpen}
          anchorEl={historyAnchor}
          onClose={handleHistoryClose}
          anchorOrigin={{
            vertical: "center",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "center",
            horizontal: "left",
          }}
        >
          <div className="sidebar_history_container">
            {histTracks.map((track: TrackInterface, key: number) => {
              if (histTracks.length === key + 1) {
                return (
                  <div
                    className="sidebar_history_track"
                    ref={lastTrackElementRef}
                    key={key}
                  >
                    <h4 className="sidebar_history_number">{key + 1}</h4>

                    <img
                      className="sidebar_history_image"
                      src={track.album.images[2].url}
                      alt="album cover"
                    />
                    <div className="sidebar_history_info">
                      <h4 className="sidebar_history_title">{track.name}</h4>
                      <h4 className="sidebar_history_artists">
                        {track.artists
                          .map((artist: ArtistInterface) => artist.name)
                          .join(", ")}
                      </h4>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div className="sidebar_history_track" key={key}>
                    <h4 className="sidebar_history_number">{key + 1}</h4>
                    <img
                      className="sidebar_history_image"
                      src={track.album.images[2].url}
                      alt="album cover"
                    />
                    <div className="sidebar_history_info">
                      <h4 className="sidebar_history_title">{track.name}</h4>
                      <h4 className="sidebar_history_artists">
                        {track.artists
                          .map((artist: ArtistInterface) => artist.name)
                          .join(", ")}
                      </h4>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        </Popover>

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
