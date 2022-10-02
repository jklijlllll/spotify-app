import {
  FunctionComponent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import usePlaylistLoad from "../../Hooks/usePlaylistLoad";
import { UserContext } from "../../Pages/Home/Home";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import AddBoxIcon from "@mui/icons-material/AddBox";
import { Button } from "@mui/material";
import FilterBar from "../FilterBar";
import { milliToMinandSec } from "../../Functions/milliToMinAndSec";
import { startPlayback } from "../../Functions/startPlayback";

import PlaylistEdit from "../PlaylistEdit";

const Playlist: FunctionComponent<{ update: number }> = ({ update }) => {
  const userContext = useContext(UserContext);
  const [curPlaylist, setCurPlaylist] = useState<any>({
    name: "",
    id: "",
  });
  const [filterPlaylists, setFilterPlaylists] = useState<any[]>([]);
  const [offset, setOffset] = useState<number>(0);
  const limit = 20;

  const { loading, error, playlists, tracks, hasMore } = usePlaylistLoad(
    offset,
    limit,
    userContext?.headers,
    userContext?.userProfile.id,
    curPlaylist,
    update
  );

  useEffect(() => {
    setCurPlaylist({ name: "", id: "" });
    setFilterPlaylists([]);
    setOffset(0);
  }, [update]);

  const observer = useRef<any>();
  const lastPlaylistElementRef = useCallback(
    (node: any) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setOffset((prevOffset) => prevOffset + limit);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  // TODO: improve UI
  // TODO: add song preview on playlist hover/select/right click (context menu)
  // TODO: add individual management and creation/deletion

  let dateFormat: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  const [openEdit, setOpenEdit] = useState<boolean>(false);

  useEffect(() => {
    if (openEdit === true) return;
  }, [openEdit]);

  return (
    <div className="playlist_container">
      {curPlaylist.id === "" ? (
        <>
          {playlists.length !== 0 ? (
            <>
              <FilterBar
                playlists={playlists}
                setFilterPlaylists={setFilterPlaylists}
              />
              <div className="playlist_browse">
                {filterPlaylists.map((playlist, index) => {
                  if (filterPlaylists.length === index + 1) {
                    return (
                      <div
                        className="playlist_select"
                        ref={lastPlaylistElementRef}
                        key={index}
                        onClick={() => setCurPlaylist(playlist)}
                      >
                        {playlist.images[0] ? (
                          <img
                            className="playlist_image"
                            src={playlist.images[0].url}
                            alt="playlist image"
                          />
                        ) : (
                          <div className="playlist_empty_image">
                            <MusicNoteIcon
                              sx={{
                                color: "gray",
                                width: "42px",
                                height: "42px",
                              }}
                            />
                          </div>
                        )}

                        <h4 className="playlist_title">{playlist.name}</h4>
                        <h4 className="playlist_description">
                          {playlist.description !== ""
                            ? playlist.description
                            : "By " + playlist.owner.display_name}
                        </h4>
                      </div>
                    );
                  } else {
                    return (
                      <div
                        className="playlist_select"
                        key={index}
                        onClick={() => setCurPlaylist(playlist)}
                      >
                        {playlist.images[0] ? (
                          <img
                            className="playlist_image"
                            src={playlist.images[0].url}
                            alt="playlist image"
                          />
                        ) : (
                          <div className="playlist_empty_image">
                            <MusicNoteIcon
                              sx={{
                                color: "gray",
                                width: "42px",
                                height: "42px",
                              }}
                            />
                          </div>
                        )}
                        <h4 className="playlist_title">{playlist.name}</h4>
                        <h4 className="playlist_description">
                          {playlist.description !== ""
                            ? playlist.description
                            : "By " + playlist.owner.display_name}
                        </h4>
                      </div>
                    );
                  }
                })}
                <div className="playlist_select">
                  <AddBoxIcon
                    sx={{ height: "200px", width: "200px", color: "white" }}
                  />
                  <h4 className="playlist_create_text">Create Playlist</h4>
                </div>
              </div>
            </>
          ) : (
            <div>
              {!loading && (
                <Button variant="contained" startIcon={<AddBoxIcon />}>
                  Create Playlist
                </Button>
              )}
            </div>
          )}
          <div>{loading && "Loading..."}</div>
          <div>{error && "Error"}</div>
        </>
      ) : (
        <>
          <PlaylistEdit
            open={openEdit}
            setOpen={setOpenEdit}
            curPlaylist={curPlaylist}
            setCurPlaylist={setCurPlaylist}
            headers={userContext?.headers}
          />
          <div className="playlist_view_container">
            <div
              className="playlist_view_header"
              onClick={() => setOpenEdit(true)}
            >
              {curPlaylist.images[0] ? (
                <img
                  className="playlist_view_cover"
                  src={curPlaylist.images[0].url}
                  alt="playlist image"
                />
              ) : (
                <div className="playlist_empty_cover">
                  <MusicNoteIcon
                    sx={{
                      color: "gray",
                      width: "64px",
                      height: "64px",
                    }}
                  />
                </div>
              )}

              <div className="playlist_view_flex_container">
                <div className="playlist_view_edit_container">
                  <h1 className="playlist_view_title">{curPlaylist.name}</h1>
                  <h4 className="playlist_view_description">
                    {curPlaylist.description}
                  </h4>
                </div>

                <div className="playlist_view_info_container">
                  <h4 className="playlist_view_owner">
                    {curPlaylist.owner.display_name}
                  </h4>
                  <h4 className="playlist_view_count">
                    {curPlaylist.tracks.total + " songs"}
                  </h4>
                </div>
              </div>
            </div>
            {tracks.map((track, index) => {
              if (tracks.length === index + 1) {
                return (
                  <div
                    className="playlist_item_container"
                    ref={lastPlaylistElementRef}
                    key={index}
                    onClick={() => {
                      startPlayback({
                        device_id: userContext?.deviceId!,
                        position_ms: 0,
                        headers: userContext?.headers,
                        context_uri: curPlaylist.uri,
                        offset: {
                          uri: track.track.uri,
                        },
                      });
                    }}
                  >
                    <h1 className="playlist_item_number">{index + 1}</h1>
                    <img
                      className="playlist_item_image"
                      src={track.track.album.images[0].url}
                      alt="track_image"
                    />
                    <div className="playlist_item_info_container">
                      <h4 className="playlist_item_name">{track.track.name}</h4>
                      <h4 className="playlist_item_artists">
                        {track.track.artists
                          .map((artist: any) => artist.name)
                          .join(", ")}
                      </h4>
                    </div>
                    <div className="playlist_item_album">
                      {track.track.album.name}
                    </div>
                    <div className="playlist_item_added_at">
                      {new Date(track.added_at).toLocaleDateString(
                        "en-US",
                        dateFormat
                      )}
                    </div>
                    <div className="playlist_item_duration">
                      {milliToMinandSec(track.track.duration_ms)}
                    </div>
                  </div>
                );
              } else {
                return (
                  <div
                    className="playlist_item_container"
                    key={index}
                    onClick={() => {
                      startPlayback({
                        device_id: userContext?.deviceId!,
                        position_ms: 0,
                        headers: userContext?.headers,
                        context_uri: curPlaylist.uri,
                        offset: {
                          uri: track.track.uri,
                        },
                      });
                    }}
                  >
                    <h1 className="playlist_item_number">{index + 1}</h1>
                    <img
                      className="playlist_item_image"
                      src={track.track.album.images[0].url}
                      alt="track_image"
                    />
                    <div className="playlist_item_info_container">
                      <h4 className="playlist_item_name">{track.track.name}</h4>
                      <h4 className="playlist_item_artists">
                        {track.track.artists
                          .map((artist: any) => artist.name)
                          .join(", ")}
                      </h4>
                    </div>
                    <div className="playlist_item_album">
                      {track.track.album.name}
                    </div>
                    <div className="playlist_item_added_at">
                      {new Date(track.added_at).toLocaleDateString(
                        "en-US",
                        dateFormat
                      )}
                    </div>
                    <div className="playlist_item_duration">
                      {milliToMinandSec(track.track.duration_ms)}
                    </div>
                  </div>
                );
              }
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default Playlist;
