import React, { useState, useEffect } from "react";
import "./details.css";

import { MyContributionCard, ContributionCard } from "../../components/card/Card";
import { useNavigate, useLocation } from "react-router-dom";

import { getCampaign } from "../../utils/CampaignManager";

function Details() {
  const location = useLocation();
  const [progress, setProgress] = useState(0); // Current crowdfunding progress
  const [campaignDetails, setCampaignDetails] = useState({});
  const { address } = location.state || {};
  console.log("Address: ", address);
  const [loading, setLoading] = useState(true);

  let navigate = useNavigate();
  const handleBackClick = () => {
    let path = "/home";
    navigate(path);
  };

  useEffect(() => {
    async function fetchCampaignDetail() {
      try {
        setLoading(true);
        const campaignData = await getCampaign(address);
        setCampaignDetails(campaignData);
        const p = (campaignData.currentAmount / campaignData.target) * 100;
        setProgress(p > 100 ? 100 : p);
      } catch (error) {
        console.error(error);
        setCampaignDetails({});
      } finally {
        setLoading(false);
      }
    }

    fetchCampaignDetail();
  }, []);

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
                  src={campaignDetails.posterUrl}
                  alt={campaignDetails.title}
                  className="project_image"
                />
                <p className="project_title">{campaignDetails.title}</p>
              </div>
              <div className="project_info_2">
                <p className="project_description">
                  {campaignDetails.description}
                </p>

                <div className="progress-bar">
                  <div
                    className="progress"
                    style={{ width: `${(progress / 10000) * 100}%` }}
                  >
                    <span className="progress-text">{campaignDetails.currentAmount}$</span>
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
