import React  from "react";
import "./toolbar.css";
import Searchbar from "../searchbar/searchbar";

function Toolbar() {
  return (
    <div className="toolbar">
        <a className="logo_title">Grow</a>
        <Searchbar />
        <a>Connect your wallett 👛</a>
    </div>
  );
}

export default Toolbar;