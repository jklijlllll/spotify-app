import { FunctionComponent, useEffect, useState } from "react";
import Login from "../../Components/Login";
import Main from "../../Components/Main";

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

  return (
    <div className="app_container">
      {token === "" || token === undefined ? <Login /> : <Main token={token} />}
    </div>
  );
};

export default Home;
