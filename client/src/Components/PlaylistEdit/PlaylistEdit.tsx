import {
  Fade,
  IconButton,
  Modal,
  ToggleButtonGroup,
  ToggleButton,
  Button,
  CircularProgress,
} from "@mui/material";
import { FunctionComponent, useEffect, useState } from "react";
import PublicIcon from "@mui/icons-material/Public";
import PublicOffIcon from "@mui/icons-material/PublicOff";
import PersonIcon from "@mui/icons-material/Person";
import GroupsIcon from "@mui/icons-material/Groups";
import ClearIcon from "@mui/icons-material/Clear";
import ErrorIcon from "@mui/icons-material/Error";
import axios from "axios";
import PlaylistName from "../Inputs/PlaylistName";
import PlaylistDesc from "../Inputs/PlaylistDesc";
import PlaylistImage from "../Inputs/PlaylistImage";
import { PlaylistInterface } from "../../Types/SpotifyApi";

const PlaylistEdit: FunctionComponent<{
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  curPlaylist: PlaylistInterface;
  headers: any;
  updateInfo: (
    name: string,
    desc: string,
    isPublic: boolean,
    isCollab: boolean
  ) => void;
  updateImage: (images: any) => void;
}> = ({ open, setOpen, curPlaylist, headers, updateInfo, updateImage }) => {
  const [imageURL, setImageURL] = useState<string>("");
  const [image64, setImage64] = useState<string>("");

  const [name, setName] = useState<string>("");
  const [desc, setDesc] = useState<string>("");

  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [isCollab, setIsCollab] = useState<boolean>(false);

  const [nameError, setNameError] = useState<string>("");
  const [imageError, setImageError] = useState<string>("");

  const [loadInfo, setLoadInfo] = useState<boolean>(false);
  const [loadImage, setLoadImage] = useState<boolean>(false);

  useEffect(() => {
    setImageURL(curPlaylist.images[0] ? curPlaylist.images[0].url : "");
    setName(curPlaylist.name);
    setDesc(curPlaylist.description || "");
    setIsPublic(curPlaylist.public);
    setIsCollab(curPlaylist.collaborative);
  }, [curPlaylist]);

  const updatePlaylist = () => {
    updateInfo(name, desc, isPublic, isCollab);
  };

  const removeImage = () => {
    setImageURL(curPlaylist.images[0] ? curPlaylist.images[0].url : "");
    setImage64("");
  };

  const handleSubmit = () => {
    if (name === "") return;

    let hasChanged = false;
    if (
      name !== curPlaylist.name ||
      desc !== curPlaylist.description ||
      isPublic !== curPlaylist.public ||
      isCollab !== curPlaylist.collaborative
    ) {
      hasChanged = true;
      setLoadInfo(true);
      axios
        .put(
          `https://api.spotify.com/v1/playlists/${curPlaylist.id}`,
          {
            name: name,
            description: desc,
            public: isPublic,
            collaborative: isPublic ? false : isCollab,
          },
          {
            headers: headers,
          }
        )
        .then((response) => {
          updatePlaylist();
          setOpen(false);
          setLoadInfo(false);
        })
        .catch((error) => {});
    }

    if (image64 !== "") {
      hasChanged = true;
      setLoadImage(true);
      axios
        .put(
          `https://api.spotify.com/v1/playlists/${curPlaylist.id}/images`,
          image64,
          {
            headers: {
              "Content-Type": "image/jpeg",
              ...headers,
            },
          }
        )
        .then((response) => {
          updatePlaylist();
          setOpen(false);
          setLoadImage(false);
        })
        .catch((error) => {
          console.log(error);
        });
    }

    if (!hasChanged) setOpen(false);
  };

  useEffect(() => {
    if (open || curPlaylist.id === "") return;

    axios
      .get(`https://api.spotify.com/v1/playlists/${curPlaylist.id}/images`, {
        headers: headers,
      })
      .then((response) => {
        updateImage(response.data);
      });
  }, [open, curPlaylist.id, headers, updateInfo, updateImage]);

  return (
    <>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        sx={{ display: "flex" }}
        closeAfterTransition
      >
        <Fade in={open}>
          {loadInfo || loadImage ? (
            <div className="playlist_edit_container">
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
            <div className="playlist_edit_container">
              <div className="playlist_edit_header">
                <h1 className="playlist_edit_title">Edit playlist details</h1>
                <IconButton onClick={() => setOpen(false)}>
                  <ClearIcon sx={{ color: "white" }} />
                </IconButton>
              </div>
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
              <div className="playlist_edit_flex">
                <PlaylistImage
                  setImageURL={setImageURL}
                  setImage64={setImage64}
                  curPlaylist={curPlaylist}
                  imageURL={imageURL}
                  removeImage={removeImage}
                  width={128}
                  height={128}
                  setError={setImageError}
                />

                <div className="playlist_edit_info_container">
                  <PlaylistName
                    name={name}
                    setName={setName}
                    setError={setNameError}
                    style={{
                      color: "white",
                      backgroundColor: "gray",
                      marginLeft: "10px",
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
                      marginLeft: "10px",
                      input: { color: "white" },
                      ".MuiFormLabel-root": {
                        color: "white",
                      },
                    }}
                  />
                </div>
              </div>
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
              <Button
                sx={{
                  marginTop: "10px",
                  backgroundColor: "white",
                  "&:hover": {
                    backgroundColor: "white",
                    boxShadow: "0 0px 15px white",
                  },
                  marginBottom: "10px",
                }}
                onClick={() => handleSubmit()}
              >
                Save
              </Button>
            </div>
          )}
        </Fade>
      </Modal>
    </>
  );
};

export default PlaylistEdit;
