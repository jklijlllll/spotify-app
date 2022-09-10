import { FunctionComponent } from "react";
import { useNavigate } from "react-router-dom";

const Login: FunctionComponent<{}> = () => {
  let navigate = useNavigate();
  return (
    <div className="login_container">
      <h1 className="app_title">App Title</h1>
      <h4 className="app_description">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec lacinia
        scelerisque rhoncus.
      </h4>
      <button
        className="spotify_button"
        onClick={() => navigate("/auth/login")}
      >
        <img
          className="spotify_icon"
          src={require("../../Media/Spotify_Icon_RGB_White.png")}
        />
        <h4 className="login_text">Login with Spotify</h4>
      </button>
    </div>
  );
};

export default Login;
