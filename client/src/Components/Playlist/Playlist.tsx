import {
  FunctionComponent,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import usePlaylistLoad from "../../Hooks/usePlaylistLoad";
import { UserContext } from "../../Pages/Home/Home";

const Playlist: FunctionComponent<{}> = () => {
  const userContext = useContext(UserContext);
  const [curPlaylist, setCurPlaylist] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [offset, setOffset] = useState<number>(0);
  const limit = 20;

  const { loading, error, playlists, hasMore } = usePlaylistLoad(
    offset,
    limit,
    userContext?.headers
  );

  const observer = useRef<any>();
  const lastPlaylistElementRef = useCallback(
    (node: any) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setOffset((prevOffset) => prevOffset + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );
  // TODO: handle no playlist case
  // TODO: add styling
  // TODO: add song preview on playlist hover/select
  // TODO: add individual playlist view, management and creation/deletion

  return (
    <div className="playlist_container">
      {curPlaylist === "" ? (
        <div className="playlist_browse">
          {playlists.map((playlist, index) => {
            if (playlists.length === index + 1) {
              return (
                <div ref={lastPlaylistElementRef} key={playlist}>
                  <img src={playlist.images[0].url} alt="playlist image" />
                  <h4>{playlist.name}</h4>
                  <h4>{playlist.description}</h4>
                </div>
              );
            } else {
              return <div key={playlist}>{playlist}</div>;
            }
          })}
          <div>{loading && "Loading..."}</div>
          <div>{error && "Error"}</div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

export default Playlist;
