import {
  Button,
  CircularProgress,
  Slider,
  Chip,
  Tooltip as ToolTip,
} from "@mui/material";
import axios from "axios";
import React, {
  FunctionComponent,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import Select from "react-select";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import { UserContext } from "../../Pages/Home/Home";
import { startPlayback } from "../../Functions/startPlayback";
import PlaylistAdd from "../PlaylistAdd";
import useHistory from "../../Hooks/useHistory";
import SearchBar from "../SearchBar";
import { ArtistInterface, TrackInterface } from "../../Types/SpotifyApi";
import "./Recommendation.css";
import TrackAttributes from "../TrackAttributes";

// TODO: improve UI
// TODO: add scrolling and load on type (axios cancel token)
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

  type seedType = {
    [key: string]: {
      value: { label: string; value: string }[];
    };
  };

  const seeds: seedType = useMemo(() => {
    return {
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
  }, []);

  const [curSeeds, setCurSeeds] = useState(seeds);

  type valueType = {
    [key: string]: {
      value: number[];
      enabled: boolean;
      min: number;
      max: number;
      step: number;
    };
  };

  const values: valueType = useMemo(() => {
    return {
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
  }, []);

  const chartValues = Object.keys(values).filter((attr) => {
    return attr !== "Popularity" && attr !== "Tempo" && attr !== "Loudness";
  });

  const [curValues, setCurValues] = useState(values);

  const sliderHeight = "200px";

  const sortedValues = Object.keys(values).sort(function (a, b) {
    const aVal = curValues[a];
    const bVal = curValues[b];

    if (aVal.enabled === true && bVal.enabled === false) return -1;
    if (aVal.enabled === false && bVal.enabled === true) return 1;

    if (a > b) return 1;
    else return -1;
  });

  const [recInfo, setRecInfo] = useState<TrackInterface[]>([]);

  useHistory({ recommended_tracks: recInfo, headers: userContext?.headers });

  const [historyTracks, setHistoryTracks] = useState<TrackInterface[]>([]);

  const updateTracks = () => {
    if (localStorage.getItem("history")) {
      setHistoryTracks(JSON.parse(localStorage.getItem("history")!));
    }
  };

  useEffect(() => {
    updateTracks();

    window.addEventListener("changed", updateTracks);

    return () => {
      window.removeEventListener("changed", updateTracks);
    };
    // eslint-disable-next-line
  }, []);

  const [closestTrack, setClosestTrack] = useState<TrackInterface | null>(null);

  const getClosestTrack = (attribute: string, value: number) => {
    let track;
    if (attribute === "popularity") {
      track = historyTracks.reduce(function (prev, curr) {
        return Math.abs(curr.popularity - value) <
          Math.abs(prev.popularity - value)
          ? curr
          : prev;
      });
    } else {
      track = historyTracks.reduce(function (prev, curr) {
        return Math.abs((curr.audio_features?.[attribute] as number) - value) <
          Math.abs((prev.audio_features?.[attribute] as number) - value)
          ? curr
          : prev;
      });
    }

    setClosestTrack(track);
  };
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
  }, [update, seeds, values]);

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
                    .map((artist: ArtistInterface) => artist.name)
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

  const [searchResultsOpen, setSearchResultsOpen] = useState<boolean>(true);
  const handleScroll = () => {
    const position = window.scrollY;
    if (position === 0) {
      setSearchResultsOpen(true);
    } else {
      setSearchResultsOpen(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

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
  }, [update, userContext?.headers]);

  // TODO: add select loading
  const selectStyle = {
    container: () => ({
      width: "100%",
    }),
    control: () => ({
      fontSize: "24px",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      display: "flex",
      border: "1px solid black",
      backgroundColor: "white",
      borderRadius: "5px",
    }),
    menu: () => ({
      fontSize: "20px",
      color: "black",
    }),
    menuList: (provided: any) => ({
      ...provided,
      maxHeight: "200px",
      border: "1px solid black",
      backgroundColor: "white",
    }),
  };

  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = () => {
    if (numSeeds === 0) {
      setErrorMsg("Select at least one artist, genre, or track");
      return;
    }

    let seed_artists = `seed_artists=${curSeeds["artist"].value
      .map((entry: { label: string; value: string }) => entry.value)
      .join(", ")}`;

    let seed_genres = `seed_genres=${curSeeds["genre"].value
      .map((entry: { label: string; value: string }) => entry.value)
      .join(", ")}`;

    let seed_tracks = `seed_tracks=${curSeeds["track"].value
      .map((entry: { label: string; value: string }) => entry.value)
      .join(", ")}`;

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

    setLoading(true);
    axios
      .get(
        `https://api.spotify.com/v1/recommendations?${seed_artists}&${seed_genres}&${seed_tracks}&${minString}&${maxString}&${targetString}`,
        {
          headers: userContext?.headers,
        }
      )
      .then((response) => {
        setRecInfo(response.data.tracks);
        setLoading(false);
      })
      .catch((error) => setLoading(false));
  };

  const [searchInput, setSearchInput] = useState<string>("");
  const [searchResults, setSearchResults] = useState<TrackInterface[]>([]);

  const searchResultsHeight = "60px";
  const searchResultsWidth = "600px";

  return (
    <>
      <div
        className="search_container"
        onClick={() => setSearchResultsOpen(true)}
      >
        <SearchBar
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          setSearchResults={setSearchResults}
          headers={userContext?.headers}
          height={searchResultsHeight}
          width={searchResultsWidth}
          limit={5}
        />
      </div>
      <div
        className="search_results_container"
        style={{ width: searchResultsWidth }}
      >
        {searchResultsOpen ? (
          searchResults.map((result, key) => (
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
                alt="track cover"
              />
              <div className="search_result_info">
                <h4 className="search_result_name">{result.name}</h4>
                <h4 className="search_result_artists">
                  {result.artists
                    .map((artist: ArtistInterface) => artist.name)
                    .join(", ")}
                </h4>
              </div>
            </div>
          ))
        ) : (
          <></>
        )}
      </div>
      <div
        className="recommendation_container"
        onClick={() => setSearchResultsOpen(false)}
      >
        <h1 className="recommendation_title">Recommendations</h1>
        {errorMsg === "" ? (
          <></>
        ) : (
          <h4 className="recommendation_error_text">{errorMsg}</h4>
        )}
        <div className="recommendation_select">
          <div className="seed_select_container">
            <Select
              placeholder={"Select Artists"}
              isMulti
              menuPosition="fixed"
              styles={selectStyle}
              value={curSeeds["artist"].value}
              onChange={(newValue: any) => {
                if (
                  numSeeds -
                    curSeeds["artist"].value.length +
                    newValue.length <=
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
              menuPosition="fixed"
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
              menuPosition="fixed"
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

          <div className="slider_select_container">
            <div className="slider_container_flex">
              <div className="slider_flex_top">
                {sortedValues
                  .filter((value) => curValues[value].enabled)
                  .slice(0, Math.ceil(Object.keys(values).length) / 2)
                  .map((attribute, key) => (
                    <div className="slider_container" key={key}>
                      <h4 className="slider_title">{attribute}</h4>

                      <div className="slider_border">
                        <Slider
                          disableSwap
                          sx={{
                            '& input[type="range"]': {
                              WebkitAppearance: "slider-vertical",
                            },
                            color: "white",
                            height: sliderHeight,
                            ".MuiSlider-valueLabel": {
                              left: "calc(-50% - 4px)",
                              backgroundColor: "transparent",
                            },
                          }}
                          orientation="vertical"
                          min={curValues[attribute].min}
                          max={curValues[attribute].max}
                          step={curValues[attribute].step}
                          value={curValues[attribute].value}
                          onChange={(event, newValue, activeThumb) => {
                            handleChange(attribute, newValue);
                            getClosestTrack(
                              attribute.toLowerCase(),
                              typeof newValue === "number"
                                ? newValue
                                : newValue[activeThumb]
                            );
                          }}
                          valueLabelDisplay="auto"
                          valueLabelFormat={(value) =>
                            historyTracks.length === 0 ||
                            closestTrack === null ? (
                              <div>{value}</div>
                            ) : (
                              <div className="track_overlay">
                                <div className="track_overlay_container">
                                  <img
                                    className="track_overlay_image"
                                    alt="track cover"
                                    src={closestTrack.album.images[2].url}
                                  ></img>
                                  <div className="track_overlay_info">
                                    <h4 className="track_overlay_title">
                                      {closestTrack.name}
                                    </h4>
                                    <h4 className="track_overlay_name">
                                      {closestTrack.artists
                                        .map(
                                          (artist: ArtistInterface) =>
                                            artist.name
                                        )
                                        .join(", ")}
                                    </h4>
                                    {attribute !== "Popularity" &&
                                    closestTrack.audio_features ? (
                                      <h4 className="track_overlay_attribute">
                                        {attribute +
                                          ": " +
                                          closestTrack.audio_features[
                                            attribute.toLowerCase()
                                          ]}
                                      </h4>
                                    ) : (
                                      <h4 className="track_overlay_attribute">
                                        {attribute +
                                          ": " +
                                          closestTrack.popularity}
                                      </h4>
                                    )}
                                  </div>
                                </div>
                                <h1 className="track_overlay_value">{value}</h1>
                              </div>
                            )
                          }
                          disabled={!curValues[attribute].enabled}
                        />
                      </div>
                    </div>
                  ))}
              </div>

              <div className="slider_flex_bottom">
                <div style={{ marginLeft: "-5px" }}></div>
                {sortedValues
                  .filter((value) => curValues[value].enabled)
                  .slice(
                    Math.ceil(Object.keys(values).length) / 2,
                    Object.keys(values).length
                  )
                  .map((attribute, key) => (
                    <div className="slider_container" key={key}>
                      <h4 className="slider_title">{attribute}</h4>
                      <div className="slider_border">
                        <Slider
                          disableSwap
                          sx={{
                            '& input[type="range"]': {
                              WebkitAppearance: "slider-vertical",
                            },
                            color: "white",
                            height: sliderHeight,
                            ".MuiSlider-valueLabel": {
                              left: "calc(-50% - 4px)",
                              backgroundColor: "transparent",
                            },
                          }}
                          orientation="vertical"
                          min={curValues[attribute].min}
                          max={curValues[attribute].max}
                          step={curValues[attribute].step}
                          value={curValues[attribute].value}
                          onChange={(event, newValue, activeThumb) => {
                            handleChange(attribute, newValue);
                            getClosestTrack(
                              attribute.toLowerCase(),
                              typeof newValue === "number"
                                ? newValue
                                : newValue[activeThumb]
                            );
                          }}
                          valueLabelDisplay="auto"
                          valueLabelFormat={(value) =>
                            historyTracks.length === 0 ||
                            closestTrack === null ? (
                              <div>{value}</div>
                            ) : (
                              <div className="track_overlay">
                                <div className="track_overlay_container">
                                  <img
                                    className="track_overlay_image"
                                    alt="track cover"
                                    src={closestTrack.album.images[2].url}
                                  ></img>
                                  <div className="track_overlay_info">
                                    <h4 className="track_overlay_title">
                                      {closestTrack.name}
                                    </h4>
                                    <h4 className="track_overlay_name">
                                      {closestTrack.artists
                                        .map(
                                          (artist: ArtistInterface) =>
                                            artist.name
                                        )
                                        .join(", ")}
                                    </h4>
                                    {closestTrack.audio_features ? (
                                      <h4 className="track_overlay_attribute">
                                        {attribute +
                                          ": " +
                                          closestTrack.audio_features[
                                            attribute.toLowerCase()
                                          ]}
                                      </h4>
                                    ) : (
                                      <></>
                                    )}
                                  </div>
                                </div>
                                <h1 className="track_overlay_value">{value}</h1>
                              </div>
                            )
                          }
                          disabled={!curValues[attribute].enabled}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            <div className="attribute_toggle_container">
              {sortedValues.map((attribute, key) => (
                <div key={key}>
                  <Chip
                    sx={{
                      backgroundColor: curValues[attribute].enabled
                        ? "#1db954"
                        : "#595959",
                      "&:hover": {
                        backgroundColor: curValues[attribute].enabled
                          ? "#158a3f"
                          : "#b3b3b3",
                      },
                    }}
                    label={attribute}
                    onClick={() => toggleValue(attribute)}
                    onDelete={() => toggleValue(attribute)}
                    deleteIcon={
                      curValues[attribute].enabled ? (
                        <ClearIcon />
                      ) : (
                        <CheckIcon />
                      )
                    }
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="recommendation_button">
            <Button
              sx={{
                marginBottom: recInfo.length === 0 ? "20px" : "0px",
                width: "250px",
                height: "40px",
                marginTop: "20px",
                backgroundColor: "#1db954",
                "&:hover": {
                  backgroundColor: "#158a3f",
                },
              }}
              variant="contained"
              onClick={() => handleSubmit()}
            >
              Get Recommendations
            </Button>
          </div>
        </div>

        <div
          className="recommended_tracks_container"
          style={{ padding: recInfo.length === 0 && !loading ? "0px" : "10px" }}
        >
          {loading ? (
            <CircularProgress style={{ height: "300px", width: "300px" }} />
          ) : (
            recInfo.map((track, key) => (
              <ToolTip
                componentsProps={{
                  tooltip: {
                    sx: {
                      bgcolor: "transparent",
                      "& .MuiTooltip-arrow": {
                        color: "transparent",
                      },
                    },
                  },
                }}
                placement="top-end"
                title={
                  <TrackAttributes
                    labels={chartValues}
                    data={
                      historyTracks.length !== 0 &&
                      historyTracks.find((t) => t.id === track.id) &&
                      historyTracks.find((t) => t.id === track.id)!
                        .audio_features
                        ? new Map(
                            Object.entries(
                              historyTracks.find((t) => t.id === track.id)!
                                .audio_features!
                            )
                          ).set(
                            "popularity",
                            historyTracks.find((t) => t.id === track.id)!
                              .popularity
                          )
                        : new Map<string, number>()
                    }
                    title={
                      historyTracks.length !== 0 &&
                      historyTracks.find((t) => t.id === track.id)
                        ? historyTracks.find((t) => t.id === track.id)!.name
                        : ""
                    }
                  />
                }
              >
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
                      {track.artists
                        .map((artist: ArtistInterface) => artist.name)
                        .join(", ")}
                    </div>
                  </div>
                </div>
              </ToolTip>
            ))
          )}
        </div>

        {recInfo.length === 0 ? (
          <></>
        ) : (
          <>
            <PlaylistAdd
              open={addOpen}
              setOpen={setAddOpen}
              userId={
                userContext?.userProfile !== null
                  ? userContext!.userProfile.id
                  : ""
              }
              headers={userContext?.headers}
              useHistory={false}
              tracks={recInfo}
            />
            <Button
              sx={{
                marginTop: "10px",
                marginBottom: "100px",
                backgroundColor: "#1db954",
                "&:hover": {
                  backgroundColor: "#158a3f",
                },
              }}
              variant="contained"
              onClick={() => setAddOpen(true)}
            >
              Create Playlist
            </Button>
          </>
        )}
      </div>
    </>
  );
};

export default Recommendation;
