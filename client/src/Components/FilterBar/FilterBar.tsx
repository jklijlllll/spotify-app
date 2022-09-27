import { InputAdornment, TextField } from "@mui/material";
import { FunctionComponent, useEffect, useState } from "react";
import FilterListIcon from "@mui/icons-material/FilterList";

// TODO: test filtering and loading
const FilterBar: FunctionComponent<{
  playlists: any;
  setFilterPlaylists: any;
}> = ({ playlists, setFilterPlaylists }) => {
  const [query, setQuery] = useState<string>("");
  useEffect(() => {
    if (query === "") setFilterPlaylists(playlists);
    else
      setFilterPlaylists(
        playlists.filter((playlist: { name: string | string[] }) =>
          playlist.name.includes(query)
        )
      );
  }, [query, playlists]);
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
        onChange={(event: any) => {
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
