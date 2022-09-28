import { InputAdornment, TextField } from "@mui/material";
import { FunctionComponent, useContext, useState, useEffect } from "react";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import { UserContext } from "../../Pages/Home/Home";
import { startPlayback } from "../../Functions/startPlayback";

const SearchBar: FunctionComponent<{ update: number }> = ({ update }) => {
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    setSearchInput("");
    setSearchResults([]);
  }, [update]);

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
        sx={{
          width: "30%",
          height: "60px",
          ".MuiFilledInput-root": {
            backgroundColor: "white",
            zIndex: 2,
          },
          ".MuiFilledInput-root:hover": {
            backgroundColor: "white",
            zIndex: 2,
          },
          ".MuiFilledInput-root:active": {
            backgroundColor: "white",
            zIndex: 2,
          },
          ".MuiFormLabel-root": {
            zIndex: 3,
          },
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
                startPlayback({
                  device_id: userContext.deviceId,
                  position_ms: 0,
                  headers: userContext.headers,
                  uris: [result.uri],
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
