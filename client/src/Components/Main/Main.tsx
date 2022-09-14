import { FunctionComponent, useState } from "react";
import SearchBar from "../SearchBar";

const Main: FunctionComponent<{ token: string }> = ({ token }) => {
  return (
    <div className="main_container">
      <div className="search_container">
        <SearchBar token={token} />
      </div>
    </div>
  );
};

export default Main;
