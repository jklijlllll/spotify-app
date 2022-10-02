import {
  Fade,
  IconButton,
  Modal,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  Button,
  Menu,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { FunctionComponent, useEffect, useRef, useState } from "react";
import PublicIcon from "@mui/icons-material/Public";
import PublicOffIcon from "@mui/icons-material/PublicOff";
import PersonIcon from "@mui/icons-material/Person";
import GroupsIcon from "@mui/icons-material/Groups";
import ClearIcon from "@mui/icons-material/Clear";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import EditIcon from "@mui/icons-material/Edit";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import ErrorIcon from "@mui/icons-material/Error";
import axios from "axios";
import { request } from "https";

const PlaylistEdit: FunctionComponent<{
  open: boolean;
  setOpen: any;
  curPlaylist: any;
  setCurPlaylist: any;
  headers: any;
}> = ({ open, setOpen, curPlaylist, setCurPlaylist, headers }) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const [imageURL, setImageURL] = useState<string>(
    curPlaylist.images[0] ? curPlaylist.images[0].url : ""
  );
  const [image64, setImage64] = useState<any>(null);
  const fileInput = useRef<any>(null);

  const [name, setName] = useState<string>(curPlaylist.name || "");
  const [desc, setDesc] = useState<string>(curPlaylist.description || "");

  const [isPublic, setIsPublic] = useState<boolean>(curPlaylist.public);
  const [isCollab, setIsCollab] = useState<boolean>(curPlaylist.collaborative);

  const [error, setError] = useState<string>("");

  const [loadInfo, setLoadInfo] = useState<boolean>(false);
  const [loadImage, setLoadImage] = useState<boolean>(false);

  const updatePlaylist = () => {
    setCurPlaylist({
      ...curPlaylist,
      name: name,
      description: desc,
      public: isPublic,
      collaborative: isPublic ? false : isCollab,
    });
  };

  const removeImage = () => {
    setImageURL(curPlaylist.images[0] ? curPlaylist.images[0].url : "");
    setImage64(null);
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

    if (image64 !== null) {
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
    if (open) return;

    axios
      .get(`https://api.spotify.com/v1/playlists/${curPlaylist.id}/images`, {
        headers: headers,
      })
      .then((response) => {
        setCurPlaylist({
          ...curPlaylist,
          images: response.data,
        });
      });
  }, [open]);
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
              {error === "" ? (
                <></>
              ) : (
                <div className="playlist_edit_error_container">
                  <ErrorIcon fontSize="small" />
                  <h4 className="playlist_edit_error_text">{error}</h4>
                </div>
              )}
              <div className="playlist_edit_flex">
                <div
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  className="playlist_edit_cover"
                >
                  {/* TODO: limit file size */}
                  <input
                    hidden
                    id="image_upload"
                    accept="image/*"
                    type="file"
                    ref={fileInput}
                    onChange={(e) => {
                      if (e.target.files === null) return;
                      setImageURL(URL.createObjectURL(e.target.files[0]));
                      let reader = new FileReader();
                      reader.readAsDataURL(e.target.files[0]);
                      reader.onload = function () {
                        if (typeof reader.result === "string") {
                          setImage64(reader.result.split(",")[1]);
                        }
                      };
                    }}
                  />

                  <label htmlFor="image_upload">
                    {curPlaylist.images[0] || imageURL !== "" ? (
                      <img
                        className="playlist_edit_cover"
                        src={imageURL}
                        alt="playlist image"
                        style={{ opacity: isHovered ? 0.2 : 1.0 }}
                      />
                    ) : (
                      <div
                        className="playlist_edit_empty_cover"
                        style={{ opacity: isHovered ? 0.2 : 1.0 }}
                      >
                        <MusicNoteIcon
                          sx={{
                            color: "gray",
                            width: "32px",
                            height: "32px",
                          }}
                        />
                      </div>
                    )}
                  </label>
                  {isHovered ? (
                    <div className="playlist_edit_cover_overlay">
                      <IconButton
                        sx={{
                          color: "white",
                          marginLeft: "80px",
                          bottom: "8px",
                          marginBottom: "-17.5px",
                        }}
                        size="small"
                        id="edit_image_button"
                        aria-controls={menuOpen ? "image_menu" : undefined}
                        aria-haspopup="true"
                        aria-expanded={menuOpen ? "true" : undefined}
                        onClick={handleClick}
                      >
                        <MoreHorizIcon />
                      </IconButton>

                      <Menu
                        id="image_menu"
                        anchorEl={anchorEl}
                        open={menuOpen}
                        onClose={handleClose}
                        MenuListProps={{
                          "aria-labelledby": "edit_image_button",
                        }}
                        sx={{ marginTop: "-16px" }}
                      >
                        <MenuItem
                          onClick={() => {
                            handleClose();
                            if (fileInput.current) fileInput.current.click();
                          }}
                        >
                          Change Photo
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            handleClose();
                            removeImage();
                          }}
                        >
                          Remove Photo
                        </MenuItem>
                      </Menu>

                      <EditIcon
                        sx={{ marginLeft: "46.5px" }}
                        fontSize="large"
                      />
                    </div>
                  ) : (
                    <></>
                  )}
                </div>

                <div className="playlist_edit_info_container">
                  <TextField
                    label="Name"
                    variant="filled"
                    required
                    sx={{
                      color: "white",
                      backgroundColor: "gray",
                      marginLeft: "10px",
                      marginBottom: "10px",
                      input: { color: "white" },
                      ".MuiFormLabel-root": {
                        color: "white",
                      },
                    }}
                    inputProps={{ maxLength: 100 }}
                    value={name}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      if (event.target.value === "")
                        setError("Playlist name is required");
                      else setError("");
                      setName(event.target.value);
                    }}
                  />
                  <TextField
                    label="Description"
                    multiline
                    variant="filled"
                    sx={{
                      color: "white",
                      backgroundColor: "gray",
                      marginLeft: "10px",
                      input: { color: "white" },
                      ".MuiFormLabel-root": {
                        color: "white",
                      },
                    }}
                    minRows={3}
                    inputProps={{ maxLength: 300, style: { color: "white" } }}
                    value={desc}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      setDesc(event.target.value);
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
