import { InputAdornment, TextField } from "@mui/material";
import { FunctionComponent, useEffect, useState } from "react";
import FilterListIcon from "@mui/icons-material/FilterList";
import { PlaylistInterface } from "../../Types/SpotifyApi";
import "./FilterBar.css";

const FilterBar: FunctionComponent<{
  playlists: PlaylistInterface[];
  setFilterPlaylists: React.Dispatch<React.SetStateAction<PlaylistInterface[]>>;
}> = ({ playlists, setFilterPlaylists }) => {
  const [query, setQuery] = useState<string>("");
  useEffect(() => {
    if (query === "") setFilterPlaylists(playlists);
    else
      setFilterPlaylists(
        playlists.filter((playlist: { name: string }) =>
          playlist.name.toLowerCase().includes(query.toLowerCase())
        )
      );
  }, [query, playlists, setFilterPlaylists]);
  return (
    <div className="playlist_filter_bar">
      <TextField
        sx={{
          width: "30%",
          height: "60px",
        }}
        label="Filter"
        variant="filled"
        size="medium"
        value={query}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setQuery(event.target.value);
        }}
        InputProps={{
          disableUnderline: true,
          startAdornment: (
            <InputAdornment position="start">
              <FilterListIcon />
            </InputAdornment>
          ),
          sx: {
            backgroundColor: "white",
            "&:hover": {
              backgroundColor: "white",
            },
            "&.Mui-focused": {
              backgroundColor: "white",
            },
          },
        }}
      />
    </div>
  );
};

export default FilterBar;
