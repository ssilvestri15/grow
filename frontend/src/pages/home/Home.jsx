import React, { useState, useEffect } from "react";
import "./home.css";
import Toolbar from "../../components/toolbar/toolbar";
import SlideShow from "../../components/slideshow/slideshow";
import IndefiniteProgressBar from "../../components/circlepb/IndefiniteProgressBar";

import { useNavigate } from "react-router-dom";
//import { useWalletManager, WALLET_ERRORS } from "../../utils/WalletManager";

import { getCampaigns } from "../../utils/CrowdfundingManager";

function Home() {
  const [showCrowdfunding, setShowCrowdfunding] = useState(false); // To toggle between pages
  //const { walletStatus, connectWallet } = useWalletManager();
  const [campaignsListSlide, setCampaignsListSlide] = useState([]);
  const [campaignsListMost, setCampaignsListMost] = useState([]);
  const [loading, setLoading] = useState(true);

  let navigate = useNavigate();
  const handleCreateClick = () => {
    let path = `/create`; 
    navigate(path);
  };
  const handleProductClick = (id, address) => {
    let path = `/project/${id}`; 
    navigate(path, { state: { address } });
  };
  useEffect(() => {
    async function fetchCampaigns() {
      try {
        setLoading(true);
        const campaignsData = await getCampaigns();
        setCampaignsListSlide(campaignsData.slice(0, Math.min(3, campaignsData.length)));
        setCampaignsListMost(campaignsData.slice(Math.min(3, campaignsData.length)));
      } catch (error) {
        console.error(error);
        setCampaignsListSlide([]);
        setCampaignsListMost([]);
      } finally {
        setLoading(false);
      }
    }

    fetchCampaigns();
  }, []);

  return (
    <div className="App">
      <div className="carousel-page">
          <Toolbar text="New Crowdfunding" symbol="add" whenClicked={()=>{handleCreateClick()}}/>
          { loading ? (
            <IndefiniteProgressBar width={64} height={64} stroke={6} color="#141414" />
          ) : (
            campaignsListSlide.length === 0 && campaignsListMost.lenght === 0 ? (
              <div className="no-campaigns">
                <a>No campaigns available</a>
              </div>
            ) : (
              <div>
                <div className="carousel">
                  <div className="carousel_slider">
                    <SlideShow slides={campaignsListSlide} />
                  </div>
                </div>
                <div className="section" id="most-wanted">
                  <a className="section_title">Most wanted</a>
                  <div className="section_product_list">
                    {campaignsListMost
                    .map((_, index) => (
                    <div
                      className="product-item"
                      key={index}
                      onClick={() => {
                        handleProductClick(campaignsListMost[index].title.replaceAll(" ", "").toLowerCase(), campaignsListMost[index].address)}
                      }
                    >
                      <img src={campaignsListMost[index].posterUrl} alt={campaignsListMost[index].title+" Image"} />
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
