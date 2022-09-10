import { FunctionComponent, useEffect, useState } from "react";
import Login from "../../Components/Login";
import WebPlayback from "../../Components/WebPlayback";

const Home: FunctionComponent<{}> = () => {
  const [token, setToken] = useState("");

  useEffect(() => {
    async function getToken() {
      const response = await fetch("/auth/token");
      const json = await response.json();
      console.log(json.access_token);
      setToken(json.access_token);
    }

    getToken();
  }, []);

  return (
    <div className="app_container">
      {token === "" || token === undefined ? (
        <Login />
      ) : (
        <WebPlayback token={token} />
      )}
    </div>
  );
};

export default Home;
