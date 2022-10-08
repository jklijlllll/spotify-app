import { InputAdornment, TextField } from "@mui/material";
import { FunctionComponent } from "react";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import { TrackInterface } from "../../Types/SpotifyApi";

// TODO: refactor for both playlist and recommendation
const SearchBar: FunctionComponent<{
  searchInput: string;
  setSearchInput: React.Dispatch<React.SetStateAction<string>>;
  setSearchResults: React.Dispatch<React.SetStateAction<TrackInterface[]>>;
  headers: any;
  width: string;
  height: string;
  limit: number;
}> = ({
  searchInput,
  setSearchInput,
  setSearchResults,
  headers,
  width,
  height,
  limit,
}) => {
  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);

    if (event.target.value === undefined || event.target.value === "") {
      setSearchResults([]);
    }
  };

  const sendSearch = () => {
    axios
      .get("https://api.spotify.com/v1/search", {
        params: { q: searchInput, type: "track", limit: limit },
        headers: headers,
      })
      .then(function (response) {
        setSearchResults(response.data.tracks.items);
      })
      .catch(function (error) {
        console.log(error);
      });
  };
  return (
    <>
      <TextField
        sx={{
          width: width,
          height: height,
          ".MuiFilledInput-root": { backgroundColor: "white" },
        }}
        label="Search"
        variant="filled"
        color="primary"
        size="medium"
        value={searchInput}
        onChange={handleOnChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
          if (event.key === "Enter") sendSearch();
        }}
      />
    </>
  );
};

export default SearchBar;
