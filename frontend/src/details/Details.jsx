import React, { useState } from "react";
import "./details.css";

import { MyContributionCard, ContributionCard } from "./Card";
import { useNavigate } from "react-router-dom";

function Details() {
  const [progress, setProgress] = useState(6550); // Current crowdfunding progress

  let navigate = useNavigate();
  const handleBackClick = () => {
    let path = "/home";
    navigate(path);
  };

  return (
    <div className="Details">
      <div className="crowdfunding-page">
        <div className="panels">
          <div className="left">
            <button onClick={handleBackClick} className="back-button">
              ← Back
            </button>
            <div className="crowdfunding-content">
              <div className="project_info_1">
                <img
                  src="../lofree-image.png"
                  alt="Lofree Product"
                  className="project_image"
                />
                <p className="project_title">Lofree Crowdfunding</p>
              </div>
              <div className="project_info_2">
                <p className="project_description">
                  Introducing Lofree Nova, a groundbreaking keyboard that
                  combines elegance and advanced technology to deliver an
                  unmatched typing experience. Equipped with Smart Touch
                  Technology, it adapts to your typing style, whether light or
                  firm, providing a personalized experience. The built-in AI
                  Learning System improves typing accuracy and speed over time,
                  learning from your habits. With next-gen silent mechanical
                  switches, you can enjoy the tactile feel of mechanical keys
                  without the noise, making it perfect for office environments.
                  Effortlessly switch between devices with multi-device
                  connectivity and enjoy customizable dynamic RGB backlighting,
                  creating the perfect ambiance for work or play. By supporting
                  Lofree Nova, you’re not only helping bring this innovative
                  keyboard to life, but also joining a revolution in typing
                  technology. Become a backer and unlock exclusive rewards like
                  early access pricing and limited-edition personalized
                  keyboards.
                </p>

                <div className="progress-bar">
                  <div
                    className="progress"
                    style={{ width: `${(progress / 10000) * 100}%` }}
                  >
                    <span className="progress-text">{progress}$</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="right">
            <div className="project_info_3">
              <div className="section_ycontr">
                <p className="right_section_title">Your contribution</p>
                <MyContributionCard />
              </div>
              <div className="section_allcontr">
                <p className="right_section_title">Contribution</p>
                {[...Array(5)].map((_, index) => (
                  <ContributionCard />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Details;
