import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "./profile.css";
import IndefiniteProgressBar from "../../components/circlepb/IndefiniteProgressBar";
import {
    ContributionCardInfo,
    TokenCardInfo
} from "../../components/card/Card";

import { getUserData } from "../../utils/UserManager";

function Profile() {
  const [loading, setLoading] = useState(true);
  const [campaignsOwnedList, setCampaignsOwnedList] = useState([]);
  const [userContributionsList, setUserContributionsList] = useState([]);
  const [userTokensList, setUserTokensList] = useState([]);
  useEffect(() => {
    async function fetchCampaigns() {
      try {
        setLoading(true);
        const { campaignsOwned, userContributions, userTokens } =
          await getUserData();
        setCampaignsOwnedList(campaignsOwned);
        setUserContributionsList(userContributions);
        setUserTokensList(userTokens);
      } catch (error) {
        setCampaignsOwnedList([]);
        setUserContributionsList([]);
        setUserTokensList([]);
      } finally {
        setLoading(false);
      }
    }
    fetchCampaigns();
  }, []);
  let navigate = useNavigate();
  const handleBackClick = () => {
    let path = "/home";
    navigate(path);
  };
  const handleProductClick = (id, address) => {
    let path = `/project/${id}`;
    navigate(path, { state: { address } });
  };
  return (
    <div className="profile_page">
      <div className="back">
        <button onClick={handleBackClick} className="back_button">
          ← Back
        </button>
      </div>
      <div className="profile_sections">
        <p className="title">that's you</p>
        {loading ? (
          <div className="loading">
            <IndefiniteProgressBar
              width={64}
              height={64}
              stroke={6}
              color="#141414"
            />
          </div>
        ) : (
          <div className="sections">
            {campaignsOwnedList.length > 0 ? (
              <div className="card">
                <div className="container">
                  <p className="card_title">your campaigns</p>
                  <div className="card_data campaigns">
                    {campaignsOwnedList.map((_, index) => (
                      <div
                        className="product-item"
                        key={index}
                        onClick={() => {
                          handleProductClick(
                            campaignsOwnedList[index].title
                              .replaceAll(" ", "")
                              .toLowerCase(),
                            campaignsOwnedList[index].address
                          );
                        }}
                      >
                        <img
                          src={campaignsOwnedList[index].posterUrl}
                          alt={campaignsOwnedList[index].title + " Image"}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
            <div className="profile_other_info">
              {userContributionsList.length > 0 ? (
                <div className="card contributions">
                  <div className="container">
                    <p className="card_title">your contributions</p>
                    <div className="card_data contributions">
                      {userContributionsList.map((donation) => (
                        <div className="card_item">
                            <ContributionCardInfo title={donation.title} address={donation.address} amount={donation.amount} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
              {userTokensList.length > 0 ? (
                <div className="card tokens">
                  <div className="container">
                    <p className="card_title">your tokens</p>
                    <div className="card_data tokens"> 
                    { userTokensList.map((token_data) => (
                        <TokenCardInfo token={token_data.token} title={token_data.title} />
                    ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
