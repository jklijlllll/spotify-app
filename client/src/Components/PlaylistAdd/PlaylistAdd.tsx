import { Modal, Fade, TextField, Checkbox, Button } from "@mui/material";
import { FunctionComponent, useEffect, useState } from "react";
import PlaylistName from "../Inputs/PlaylistName";
import PlaylistDesc from "../Inputs/PlaylistDesc";
import PlaylistImage from "../Inputs/PlaylistImage";
import ErrorIcon from "@mui/icons-material/Error";

const PlaylistAdd: FunctionComponent<{
  open: boolean;
  setOpen: any;
  tracks: any[];
}> = ({ open, setOpen, tracks }) => {
  const [name, setName] = useState<string>("");
  const [desc, setDesc] = useState<string>("");
  const [error, setError] = useState<string>("");

  const [imageURL, setImageURL] = useState<string>("");
  const [image64, setImage64] = useState<any>(null);

  const removeImage = () => {
    setImageURL("");
    setImage64(null);
  };

  const [selectedTracks, setSelectedTracks] = useState<boolean[]>([]);

  useEffect(() => {
    setSelectedTracks(new Array(tracks.length).fill(true));
  }, [tracks]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    key: number
  ) => {
    let newTracks = [...selectedTracks];
    newTracks[key] = event.target.checked;
    setSelectedTracks(newTracks);
  };
  return (
    <>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        sx={{ display: "flex", overflow: "auto" }}
        closeAfterTransition
      >
        <Fade in={open}>
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
              {tracks.map((track, key) => (
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
            >
              Create Playlist
            </Button>
          </div>
        </Fade>
      </Modal>
    </>
  );
};

export default PlaylistAdd;
