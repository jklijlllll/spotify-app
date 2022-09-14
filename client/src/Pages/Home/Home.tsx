import { FunctionComponent, useEffect, useState } from "react";
import Login from "../../Components/Login";
import Main from "../../Components/Main";
import WebPlayback from "../../Components/WebPlayback";
import useAuth from "../../useAuth";

const Home: FunctionComponent<{ token: string }> = ({ token }) => {
  return (
    <>
      <div className="app_container">
        <Main token={token} />
      </div>

      <div className="playback_container">
        <WebPlayback token={token} />
      </div>
    </>
  );
};

export default Home;
