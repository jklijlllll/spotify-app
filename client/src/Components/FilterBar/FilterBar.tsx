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
          marginBottom: "10px",
          ".MuiFilledInput-root": { backgroundColor: "white" },
        }}
        label="Filter"
        variant="filled"
        size="medium"
        value={query}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setQuery(event.target.value);
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <FilterListIcon />
            </InputAdornment>
          ),
        }}
      />
    </div>
  );
};

export default FilterBar;
