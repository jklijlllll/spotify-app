import { InputAdornment, TextField } from "@mui/material";
import { FunctionComponent, useContext, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import { UserContext } from "../../Pages/Home/Home";

const SearchBar: FunctionComponent<{}> = () => {
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const userContext = useContext(UserContext);

  const handleOnChange = (event: any) => {
    setSearchInput(event.target.value);

    if (event.target.value === undefined || event.target.value === "") {
      setSearchResults([]);
    }
  };

  const sendSearch = () => {
    console.log(userContext?.token);
    axios
      .get("https://api.spotify.com/v1/search", {
        params: { q: searchInput, type: "track", limit: 5 },
        headers: userContext?.headers,
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
          <div
            key={key}
            className="search_result"
            onClick={() => {
              if (userContext?.is_active) {
                axios
                  .put(
                    "https://api.spotify.com/v1/me/player/play",
                    { uris: [result.uri], position_ms: 0 },
                    {
                      headers: userContext?.headers,
                      params: { device_id: userContext.deviceId },
                    }
                  )
                  .then((response) => {})
                  .catch((error) => {
                    console.log(error);
                  });
              }
            }}
          >
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
