import {
  FunctionComponent,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import usePlaylistLoad from "../../Hooks/usePlaylistLoad";
import { UserContext } from "../../Pages/Home/Home";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import AddBoxIcon from "@mui/icons-material/AddBox";
import { Button } from "@mui/material";
import FilterBar from "../FilterBar";

const Playlist: FunctionComponent<{}> = () => {
  const userContext = useContext(UserContext);
  const [curPlaylist, setCurPlaylist] = useState<string>("");
  const [filterPlaylists, setFilterPlaylists] = useState<any[]>([]);
  const [offset, setOffset] = useState<number>(0);
  const limit = 20;

  const { loading, error, playlists, tracks, hasMore } = usePlaylistLoad(
    offset,
    limit,
    userContext?.headers,
    userContext?.userProfile.id,
    curPlaylist
  );

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
  // TODO: add individual playlist view, management and creation/deletion

  return (
    <div className="playlist_container">
      {curPlaylist === "" ? (
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
                        onClick={() => setCurPlaylist(playlist.id)}
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
                        onClick={() => setCurPlaylist(playlist.id)}
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
        <div>
          {tracks.map((track, index) => {
            return (
              <div key={index}>
                <h4>{track.track.name}</h4>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Playlist;
