import React from "react";
import "./toolbar.css";
import Searchbar from "../searchbar/searchbar";
import IndefiniteProgressBar from "../circlepb/IndefiniteProgressBar";
import {ButtonDonation} from "../btn_dona/ButtonDonation";

export function ToolbarButton({symbol, text, whenClicked }) {
  return (
    <div className="btn_div" onClick={whenClicked}>
      <span class="material-symbols-outlined">{symbol}</span>
      <a className="btn_text">{text}</a>
    </div>
  );
}

function Toolbar({symbol, text, whenClicked }) {
  return (
    <div className="toolbar">
      <a className="logo_title">Grow</a>
      <Searchbar />
      <ToolbarButton symbol={symbol} text={text} whenClicked={whenClicked} />
    </div>
  );
}

export default Toolbar;
