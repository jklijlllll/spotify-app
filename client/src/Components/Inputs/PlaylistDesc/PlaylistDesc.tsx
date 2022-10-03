import { FunctionComponent } from "react";
import { TextField } from "@mui/material";

const PlaylistDesc: FunctionComponent<{
  desc: string;
  setDesc: any;
  styles: any;
}> = ({ desc, setDesc, styles }) => {
  return (
    <TextField
      label="Description"
      multiline
      variant="filled"
      sx={styles}
      minRows={3}
      inputProps={{ maxLength: 300, style: { color: "white" } }}
      value={desc}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
        setDesc(event.target.value);
      }}
    />
  );
};

export default PlaylistDesc;
