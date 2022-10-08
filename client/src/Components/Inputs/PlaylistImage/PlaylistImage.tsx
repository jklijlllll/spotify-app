import { IconButton, Menu, MenuItem } from "@mui/material";
import { FunctionComponent, useState, useRef } from "react";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import EditIcon from "@mui/icons-material/Edit";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import { PlaylistInterface } from "../../../Types/SpotifyApi";

const PlaylistImage: FunctionComponent<{
  setImageURL: React.Dispatch<React.SetStateAction<string>>;
  setImage64: React.Dispatch<React.SetStateAction<string>>;
  curPlaylist: PlaylistInterface | null;
  imageURL: string;
  removeImage: () => void;
  width: number;
  height: number;
}> = ({
  setImageURL,
  setImage64,
  curPlaylist,
  imageURL,
  removeImage,
  width,
  height,
}) => {
  const fileInput = useRef<HTMLInputElement>(null);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
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
        {imageURL !== "" || (curPlaylist !== null && curPlaylist.images[0]) ? (
          <img
            src={imageURL}
            alt="playlist cover"
            style={{
              opacity: isHovered ? 0.2 : 1.0,
              width: width + "px",
              height: height + "px",
            }}
          />
        ) : (
          <div
            className="playlist_edit_empty_cover"
            style={{
              opacity: isHovered ? 0.2 : 1.0,
              width: width + "px",
              height: height + "px",
            }}
          >
            <MusicNoteIcon
              sx={{
                color: "gray",
                width: width / 4 + "px",
                height: height / 4 + "px",
              }}
            />
          </div>
        )}
      </label>
      {isHovered ? (
        <div
          className="playlist_edit_cover_overlay"
          style={{
            width: width + "px",
            height: height + "px",
            marginTop: -height - 10 + "px",
            marginBottom: "10px",
          }}
        >
          <IconButton
            sx={{
              color: "white",
              marginLeft: width - 48 + "px",
              bottom: "8px",
              marginBottom: -height / 8 + "px",
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
            sx={{ marginTop: height / -8 + "px" }}
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
            sx={{
              marginLeft: width / 2 - 8.75 + "px",
              marginTop: height > 128 ? height / 4 + "px" : "0px",
            }}
            fontSize="large"
          />
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

export default PlaylistImage;
