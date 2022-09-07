import { FunctionComponent, useEffect, useState } from "react";
import Login from "../../Components/Login";
import WebPlayback from "../../Components/WebPlayback";

const Home: FunctionComponent<{}> = () => {
  const [token, setToken] = useState("");

  useEffect(() => {
    async function getToken() {
      const response = await fetch("/auth/token");
      const json = await response.json();
      setToken(json.access_token);
    }

    getToken();
  }, []);

  return <>{token === "" ? <Login /> : <WebPlayback token={token} />}</>;
};

export default Home;
