import React, { useState, useEffect } from "react";
import "./details.css";

import {
  MyContributionCard,
  ContributionCard,
} from "../../components/card/Card";
import { ButtonDonation } from "../../components/btn_dona/ButtonDonation";
import { useNavigate, useLocation } from "react-router-dom";

import { getCampaign, donate } from "../../utils/CampaignManager";
import { getPalette } from "../../utils/PaletteGenerator";
import { ReactComponent as SadCat } from "../../assets/sad_cat.svg";
import {Tiers} from "../../components/tiers/Tiers";
import { isMetaMaskInstalled } from "../../utils/Provider";
import axios from "axios";


function Details() {
  const location = useLocation();
  const { address } = location.state || {};
  const [loading, setLoading] = useState(true);
  const [campaignDetails, setCampaignDetails] = useState({});
  const [progress, setProgress] = useState(0); // Current crowdfunding progress
  const [showTiers, setShowTiers] = useState(false);
  const [reloadPageTrigger, setReloadPageTrigger] = useState(false);
  //const [palette, setPalette] = useState({});

  let navigate = useNavigate();
  const handleBackClick = () => {
    let path = "/home";
    navigate(path);
  };

  useEffect(() => {
    async function fetchCampaignDetail() {
      try {
        setLoading(true);
        /*let campaignData = [];
        const response = await axios.post(`http://${process.env.REACT_APP_WIFI_IP}:3001/api/getcampaign/detail/`, {
          campaignAddress: address,
        });
        console.log(response);
        if (response.status !== 200) {
          campaignData = {};
        } else {
          campaignData = response.data;
        }*/
        const campaignData = await getCampaign(address);
        const p = (campaignData.currentAmount / campaignData.target) * 100;
        /*const paletteData = (campaignData && campaignData.posterUrl) ? await getPalette(campaignData.posterUrl) : await getPalette();
        setPalette(paletteData);*/
        setCampaignDetails(campaignData);
        setProgress(p > 100 ? 100 : p);
        setShowTiers(false);
      } catch (error) {
        console.error(error);
        setCampaignDetails({});
        setProgress(0);
        //setPalette({});
        setShowTiers(false);
      } finally {
        setLoading(false);
      }
    }

    fetchCampaignDetail();
  }, [reloadPageTrigger]);

  if (!address) {
    return <div>Invalid campaign address</div>;
  }

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
                    style={{ width: `${(progress)}%` }}
                  >
                    <span className="progress-text">
                      ETH&nbsp;{campaignDetails.currentAmount}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="right">
            <div className="project_info_3">
              {
                isMetaMaskInstalled() ? (
                  <div className="section_donate">
                  {
                    showTiers ? (
                      <Tiers setShowTiers={setShowTiers} donateToCampaign={(amount) => {donateToCampaign(address,amount, setReloadPageTrigger)}}/>
                    ) : (
                      <ButtonDonation
                        text="Make a donation"
                        onClick={() => {
                          setShowTiers(true);
                      }} />
                    )
                  }
                  </div>
                ) : null
              }
              {(campaignDetails.myDonations == undefined ||
                campaignDetails.myDonations.length === 0) &&
              (campaignDetails.otherDonations == undefined ||
                campaignDetails.otherDonations.length === 0) ? (
                <div className="empty_donations">
                  <SadCat />
                  <p>No donations here 😾</p>
                </div>
              ) : (
                <div>
                  {campaignDetails.myDonations.length > 0 ? (
                    <div className="section_ycontr">
                      <p className="right_section_title">Your contribution</p>
                      {campaignDetails.myDonations.map((donation) => (
                        <MyContributionCard amount={donation.amount} />
                      ))}
                    </div>
                  ) : null}
                  {campaignDetails.otherDonations.length > 0 ? (
                    <div className="section_allcontr">
                      <p className="right_section_title">Contribution</p>
                      {campaignDetails.otherDonations.map((donation) => (
                        <ContributionCard
                          donorAddress={donation.donor}
                          amount={donation.amount}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

async function donateToCampaign(address, amount, setReloadPageTrigger) {
  try {
    const result = await donate(address, amount);
    if (result) {
      setReloadPageTrigger(prev => !prev)
    }
  } catch (error) {
    console.error(error);
  }
}

export default Details;
