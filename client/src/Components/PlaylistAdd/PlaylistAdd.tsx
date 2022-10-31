import {
  Modal,
  Fade,
  Checkbox,
  Button,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import { FunctionComponent, useEffect, useState } from "react";
import PlaylistName from "../Inputs/PlaylistName";
import PlaylistDesc from "../Inputs/PlaylistDesc";
import PlaylistImage from "../Inputs/PlaylistImage";
import ErrorIcon from "@mui/icons-material/Error";
import axios from "axios";
import {
  ArtistInterface,
  PlaylistInterface,
  TrackInterface,
} from "../../Types/SpotifyApi";
import PublicIcon from "@mui/icons-material/Public";
import PublicOffIcon from "@mui/icons-material/PublicOff";
import PersonIcon from "@mui/icons-material/Person";
import GroupsIcon from "@mui/icons-material/Groups";
import "./PlaylistAdd.css";

const PlaylistAdd: FunctionComponent<{
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  userId: string;
  headers: any;
  useHistory: boolean;
  tracks: TrackInterface[];
  setPlaylists?: React.Dispatch<React.SetStateAction<PlaylistInterface[]>>;
}> = ({ open, setOpen, userId, headers, useHistory, tracks, setPlaylists }) => {
  const [name, setName] = useState<string>("");
  const [desc, setDesc] = useState<string>("");
  const [nameError, setNameError] = useState<string>("");
  const [imageError, setImageError] = useState<string>("");

  const [imageURL, setImageURL] = useState<string>("");
  const [image64, setImage64] = useState<string>("");

  const [loadCreate, setLoadCreate] = useState<boolean>(false);
  const [loadTracks, setLoadTracks] = useState<boolean>(false);
  const [loadImage, setLoadImage] = useState<boolean>(false);

  const [sendCreate, setSendCreate] = useState<boolean>(false);
  const [sendTracks, setSendTracks] = useState<boolean>(false);
  const [sendImage, setSendImage] = useState<boolean>(false);

  const [playlistId, setPlaylistId] = useState<string>("");

  const [addTracks, setAddTracks] = useState<TrackInterface[]>(tracks);

  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [isCollab, setIsCollab] = useState<boolean>(false);

  const maxTracks = 100;

  const removeImage = () => {
    setImageURL("");
    setImage64("");
  };

  const [selectedTracks, setSelectedTracks] = useState<boolean[]>([]);

  const updateTracks = () => {
    if (useHistory && localStorage.getItem("history")) {
      setAddTracks(JSON.parse(localStorage.getItem("history")!).reverse());
      let oldSelect = selectedTracks;
      if (addTracks.length === maxTracks) oldSelect.shift();

      oldSelect.push(!useHistory);
      setSelectedTracks(oldSelect);
    }
  };
  useEffect(() => {
    updateTracks();

    window.addEventListener("changed", updateTracks);

    return () => {
      window.removeEventListener("changed", updateTracks);
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    setSelectedTracks(new Array(addTracks.length).fill(!useHistory));
  }, [addTracks, useHistory]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    key: number
  ) => {
    let newTracks = [...selectedTracks];
    newTracks[key] = event.target.checked;
    setSelectedTracks(newTracks);
  };

  const handleSubmit = () => {
    if (name === "") {
      setNameError("Playlist name is required");
      return;
    }
    setLoadCreate(true);
    if (selectedTracks.filter((value) => value === true).length !== 0)
      setLoadTracks(true);
    if (image64 !== "") setLoadImage(true);
  };

  useEffect(() => {
    if (!loadCreate || sendCreate || userId === "") return;

    setSendCreate(true);
    axios
      .post(
        `https://api.spotify.com/v1/users/${userId}/playlists`,
        {
          name: name,
          description: desc,
          public: isPublic,
          collaborative: isCollab,
        },
        { headers: headers }
      )
      .then((response) => {
        setLoadCreate(false);
        setPlaylistId(response.data.id);
        if (setPlaylists)
          setPlaylists((playlists) => {
            return [response.data, ...playlists];
          });
        if (loadTracks === false && loadImage === false) {
          setOpen(false);
        }
      })
      .catch((error) => {
        console.log(error);
      });
    setName("");
    setDesc("");
    setIsPublic(true);
    setIsCollab(false);
  }, [
    loadCreate,
    desc,
    headers,
    loadImage,
    loadTracks,
    name,
    setOpen,
    userId,
    isCollab,
    isPublic,
    setPlaylists,
    sendCreate,
  ]);

  useEffect(() => {
    if (playlistId === "" || !loadTracks || sendTracks) return;

    setSendTracks(true);
    let uris = [];

    let trackNum = 0;
    for (let i = 0; i < addTracks.length; i++) {
      if (selectedTracks[i]) {
        uris.push(addTracks[i].uri);
        trackNum++;
      }
    }

    axios
      .post(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        { uris: uris },
        { headers: headers }
      )
      .then((response) => {
        if (setPlaylists)
          setPlaylists((playlists) => {
            playlists[
              playlists.findIndex((p) => p.id === playlistId)
            ].tracks.total += trackNum;
            return playlists;
          });
        setLoadTracks(false);
        setOpen(false);
      })
      .catch((error) => {
        console.log(error);
      });

    setSelectedTracks(new Array(addTracks.length).fill(!useHistory));
  }, [
    playlistId,
    addTracks,
    headers,
    selectedTracks,
    setOpen,
    setPlaylists,
    useHistory,
    loadTracks,
    sendTracks,
  ]);

  useEffect(() => {
    if (playlistId === "" || !loadImage || sendImage || image64 === "") return;

    setSendImage(true);
    axios
      .put(
        `https://api.spotify.com/v1/playlists/${playlistId}/images`,
        image64,
        {
          headers: {
            "Content-Type": "image/jpeg",
            ...headers,
          },
        }
      )
      .then((response) => {
        if (setPlaylists)
          setPlaylists((playlists) => {
            playlists[
              playlists.findIndex((p) => p.id === playlistId)
            ].images.push({ height: null, width: null, url: imageURL });
            return [...playlists];
          });
        setLoadImage(false);
        setOpen(false);
      })
      .catch((error) => {
        console.log(error);
      });

    removeImage();
  }, [
    playlistId,
    headers,
    image64,
    loadImage,
    setOpen,
    setPlaylists,
    imageURL,
    sendImage,
  ]);

  useEffect(() => {
    setSendCreate(false);
    setSendTracks(false);
    setSendImage(false);
  }, [open]);

  return (
    <>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        sx={{ display: "flex", overflow: "auto" }}
        closeAfterTransition
      >
        <Fade in={open}>
          {loadCreate || loadTracks || loadImage ? (
            <div className="playlist_add_container">
              <CircularProgress
                variant="indeterminate"
                thickness={2}
                sx={{
                  color: "white",
                }}
                style={{
                  width: "300px",
                  height: "300px",
                  paddingTop: "10px",
                  paddingBottom: "10px",
                }}
              />
            </div>
          ) : (
            <div className="playlist_add_container">
              <h1 className="playlist_add_title">Create Playlist</h1>
              <PlaylistImage
                setImageURL={setImageURL}
                setImage64={setImage64}
                curPlaylist={null}
                imageURL={imageURL}
                removeImage={removeImage}
                width={192}
                height={192}
                setError={setImageError}
              />
              {nameError === "" && imageError === "" ? (
                <></>
              ) : (
                <div className="playlist_add_error_container">
                  <ErrorIcon fontSize="small" />
                  <div className="playlist_add_error_flex">
                    <h4 className="playlist_add_error_text">{nameError}</h4>
                    <h4 className="playlist_add_error_text">{imageError}</h4>
                  </div>
                </div>
              )}
              <PlaylistName
                name={name}
                setName={setName}
                setError={setNameError}
                style={{
                  color: "white",
                  backgroundColor: "gray",
                  width: "90%",
                  marginTop: "10px",
                  marginBottom: "10px",
                  input: { color: "white" },
                  ".MuiFormLabel-root": {
                    color: "white",
                  },
                }}
              />
              <PlaylistDesc
                desc={desc}
                setDesc={setDesc}
                styles={{
                  color: "white",
                  backgroundColor: "gray",
                  width: "90%",
                  input: { color: "white" },
                  ".MuiFormLabel-root": {
                    color: "white",
                  },
                }}
              />
              <div className="playlist_edit_toggles">
                <ToggleButtonGroup
                  value={isPublic}
                  onChange={(
                    event: React.MouseEvent<HTMLElement>,
                    newValue: boolean
                  ) => {
                    setIsPublic(newValue);
                  }}
                  exclusive
                  sx={{ paddingRight: "5px" }}
                >
                  <ToggleButton
                    value={false}
                    sx={{
                      backgroundColor: "white",
                      "&:hover": {
                        backgroundColor: "green",
                      },
                      "&.Mui-selected": {
                        backgroundColor: "green",
                      },
                      "&.Mui-selected:hover": {
                        backgroundColor: "green",
                      },
                    }}
                  >
                    <PublicOffIcon />
                  </ToggleButton>
                  <ToggleButton
                    value={true}
                    sx={{
                      backgroundColor: "white",
                      "&:hover": {
                        backgroundColor: "green",
                      },
                      "&.Mui-selected": {
                        backgroundColor: "green",
                      },
                      "&.Mui-selected:hover": {
                        backgroundColor: "green",
                      },
                    }}
                  >
                    <PublicIcon />
                  </ToggleButton>
                </ToggleButtonGroup>
                <ToggleButtonGroup
                  disabled={isPublic}
                  value={isPublic ? false : isCollab}
                  onChange={(
                    event: React.MouseEvent<HTMLElement>,
                    newValue: boolean
                  ) => {
                    setIsCollab(newValue);
                  }}
                  exclusive
                  sx={{ paddingLeft: "5px" }}
                >
                  <ToggleButton
                    value={false}
                    sx={{
                      backgroundColor: "white",
                      "&:hover": {
                        backgroundColor: "green",
                      },
                      "&.Mui-selected": {
                        backgroundColor: "green",
                      },
                      "&.Mui-selected:hover": {
                        backgroundColor: "green",
                      },
                    }}
                  >
                    <PersonIcon />
                  </ToggleButton>
                  <ToggleButton
                    value={true}
                    sx={{
                      backgroundColor: "white",
                      "&:hover": {
                        backgroundColor: "green",
                      },
                      "&.Mui-selected": {
                        backgroundColor: "green",
                      },
                      "&.Mui-selected:hover": {
                        backgroundColor: "green",
                      },
                    }}
                  >
                    <GroupsIcon />
                  </ToggleButton>
                </ToggleButtonGroup>
              </div>
              <div className="playlist_add_tracks_container">
                {addTracks.map((track, key) => (
                  <div className="playlist_add_track" key={key}>
                    <img
                      className="playlist_add_image"
                      src={track.album.images[2].url}
                      alt="song cover"
                    />
                    <div className="playlist_add_track_info_container">
                      <div className="playlist_add_track_info_title">
                        {track.name}
                      </div>
                      <div className="playlist_add_track_info_name">
                        {track.artists
                          .map((artist: ArtistInterface) => artist.name)
                          .join(", ")}
                      </div>
                    </div>
                    <Checkbox
                      checked={selectedTracks[key]}
                      onChange={(event) => {
                        handleChange(event, key);
                      }}
                      inputProps={{ "aria-label": "controlled" }}
                    />
                  </div>
                ))}
              </div>

              <Button
                variant="contained"
                sx={{ marginTop: "10px", marginBottom: "10px" }}
                onClick={() => handleSubmit()}
              >
                Create Playlist
              </Button>
            </div>
          )}
        </Fade>
      </Modal>
    </>
  );
};

export default PlaylistAdd;
