import { Button, Slider, ToggleButton } from "@mui/material";
import axios from "axios";
import React, {
  FunctionComponent,
  useContext,
  useEffect,
  useState,
} from "react";
import Select from "react-select";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import { UserContext } from "../../Pages/Home/Home";
import { startPlayback } from "../../Functions/startPlayback";
import PlaylistAdd from "../PlaylistAdd";

// TODO: add loading indicator for recommended tracks
// TODO: improve UI
// TODO: add scrolling and load on type (axios cancel token)
// TODO: add recommendations to playlist
const Recommendation: FunctionComponent<{ update: number }> = ({ update }) => {
  const userContext = useContext(UserContext);
  const [artistOptions, setArtistOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [artistInput, setArtistInput] = useState<string>("");

  const [genreOptions, setGenreOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [genreInput, setGenreInput] = useState<string>("");

  const [trackOptions, setTrackOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [trackInput, setTrackInput] = useState<string>("");

  const [numSeeds, setNumSeeds] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const maxSeeds = 5;

  const seeds: {
    [key: string]: {
      value: { label: string; value: string }[];
    };
  } = {
    artist: {
      value: [],
    },
    genre: {
      value: [],
    },
    track: {
      value: [],
    },
  };

  const [curSeeds, setCurSeeds] = useState(seeds);
  const values: {
    [key: string]: {
      value: number[];
      enabled: boolean;
      min: number;
      max: number;
      step: number;
    };
  } = {
    Acousticness: {
      value: [0, 1],
      enabled: false,
      min: 0,
      max: 1,
      step: 0.01,
    },
    Danceability: {
      value: [0, 1],
      enabled: false,
      min: 0,
      max: 1,
      step: 0.01,
    },
    Energy: {
      value: [0, 1],
      enabled: false,
      min: 0,
      max: 1,
      step: 0.01,
    },
    Instrumentalness: {
      value: [0, 1],
      enabled: false,
      min: 0,
      max: 1,
      step: 0.01,
    },
    Liveness: {
      value: [0, 1],
      enabled: false,
      min: 0,
      max: 1,
      step: 0.01,
    },
    Loudness: {
      value: [-60, 0],
      enabled: false,
      min: -60,
      max: 0,
      step: 1,
    },
    Popularity: {
      value: [0, 100],
      enabled: false,
      min: 0,
      max: 100,
      step: 1,
    },
    Speechiness: {
      value: [0, 1],
      enabled: false,
      min: 0,
      max: 1,
      step: 0.01,
    },
    Tempo: {
      value: [0, 200],
      enabled: false,
      min: 0,
      max: 200,
      step: 1,
    },
    Valence: {
      value: [0, 1],
      enabled: false,
      min: 0,
      max: 1,
      step: 0.01,
    },
  };

  const [curValues, setCurValues] = useState(values);
  const [recInfo, setRecInfo] = useState<any[]>([]);

  const [addOpen, setAddOpen] = useState<boolean>(false);

  useEffect(() => {
    setArtistOptions([]);
    setArtistInput("");
    setGenreInput("");
    setTrackOptions([]);
    setTrackInput("");
    setNumSeeds(0);
    setErrorMsg("");
    setCurSeeds(seeds);
    setCurValues(values);
    setRecInfo([]);
  }, [update]);

  const handleSeedChange = (
    type: string,
    value: { label: string; value: string }[]
  ) => {
    const newSeeds = { ...curSeeds };
    newSeeds[type].value = value;
    setCurSeeds(newSeeds);
  };

  const handleChange = (attr: string, value: number | number[]) => {
    const newValues = { ...curValues };
    if (typeof value === "number") {
      newValues[attr].value[0] = value;
      newValues[attr].value[1] = value;
    } else {
      newValues[attr].value = value;
    }

    setCurValues(newValues);
  };

  const toggleValue = (attr: string) => {
    const newValues = { ...curValues };
    newValues[attr].enabled = !newValues[attr].enabled;
    setCurValues(newValues);
  };

  const sendSearch = (input: string) => {
    if (numSeeds >= maxSeeds) {
      return;
    }

    switch (input) {
      case "artist":
        if (artistInput !== "")
          axios
            .get("https://api.spotify.com/v1/search", {
              params: { q: artistInput, type: "artist", limit: 5 },
              headers: userContext?.headers,
            })
            .then((response) => {
              let searchResults = [];
              for (const result of response.data.artists.items) {
                searchResults.push({ label: result.name, value: result.id });
              }

              setArtistOptions(searchResults);
            })
            .catch((error) => console.log(error));
        break;

      case "track":
        if (trackInput !== "")
          axios
            .get("https://api.spotify.com/v1/search", {
              params: { q: trackInput, type: "track", limit: 5 },
              headers: userContext?.headers,
            })
            .then((response) => {
              console.log(response.data);
              let searchResults = [];
              for (const result of response.data.tracks.items) {
                let artist_names = " ";
                if (result.artists.length > 0) {
                  artist_names = result.artists
                    .map((artist: any) => artist.name)
                    .join(", ");
                }
                searchResults.push({
                  label: result.name + " - " + artist_names,
                  value: result.id,
                });
              }

              setTrackOptions(searchResults);
            })
            .catch((error) => console.log(error));
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    let newNumSeeds = 0;

    for (const seed of Object.values(curSeeds)) {
      newNumSeeds += seed.value.length;
    }
    setNumSeeds(newNumSeeds);
  }, [curSeeds]);

  useEffect(() => {
    if (sessionStorage.getItem("genre_seeds") === null) {
      axios
        .get(
          "https://api.spotify.com/v1/recommendations/available-genre-seeds",
          {
            headers: userContext?.headers,
          }
        )
        .then((response) => {
          let results = [];
          console.log(response);
          for (const result of response.data.genres) {
            results.push({ label: result, value: result });
          }
          setGenreOptions(results);
          sessionStorage.setItem("genre_seeds", JSON.stringify(results));
        });
    } else {
      let result = [];

      for (const opt of JSON.parse(sessionStorage.getItem("genre_seeds")!)) {
        result.push(opt);
      }
      setGenreOptions(result);
    }
  }, [update]);

  const selectStyle = {
    container: () => ({
      width: "30%",
    }),
    control: () => ({
      fontSize: "24px",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      display: "flex",
      border: "1px solid black",
      borderRadius: "5px",
    }),
    menu: () => ({
      fontSize: "20px",
    }),
    menuList: (provided: any, state: any) => ({
      ...provided,
      maxHeight: "200px",
      border: "1px solid black",
    }),
    option: (provided: any, state: any) => ({
      ...provided,
    }),
  };

  const handleSubmit = () => {
    if (numSeeds === 0) {
      // TODO: add error display, <= 5 seeds
      return;
    }

    // TODO: change seed param handling

    let seed_artists = "";

    if (curSeeds["artist"].value.length < 0) {
      return;
    } else {
      seed_artists = `seed_artists=${curSeeds["artist"].value
        .map((entry: { label: string; value: string }) => entry.value)
        .join(", ")}`;
    }

    let seed_genres = "";

    if (curSeeds["genre"].value.length < 0) {
      return;
    } else {
      seed_genres = `seed_genres=${curSeeds["genre"].value
        .map((entry: { label: string; value: string }) => entry.value)
        .join(", ")}`;
    }

    let seed_tracks = "";

    if (curSeeds["track"].value.length < 0) {
      return;
    } else {
      seed_tracks = `seed_tracks=${curSeeds["track"].value
        .map((entry: { label: string; value: string }) => entry.value)
        .join(", ")}`;
    }

    let min: string[] = [];
    let max: string[] = [];
    let target: string[] = [];
    Object.keys(curValues).forEach((attr) => {
      if (curValues[attr].enabled) {
        if (curValues[attr].value[0] === curValues[attr].value[1]) {
          target.push(
            `target_${attr.toLowerCase()}=${curValues[attr].value[0]}`
          );
        } else {
          min.push(`min_${attr.toLowerCase()}=${curValues[attr].value[0]}`);
          max.push(`max_${attr.toLowerCase()}=${curValues[attr].value[1]}`);
        }
      }
    });

    const minString = min.join("&");
    const maxString = max.join("&");
    const targetString = target.join("&");

    axios
      .get(
        `https://api.spotify.com/v1/recommendations?${seed_artists}&${seed_genres}&${seed_tracks}&${minString}&${maxString}&${targetString}`,
        {
          headers: userContext?.headers,
        }
      )
      .then((response) => setRecInfo(response.data.tracks));
  };

  return (
    <>
      <h1 className="recommendation_title">Recommendations</h1>
      {errorMsg === "" ? (
        <></>
      ) : (
        <h4 className="recommendation_error_text">{errorMsg}</h4>
      )}
      <div className="seed_select_container">
        <Select
          placeholder={"Select Artists"}
          isMulti
          styles={selectStyle}
          value={curSeeds["artist"].value}
          onChange={(newValue: any) => {
            if (
              numSeeds - curSeeds["artist"].value.length + newValue.length <=
              maxSeeds
            ) {
              setErrorMsg("");
              handleSeedChange("artist", newValue);
            } else {
              setErrorMsg(
                "Only five artists, genres and tracks combined may be selected"
              );
            }
          }}
          options={artistOptions}
          inputValue={artistInput}
          onInputChange={(newValue) => {
            setArtistInput(newValue);
          }}
          onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
            if (event.key === "Enter") {
              sendSearch("artist");
              event.preventDefault();
            }
          }}
        />
        <Select
          placeholder={"Select Genres"}
          isMulti
          styles={selectStyle}
          value={curSeeds["genre"].value}
          onChange={(newValue: any) => {
            if (
              numSeeds - curSeeds["genre"].value.length + newValue.length <=
              maxSeeds
            ) {
              setErrorMsg("");
              handleSeedChange("genre", newValue);
            } else {
              setErrorMsg(
                "Only five artists, genres and tracks combined may be selected"
              );
            }
          }}
          options={genreOptions}
          inputValue={genreInput}
          onInputChange={(newValue) => {
            setGenreInput(newValue);
          }}
          onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
            if (event.key === "Enter") {
              sendSearch("genre");
              event.preventDefault();
            }
          }}
        />
        <Select
          placeholder={"Select Tracks"}
          isMulti
          styles={selectStyle}
          value={curSeeds["track"].value}
          onChange={(newValue: any) => {
            if (
              numSeeds - curSeeds["track"].value.length + newValue.length <=
              maxSeeds
            ) {
              setErrorMsg("");
              handleSeedChange("track", newValue);
            } else {
              setErrorMsg(
                "Only five artists, genres and tracks combined may be selected"
              );
            }
          }}
          options={trackOptions}
          inputValue={trackInput}
          onInputChange={(newValue) => {
            setTrackInput(newValue);
          }}
          onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
            if (event.key === "Enter") {
              sendSearch("track");
              event.preventDefault();
            }
          }}
        />
      </div>
      <div className="top_slider_container">
        {Object.keys(values)
          .slice(0, Math.ceil(Object.keys(values).length) / 2)
          .map((attribute, key) => (
            <div className="slider_container" key={key}>
              <h4 className="slider_title">{attribute}</h4>
              <Slider
                sx={{
                  '& input[type="range"]': {
                    WebkitAppearance: "slider-vertical",
                  },
                  height: "150px",
                }}
                orientation="vertical"
                min={curValues[attribute].min}
                max={curValues[attribute].max}
                step={curValues[attribute].step}
                value={curValues[attribute].value}
                onChange={(event, newValue) => {
                  handleChange(attribute, newValue);
                }}
                valueLabelDisplay="auto"
                disabled={!curValues[attribute].enabled}
              />
              <ToggleButton
                value="check"
                selected={curValues[attribute].enabled}
                onChange={() => toggleValue(attribute)}
                sx={{
                  height: "30px",
                  width: "30px",
                }}
              >
                {curValues[attribute].enabled ? <CheckIcon /> : <ClearIcon />}
              </ToggleButton>
            </div>
          ))}
      </div>

      <div className="bottom_slider_container">
        {Object.keys(values)
          .slice(
            Math.ceil(Object.keys(values).length) / 2,
            Object.keys(values).length
          )
          .map((attribute, key) => (
            <div className="slider_container" key={key}>
              <h4 className="slider_title">{attribute}</h4>
              <Slider
                sx={{
                  '& input[type="range"]': {
                    WebkitAppearance: "slider-vertical",
                  },
                  height: "150px",
                }}
                orientation="vertical"
                min={curValues[attribute].min}
                max={curValues[attribute].max}
                step={curValues[attribute].step}
                value={curValues[attribute].value}
                onChange={(event, newValue) =>
                  handleChange(attribute, newValue)
                }
                valueLabelDisplay="auto"
                disabled={!curValues[attribute].enabled}
              />
              <ToggleButton
                value="check"
                selected={curValues[attribute].enabled}
                onChange={() => toggleValue(attribute)}
                sx={{
                  height: "30px",
                  width: "30px",
                }}
              >
                {curValues[attribute].enabled ? <CheckIcon /> : <ClearIcon />}
              </ToggleButton>
            </div>
          ))}
      </div>

      <Button
        sx={{ marginBottom: recInfo.length === 0 ? "0px" : "20px" }}
        variant="contained"
        onClick={() => handleSubmit()}
      >
        Get Recommendations
      </Button>

      <div className="recommended_tracks_container">
        {recInfo.map((track, key) => (
          <div
            className="track_container"
            onClick={() => {
              if (userContext?.is_active) {
                startPlayback({
                  device_id: userContext.deviceId,
                  position_ms: 0,
                  headers: userContext.headers,
                  uris: [track.uri],
                });
              }
            }}
            key={key}
          >
            <img src={track.album.images[2].url} alt="song cover" />
            <div className="track_info_container">
              <div className="track_info_title">{track.name} </div>
              <div className="track_info_name">
                {track.artists.map((artist: any) => artist.name).join(", ")}
              </div>
            </div>
          </div>
        ))}
      </div>

      {recInfo.length === 0 ? (
        <></>
      ) : (
        <>
          <PlaylistAdd open={addOpen} setOpen={setAddOpen} tracks={recInfo} />
          <Button
            sx={{ marginTop: "10px", marginBottom: "100px" }}
            variant="contained"
            onClick={() => setAddOpen(true)}
          >
            Create Playlist
          </Button>
        </>
      )}
    </>
  );
};

export default Recommendation;
