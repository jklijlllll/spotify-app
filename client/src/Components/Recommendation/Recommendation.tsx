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

// TODO: add caching for liked songs and genre options (and all other opi calls)
// TODO: add scrolling and load on type (axios cancel token)
const Recommendation: FunctionComponent<{

}> = () => {
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
    // axios
    //   .get("https://api.spotify.com/v1/recommendations/available-genre-seeds", {
    //     headers: userContext?.headers,
    //   })
    //   .then((response) => {
    //     let results = [];
    //     for (const result of response.data.genres) {
    //       results.push({ label: result, value: result });
    //     }
    //     setGenreOptions(results);
    //   });

    let options = [
      "acoustic",
      "afrobeat",
      "alt-rock",
      "alternative",
      "ambient",
      "anime",
      "black-metal",
      "bluegrass",
      "blues",
      "bossanova",
      "brazil",
      "breakbeat",
      "british",
      "cantopop",
      "chicago-house",
      "children",
      "chill",
      "classical",
      "club",
      "comedy",
      "country",
      "dance",
      "dancehall",
      "death-metal",
      "deep-house",
      "detroit-techno",
      "disco",
      "disney",
      "drum-and-bass",
      "dub",
      "dubstep",
      "edm",
      "electro",
      "electronic",
      "emo",
      "folk",
      "forro",
      "french",
      "funk",
      "garage",
      "german",
      "gospel",
      "goth",
      "grindcore",
      "groove",
      "grunge",
      "guitar",
      "happy",
      "hard-rock",
      "hardcore",
      "hardstyle",
      "heavy-metal",
      "hip-hop",
      "holidays",
      "honky-tonk",
      "house",
      "idm",
      "indian",
      "indie",
      "indie-pop",
      "industrial",
      "iranian",
      "j-dance",
      "j-idol",
      "j-pop",
      "j-rock",
      "jazz",
      "k-pop",
      "kids",
      "latin",
      "latino",
      "malay",
      "mandopop",
      "metal",
      "metal-misc",
      "metalcore",
      "minimal-techno",
      "movies",
      "mpb",
      "new-age",
      "new-release",
      "opera",
      "pagode",
      "party",
      "philippines-opm",
      "piano",
      "pop",
      "pop-film",
      "post-dubstep",
      "power-pop",
      "progressive-house",
      "psych-rock",
      "punk",
      "punk-rock",
      "r-n-b",
      "rainy-day",
      "reggae",
      "reggaeton",
      "road-trip",
      "rock",
      "rock-n-roll",
      "rockabilly",
      "romance",
      "sad",
      "salsa",
      "samba",
      "sertanejo",
      "show-tunes",
      "singer-songwriter",
      "ska",
      "sleep",
      "songwriter",
      "soul",
      "soundtracks",
      "spanish",
      "study",
      "summer",
      "swedish",
      "synth-pop",
      "tango",
      "techno",
      "trance",
      "trip-hop",
      "turkish",
      "work-out",
      "world-music",
    ];

    let result = [];

    for (const opt of options) {
      result.push({ label: opt, value: opt });
    }
    setGenreOptions(result);
  }, []);

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
        {recInfo.map((track) => (
          <div
            className="track_container"
            onClick={() => {
              if (userContext?.is_active) {
                axios
                  .put(
                    "https://api.spotify.com/v1/me/player/play",
                    { uris: [track.uri], position_ms: 0 },
                    {
                      headers: userContext?.headers,
                      params: { device_id: userContext.deviceId, play: false },
                    }
                  )
                  .then((response) => {})
                  .catch((error) => {
                    console.log(error);
                  });
              }
            }}
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
    </>
  );
};

export default Recommendation;
