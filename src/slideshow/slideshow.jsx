import React, { useState, useEffect } from "react";
import "./slideshow.css";

const slides = [
  {
    url: "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2560&q=80",
    alt: "Lofree Product",
    startAt: "Start Tomorrow",
    Description: "Laguna Crowdfunding",
  },
  {
    url: "https://images.unsplash.com/photo-1518623489648-a173ef7824f3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2762&q=80",
    alt: "Lofree Product",
    startAt: "Start late 2025",
    Description: "Ocean Crowdfunding",
  },
  {
    url: "your-product-image.png",
    alt: "Lofree Product",
    startAt: "Start on 16/10",
    Description: "PearPhone Crowdfunding",
  },
];

function SlideShow() {
  const [currentSlides, setCurrentSlides] = useState(slides);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

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
            src={slide.url}
            alt={slide.alt}
            className="layer"
            style={{
              left: `${index * 20}px`, // Increase by 20px for each index
              bottom: `${index * 20}px`, // Increase by 20px for each index
              width: `${baseWidth}px`,
              height: `${baseHeight}px`,
            }}
          />
        ))}
      </div>

      <div className="details">
        <a className="selected_startat">{currentSlides[len].startAt}</a>
        <a className="selected_description">
          {currentSlides[len].Description.replaceAll(" ", "\n")}
        </a>
      </div>
    </div>
  );
}

export default SlideShow;
