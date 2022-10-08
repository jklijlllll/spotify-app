import React, { FunctionComponent } from "react";
import { TextField } from "@mui/material";

const PlaylistName: FunctionComponent<{
  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  setError: React.Dispatch<React.SetStateAction<string>>;
  style: any;
}> = ({ name, setName, setError, style }) => {
  return (
    <TextField
      label="Name"
      variant="filled"
      required
      sx={style}
      inputProps={{ maxLength: 100 }}
      value={name}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.value === "") setError("Playlist name is required");
        else setError("");
        setName(event.target.value);
      }}
    />
  );
};

export default PlaylistName;
