import React, { useState, useEffect } from "react";
import "./home.css";
import Toolbar from "../../components/toolbar/toolbar";
import SlideShow from "../../components/slideshow/slideshow";
import IndefiniteProgressBar from "../../components/circlepb/IndefiniteProgressBar";

import { useNavigate } from "react-router-dom";
import { useWalletManager, WALLET_ERRORS } from "../../utils/WalletManager";

import { getCampaigns } from "../../utils/CrowdfundingManager";

function Home() {
  const [showCrowdfunding, setShowCrowdfunding] = useState(false); // To toggle between pages
  const { walletStatus, connectWallet } = useWalletManager();
  const [campaignsList, setCampaignsList] = useState([]);
  const [loading, setLoading] = useState(true);

  let navigate = useNavigate();
  const handleProductClick = (id, address) => {
    let path = `/project/${id}`; 
    navigate(path, { state: { address } });
  };

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        setLoading(true);
        const campaignsData = await getCampaigns();
        setCampaignsList(campaignsData);
      } catch (error) {
        console.error(error);
        setCampaignsList([]);
      } finally {
        setLoading(false);
      }
    }

    fetchCampaigns();
  }, []);

  return (
    <div className="App">
      <div className="carousel-page">
          <Toolbar walletStatus={walletStatus} connectWallet={connectWallet} />
          { loading ? (
            <IndefiniteProgressBar width={64} height={64} stroke={6} color="#141414" />
          ) : (
            campaignsList.length === 0 ? (
              <div className="no-campaigns">
                <a>No campaigns available</a>
              </div>
            ) : (
              <div>
                <div className="carousel">
                  <div className="carousel_slider">
                    <SlideShow slides={campaignsList.slice(0, Math.min(3, campaignsList.length))} />
                  </div>
                </div>
                <div className="section" id="most-wanted">
                  <a className="section_title">Most wanted</a>
                  <div className="section_product_list">
                    {campaignsList
                    .slice(Math.min(3, campaignsList.length))
                    .map((_, index) => (
                    <div
                      className="product-item"
                      key={index}
                      onClick={() => handleProductClick(campaignsList[index].title.replaceAll(" ", "").toLowerCase(), campaignsList[index].address)}
                    >
                      <img src={campaignsList[index].posterUrl} alt={campaignsList[index].title+" Image"} />
                    </div>
                  ))}
                  </div>
                </div>
              </div>
            ) 
          )}
        </div>
    </div>
  );
}

export default Home;
