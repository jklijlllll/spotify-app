import { InputAdornment, TextField } from "@mui/material";
import { FunctionComponent, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";

const SearchBar: FunctionComponent<{ token: String }> = ({ token }) => {
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleOnChange = (event: any) => {
    setSearchInput(event.target.value);

    if (event.target.value === undefined || event.target.value === "") {
      setSearchResults([]);
    }
  };

  const sendSearch = () => {
    axios
      .get("https://api.spotify.com/v1/search", {
        params: { q: searchInput, type: "track", limit: 5 },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(function (response) {
        console.log(response.data.tracks.items);
        setSearchResults(response.data.tracks.items);
      })
      .catch(function (error) {
        console.log(error);
      });
  };
  return (
    <>
      <TextField
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
        onKeyDown={(event: any) => {
          if (event.key === "Enter") sendSearch();
        }}
      />

      <div className="search_results_container">
        {searchResults.map((result, key) => (
          <div key={key} className="search_result">
            <img
              className="search_result_image"
              src={result.album.images[2].url}
            />
            <h4 className="search_result_text">{result.name}</h4>
          </div>
        ))}
      </div>
    </>
  );
};

export default SearchBar;
