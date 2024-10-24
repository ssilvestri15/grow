import React from "react";
import "./circlepb.css";

const IndefiniteProgressBar = ({
  width,
  height,
  stroke = 10,
  color = "#00aaff",
}) => {
  const radius = Math.min(width, height) / 2 - stroke * 2;
  const circumference = radius * 2 * Math.PI;
  const progress = circumference * (1 / 6); // Progress is 1/6 of the circumference

  return (
    <svg height={height} width={width}>
      <circle
        className="circle-background"
        stroke="#e6e6e6"
        fill="transparent"
        strokeWidth={stroke}
        r={radius}
        cx={width / 2}
        cy={height / 2}
      />
      <circle
        className="circle-progress"
        stroke={color} // Use the color prop for the progress bar
        fill="transparent"
        strokeWidth={stroke}
        strokeDasharray={`${progress} ${circumference}`} // Only show 1/6th of the circle
        strokeDashoffset={0} // No offset, it starts at the top
        r={radius}
        cx={width / 2}
        cy={height / 2}
      />
    </svg>
  );
};
export default IndefiniteProgressBar;
