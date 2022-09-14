import { FunctionComponent, useEffect, useState } from "react";
import Login from "../../Components/Login";
import Main from "../../Components/Main";
import WebPlayback from "../../Components/WebPlayback";

const Home: FunctionComponent<{}> = () => {
  const [token, setToken] = useState("");
  const [tokenTimeout, setTokenTimeout] = useState<number>(0);

  useEffect(() => {
    async function getToken() {
      const response = await fetch("/auth/token");
      const json = await response.json();

      setToken(json.access_token);
      setTokenTimeout(json.token_expiry_time);
    }

    getToken();
  }, []);

  useEffect(() => {
    async function refreshToken() {
      const response = await fetch("/auth/refresh_token");
      const json = await response.json();

      setToken(json.access_token);
      setTokenTimeout(json.token_expiry_time);
    }

    if (token !== "" && token !== undefined && tokenTimeout > 0) {
      const refresh = setTimeout(() => {
        refreshToken();
      }, 5000);
      return () => clearTimeout(refresh);
    }
  }, [token]);

  return (
    <>
      <div className="app_container">
        {token === "" || token === undefined ? (
          <Login />
        ) : (
          <Main token={token} />
        )}
      </div>

      {token === "" || token === undefined ? (
        <> </>
      ) : (
        <div className="playback_container">
          <WebPlayback token={token} />
        </div>
      )}
    </>
  );
};

export default Home;
