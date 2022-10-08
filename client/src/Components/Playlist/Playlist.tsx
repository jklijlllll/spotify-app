import {
  FunctionComponent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import usePlaylistLoad from "../../Hooks/usePlaylistLoad";
import { UserContext } from "../../Pages/Home/Home";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import AddBoxIcon from "@mui/icons-material/AddBox";
import { Button, IconButton, Menu, MenuItem } from "@mui/material";
import FilterBar from "../FilterBar";
import { milliToMinandSec } from "../../Functions/milliToMinAndSec";
import { startPlayback } from "../../Functions/startPlayback";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import PlaylistEdit from "../PlaylistEdit";
import PlaylistAdd from "../PlaylistAdd";
import axios from "axios";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import SearchBar from "../SearchBar";
import {
  PlaylistInterface,
  TrackInterface,
  ArtistInterface,
} from "../../Types/SpotifyApi";

const Playlist: FunctionComponent<{ update: number }> = ({ update }) => {
  const emptyPlaylist = useMemo(() => {
    return {
      collaborative: false,
      description: null,
      external_urls: { spotify: "" },
      followers: { href: "", total: 0 },
      href: "",
      id: "",
      images: [{ url: "", height: 0, width: 0 }],
      name: "",
      owner: {
        external_urls: { spotify: "" },
        followers: { href: "", total: 0 },
        href: "",
        id: "",
        type: "",
        uri: "",
        display_name: "",
      },
      public: false,
      snapshot_id: false,
      tracks: {
        href: "",
        items: [],
        limit: 0,
        next: "",
        offset: 0,
        previous: "",
        total: 0,
      },
      type: "",
      uri: "",
    };
  }, []);
  const userContext = useContext(UserContext);
  const [curPlaylist, setCurPlaylist] =
    useState<PlaylistInterface>(emptyPlaylist);

  const [filterPlaylists, setFilterPlaylists] = useState<PlaylistInterface[]>(
    []
  );
  const [offset, setOffset] = useState<number>(0);

  const limit = 20;

  const [snapshot_id, setSnapShotId] = useState<string>("");

  const { loading, error, playlists, tracks, hasMore } = usePlaylistLoad(
    offset,
    limit,
    userContext?.headers,
    userContext?.userProfile !== null ? userContext!.userProfile.id : "",
    curPlaylist,
    update,
    snapshot_id
  );

  useEffect(() => {
    setCurPlaylist(emptyPlaylist);
    setFilterPlaylists([]);
    setOffset(0);
  }, [update, emptyPlaylist]);

  const observer = useRef<IntersectionObserver>();
  const lastPlaylistElementRef = useCallback(
    (node: HTMLDivElement) => {
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

  // TODO: update on playlist creation
  // TODO: fix menu open errors

  let dateFormat: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  const [openEdit, setOpenEdit] = useState<boolean>(false);

  const [openAdd, setOpenAdd] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState<boolean[]>(
    new Array(tracks.length).fill(false)
  );
  const [anchorEl, setAnchorEl] = useState<(null | HTMLElement)[]>(
    new Array(tracks.length).fill(null)
  );

  useEffect(() => {
    setMenuOpen(new Array(tracks.length).fill(false));
    setAnchorEl(new Array(tracks.length).fill(null));
  }, [tracks]);

  const handleClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    index: number
  ) => {
    let anchors = anchorEl;
    anchors[index] = event.currentTarget;
    setAnchorEl([...anchors]);
    let menu = menuOpen;
    menu[index] = !menu[index];
    setMenuOpen([...menu]);
  };
  const handleClose = (index: number) => {
    let anchors = anchorEl;
    anchors[index] = null;
    setAnchorEl([...anchors]);
    let menu = menuOpen;
    menu[index] = false;
    setMenuOpen([...menu]);
  };

  const [searchTracks, setSearchTracks] = useState<TrackInterface[]>([]);
  const [query, setQuery] = useState<string>("");
  const [historyTracks, setHistoryTracks] = useState<TrackInterface[]>([]);

  useEffect(() => {
    setQuery("");
  }, [curPlaylist]);

  const updateTracks = () => {
    if (localStorage.getItem("history")) {
      setHistoryTracks(JSON.parse(localStorage.getItem("history")!).reverse());
    }
  };

  useEffect(() => {
    updateTracks();

    window.addEventListener("changed", updateTracks);

    return () => {
      window.removeEventListener("changed", updateTracks);
    };
  }, []);

  const addTrack = (track: TrackInterface) => {
    axios
      .post(
        `https://api.spotify.com/v1/playlists/${curPlaylist.id}/tracks`,
        { uris: [track.uri] },
        { headers: userContext?.headers }
      )
      .then((response) => {
        setSnapShotId(response.data.snapshot_id);
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    if (snapshot_id === "") return;

    axios
      .get(`https://api.spotify.com/v1/playlists/${curPlaylist.id}`, {
        headers: userContext?.headers,
      })
      .then((response) => {
        setCurPlaylist(response.data);
        // TODO: do not change if same playlist
        setSnapShotId("");
      })
      .catch((error) => console.log(error));
  }, [snapshot_id, curPlaylist.id, userContext?.headers]);
  // TODO: test no playlist view

  return (
    <div className="playlist_container">
      <PlaylistAdd
        open={openAdd}
        setOpen={setOpenAdd}
        userId={
          userContext?.userProfile !== null ? userContext!.userProfile.id : ""
        }
        headers={userContext?.headers}
        useHistory={true}
        tracks={[]}
      />
      {curPlaylist.id === "" ? (
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
                        alt="playlist cover"
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
                        alt="playlist cover"
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
            <div
              className="playlist_select"
              onClick={() => {
                setOpenAdd(true);
              }}
            >
              <AddBoxIcon
                sx={{ height: "200px", width: "200px", color: "white" }}
              />
              <h4 className="playlist_create_text">Create Playlist</h4>
            </div>
          </div>

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
                  alt="playlist cover"
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
                    className="playlist_item_flex"
                    ref={lastPlaylistElementRef}
                  >
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
                        <h4 className="playlist_item_name">
                          {track.track.name}
                        </h4>
                        <h4 className="playlist_item_artists">
                          {track.track.artists
                            .map((artist: ArtistInterface) => artist.name)
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
                    <IconButton
                      sx={{
                        color: "white",
                      }}
                      size="small"
                      id={`track_option${index}`}
                      aria-controls={
                        menuOpen[index] ? `track_menu${index}` : undefined
                      }
                      aria-haspopup="true"
                      aria-expanded={menuOpen[index] ? "true" : undefined}
                      onClick={(e) => {
                        handleClick(e, index);
                      }}
                    >
                      <MoreHorizIcon />
                    </IconButton>

                    <Menu
                      id={`track_menu${index}`}
                      anchorEl={anchorEl[index]}
                      open={menuOpen[index]}
                      onClose={() => {
                        handleClose(index);
                      }}
                      MenuListProps={{
                        "aria-labelledby": `track_option${index}`,
                      }}
                    >
                      <MenuItem
                        sx={{ fontSize: "12px" }}
                        onClick={() => {
                          axios
                            .delete(
                              `https://api.spotify.com/v1/playlists/${curPlaylist.id}/tracks`,
                              {
                                headers: userContext?.headers,
                                data: {
                                  tracks: [{ uri: track.track.uri }],
                                  ...(snapshot_id === ""
                                    ? {}
                                    : { snapshot_id: snapshot_id }),
                                },
                              }
                            )
                            .then((response) => {
                              handleClose(index);
                              setSnapShotId(response.data.snapshot_id);
                            })
                            .catch((error) => console.log(error));
                        }}
                      >
                        Remove from Playlist
                      </MenuItem>
                    </Menu>
                  </div>
                );
              } else {
                return (
                  <div className="playlist_item_flex">
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
                        <h4 className="playlist_item_name">
                          {track.track.name}
                        </h4>
                        <h4 className="playlist_item_artists">
                          {track.track.artists
                            .map((artist: ArtistInterface) => artist.name)
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
                    <IconButton
                      sx={{
                        color: "white",
                      }}
                      size="small"
                      id={`track_option${index}`}
                      aria-controls={
                        menuOpen[index] ? `track_menu${index}` : undefined
                      }
                      aria-haspopup="true"
                      aria-expanded={menuOpen[index] ? "true" : undefined}
                      onClick={(e) => {
                        handleClick(e, index);
                      }}
                    >
                      <MoreHorizIcon />
                    </IconButton>

                    <Menu
                      id={`track_menu${index}`}
                      anchorEl={anchorEl[index]}
                      open={menuOpen[index]}
                      onClose={() => {
                        handleClose(index);
                      }}
                      MenuListProps={{
                        "aria-labelledby": `track_option${index}`,
                      }}
                    >
                      <MenuItem sx={{ fontSize: "12px" }} onClick={() => {}}>
                        Remove from Playlist
                      </MenuItem>
                    </Menu>
                  </div>
                );
              }
            })}
            {!hasMore && !loading ? (
              <div className="playlist_view_add_container">
                <h1 className="playlist_view_add_title"> Add Tracks</h1>
                <div className="playlist_view_add_search_bar">
                  <SearchBar
                    searchInput={query}
                    setSearchInput={setQuery}
                    setSearchResults={setSearchTracks}
                    headers={userContext?.headers}
                    width={"500px"}
                    height={"50px"}
                    limit={50}
                  />
                </div>

                {searchTracks.length === 0 ? (
                  <div className="playlist_view_add_tracks">
                    {historyTracks.map((track: TrackInterface, key: number) => (
                      <div className="playlist_view_add_track" key={key}>
                        <img
                          className="playlist_view_add_cover"
                          src={track.album.images[2].url}
                          alt="album cover"
                        />
                        <div className="playlist_view_add_track_info_container">
                          <div className="playlist_view_add_track_info_title">
                            {track.name}
                          </div>
                          <div className="playlist_view_add_track_info_name">
                            {track.artists
                              .map((artist: ArtistInterface) => artist.name)
                              .join(", ")}
                          </div>
                        </div>
                        <Button
                          variant="contained"
                          startIcon={<AddCircleOutlineIcon />}
                          sx={{
                            height: "80%",
                            width: "100px",
                            marginRight: "32px",
                          }}
                          onClick={() => addTrack(track)}
                        >
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="playlist_view_add_tracks">
                    {searchTracks.map((track: TrackInterface, key: number) => (
                      <div className="playlist_view_add_track" key={key}>
                        <img
                          className="playlist_view_add_cover"
                          src={track.album.images[2].url}
                          alt="album cover"
                        />
                        <div className="playlist_view_add_track_info_container">
                          <div className="playlist_view_add_track_info_title">
                            {track.name}
                          </div>
                          <div className="playlist_view_add_track_info_name">
                            {track.artists
                              .map((artist: ArtistInterface) => artist.name)
                              .join(", ")}
                          </div>
                        </div>
                        <Button
                          variant="contained"
                          startIcon={<AddCircleOutlineIcon />}
                          sx={{
                            height: "80%",
                            width: "100px",
                            marginRight: "32px",
                          }}
                          onClick={() => addTrack(track)}
                        >
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <></>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Playlist;
