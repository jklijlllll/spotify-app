import "./App.css";
import Home from "./Pages/Home";
import Login from "./Components/Login";
import useAuth from "./Hooks/useAuth";

const code = new URLSearchParams(window.location.search).get("code");

function App() {
  const { accessToken, loading } = useAuth(code!);

  return (
    <div className="App">
      {accessToken !== "" ? (
        <Home token={accessToken} />
      ) : (
        <Login loading={loading} />
      )}
    </div>
  );
}

export default App;
