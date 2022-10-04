import { Modal, Fade, Checkbox, Button, CircularProgress } from "@mui/material";
import { FunctionComponent, useEffect, useState } from "react";
import PlaylistName from "../Inputs/PlaylistName";
import PlaylistDesc from "../Inputs/PlaylistDesc";
import PlaylistImage from "../Inputs/PlaylistImage";
import ErrorIcon from "@mui/icons-material/Error";
import axios from "axios";

const PlaylistAdd: FunctionComponent<{
  open: boolean;
  setOpen: any;
  userId: string;
  headers: any;
  useHistory: boolean;
  tracks: any[];
}> = ({ open, setOpen, userId, headers, useHistory, tracks }) => {
  const [name, setName] = useState<string>("");
  const [desc, setDesc] = useState<string>("");
  const [error, setError] = useState<string>("");

  const [imageURL, setImageURL] = useState<string>("");
  const [image64, setImage64] = useState<any>(null);

  const [loadCreate, setLoadCreate] = useState<boolean>(false);
  const [loadTracks, setLoadTracks] = useState<boolean>(false);
  const [loadImage, setLoadImage] = useState<boolean>(false);

  const [playlistId, setPlaylistId] = useState<string>("");

  const [addTracks, setAddTracks] = useState<any[]>(tracks);

  const maxTracks = 100;

  const removeImage = () => {
    setImageURL("");
    setImage64(null);
  };

  const [selectedTracks, setSelectedTracks] = useState<boolean[]>([]);

  const updateTracks = () => {
    if (useHistory && localStorage.getItem("history")) {
      setAddTracks(JSON.parse(localStorage.getItem("history")!));
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
  }, []);

  useEffect(() => {
    setSelectedTracks(new Array(addTracks.length).fill(!useHistory));
  }, [addTracks]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    key: number
  ) => {
    let newTracks = [...selectedTracks];
    newTracks[key] = event.target.checked;
    setSelectedTracks(newTracks);
  };

  const handleSubmit = () => {
    if (name === "") return;
    setLoadCreate(true);
    if (selectedTracks.filter((value) => value === true).length !== 0)
      setLoadTracks(true);
    if (image64 !== null) setLoadImage(true);
  };

  useEffect(() => {
    if (loadCreate === false) return;

    axios
      .post(
        `https://api.spotify.com/v1/users/${userId}/playlists`,
        { name: name, description: desc },
        { headers: headers }
      )
      .then((response) => {
        setLoadCreate(false);
        setPlaylistId(response.data.id);
        if (loadTracks === false && loadImage === false) {
          setOpen(false);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, [loadCreate]);

  useEffect(() => {
    if (playlistId === "") return;

    let uris = [];

    for (let i = 0; i < addTracks.length; i++) {
      if (selectedTracks[i]) {
        uris.push(addTracks[i].uri);
      }
    }

    axios
      .post(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        { uris: uris },
        { headers: headers }
      )
      .then((response) => {
        setLoadTracks(false);
        setOpen(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [playlistId]);

  useEffect(() => {
    if (playlistId === "" || loadImage === false) return;

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
        setLoadImage(false);
        setOpen(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [playlistId]);

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
              />
              {error === "" ? (
                <></>
              ) : (
                <div className="playlist_add_error_container">
                  <ErrorIcon fontSize="small" />
                  <h4 className="playlist_add_error_text">{error}</h4>
                </div>
              )}
              <PlaylistName
                name={name}
                setName={setName}
                setError={setError}
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
                          .map((artist: any) => artist.name)
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
