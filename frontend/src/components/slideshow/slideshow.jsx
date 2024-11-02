import React, { useState, useEffect } from "react";
import "./slideshow.css";

import { useNavigate } from "react-router-dom";

function SlideShow({ slides }) {

  const [currentSlides, setCurrentSlides] = useState(slides);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  let navigate = useNavigate();
  const handleProductClick = (id, address) => {
    let path = `/project/${id}`; 
    navigate(path, { state: { address } });
  };

  // Update dimensions on resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto cycle the slides every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const newSlides = [...currentSlides];
      const movedSlide = newSlides.pop(); // Remove the last slide
      newSlides.unshift(movedSlide); // Add it to the start
      setCurrentSlides(newSlides); // Update the slides array
    }, 4000);

    return () => clearInterval(interval);
  }, [currentSlides]);

  if (slides.length === 0) {
    return <div></div>;
  }

  const len = currentSlides.length - 1 > 0 ? currentSlides.length - 1 : 0;

  // Responsive size calculations based on screen size
  const baseWidth = dimensions.width > 768 ? 600 : dimensions.width * 0.65;
  const baseHeight = dimensions.width > 768 ? 280 : dimensions.width * 0.325;

  return (
    <div className="comingsoon">
      <div
        className="layers"
        style={{
          height: `${baseHeight + len * 20}px`,
          width: `${baseWidth + len * 20}px`,
        }}
      >
        {currentSlides.map((slide, index) => (
          <img
            key={index}
            src={slide.bannerUrl}
            alt={slide.title}
            className="layer"
            style={{
              left: `${index * 20}px`, // Increase by 20px for each index
              bottom: `${index * 20}px`, // Increase by 20px for each index
              width: `${baseWidth}px`,
              height: `${baseHeight}px`,
            }}
            onClick={() => handleProductClick(slide.title.replaceAll(" ", "").toLowerCase(), slide.address)}
          />
        ))}
      </div>

      <div className="details">
        <a className="selected_startat">{"Start on "+currentSlides[len].startDate}</a>
        <a className="selected_description">
          {currentSlides[len].title.replaceAll(" ", "\n")}
        </a>
      </div>
    </div>
  );
}

export default SlideShow;
