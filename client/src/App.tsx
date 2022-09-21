import "./App.css";
import Home from "./Pages/Home";
import Login from "./Components/Login";
import useAuth from "./useAuth";

const code = new URLSearchParams(window.location.search).get("code");

function App() {
  const token = useAuth(code!);
  return (
    <div className="App">
      {token !== "" ? <Home token={token} /> : <Login />}
    </div>
  );
}

export default App;
