import React from "react";
import "./landing.css";

import { useNavigate } from "react-router-dom";


function Landing() {
  let navigate = useNavigate();
  const routeChange = () =>{ 
    let path = 'home'; 
    navigate(path);
  }
  return (
    <div className="Landing">
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=arrow_right_alt"
        />
        <a class="logo_title">Grow</a>
        <a class="subtitle">Decentrlyzed Crowdfunding Platform</a>
        <div className="btn-next">
          <button className="btn_next" onClick={routeChange}>
            <span className="arrow">
              <span className="material-symbols-outlined">arrow_right_alt</span>
            </span>
          </button>
        </div>
    </div>
  );
}

export default Landing;
