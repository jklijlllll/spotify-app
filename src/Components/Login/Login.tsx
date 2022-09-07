import { FunctionComponent } from "react";

const Login: FunctionComponent<{}> = () => {
  return (
    <header className="App-header">
      <a className="btn-spotify" href="/auth/login">
        Login with Spotify
      </a>
    </header>
  );
};

export default Login;
