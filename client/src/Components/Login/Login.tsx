import { CircularProgress } from "@mui/material";
import { FunctionComponent } from "react";
import "./Login.css";

const AUTH_URL =
  "https://accounts.spotify.com/authorize?client_id=" +
  "fc214407bb3d431e9db92229f3e7f240" +
  "&response_type=code&redirect_uri=http://localhost:3000&scope=streaming%20user-read-email%20user-read-private%20user-library-read%20user-library-modify%20user-read-playback-state%20user-modify-playback-state%20playlist-read-private%20playlist-read-private%20playlist-modify-private%20playlist-modify-public%20ugc-image-upload";

const Login: FunctionComponent<{ loading: boolean }> = ({ loading }) => {
  if (!loading)
    return (
      <div className="login_container">
        <h1 className="app_title">App Title</h1>
        <h4 className="app_description">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec lacinia
          scelerisque rhoncus.
        </h4>
        <a className="spotify_button" href={AUTH_URL}>
          <img
            className="spotify_icon"
            src={require("../../Media/Spotify_Icon_RGB_White.png")}
            alt="spotify icon"
          />
          <h4 className="login_text">Login with Spotify</h4>
        </a>
      </div>
    );
  else
    return (
      <>
        <CircularProgress style={{ height: "300px", width: "300px" }} />
      </>
    );
};

export default Login;
