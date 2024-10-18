import React, { useState } from "react";
import "./home.css";
import Toolbar from "../toolbar/toolbar";
import SlideShow from "../slideshow/slideshow";

import { useNavigate } from "react-router-dom";


function Home() {
  const [showCrowdfunding, setShowCrowdfunding] = useState(false); // To toggle between pages

  let navigate = useNavigate();
  const handleProductClick = () => {
    let path = '/project/lofree'; 
    navigate(path);
  };

  return (
    <div className="App">
      <div className="carousel-page">
          <Toolbar />
          <div className="carousel">
            <div className="carousel_slider">
              <SlideShow />
            </div>
          </div>
          <div className="section" id="most-wanted">
            <a className="section_title">Most wanted</a>
            <div className="section_product_list">
              {Array(8)
                .fill()
                .map((_, index) => (
                  <div
                    className="product-item"
                    key={index}
                    onClick={handleProductClick}
                  >
                    <img src="lofree-image.png" alt="Lofree Product" />
                  </div>
                ))}
            </div>
          </div>
        </div>
    </div>
  );
}

export default Home;
