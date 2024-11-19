import { React } from "react";
import { useNavigate } from "react-router-dom";

import "./create_campaign.css";
import {useCampaignFormViewModel} from "./campaignFormViewModel.js";

import { ImageUpload } from "../../components/image_upload/ImageUpload";
import { InputField } from "../../components/input_field/InputField";
import { ButtonDonation } from "../../components/btn_dona/ButtonDonation";

function CreateCampaign({}) {

  const {posterUrl, bannerUrl, campaignTitle, campaignDescription, campaignTarget, campaignEndDate, nftName, nftSymbol, handleFieldChange, createAndPay} = useCampaignFormViewModel();

  let navigate = useNavigate();
  const handleBackClick = () => {
    let path = "/home";
    navigate(path);
  };

  return (
    <div className="create_campaign">
      <div className="back">
        <button onClick={handleBackClick} className="back_button">
          ← Back
        </button>
      </div>
      <div className="create_campaign_details">
        <div className="campaign_form">
          <p className="title">make your own campaign</p>
          <div className="image_section">
            <div className="poster_image">
              <ImageUpload imagePosition="Poster Image" state={posterUrl} onFieldChange={(newState) => {handleFieldChange("posterUrl", newState)}}/>
            </div>
            <div className="banner_image">
              <ImageUpload imagePosition="Banner Image" state={bannerUrl} onFieldChange={(newState) => {handleFieldChange("bannerUrl", newState)}}/>
            </div>
          </div>
          <div className="campaign_name">
            <InputField typeInput="text" placeholder="Insert campaign title" state={campaignTitle} onFieldChange={(newState) => {handleFieldChange("campaignTitle", newState)}} />
          </div>
          <div className="campaign_desc">
            <InputField
              typeInput="textarea"
              placeholder="Insert campaign description"
              state={campaignDescription} onFieldChange={(newState) => {handleFieldChange("campaignDescription", newState)}}
            />
          </div>
          <div className="campaign_desc">
            <InputField
              typeInput="number"
              placeholder="Insert campaign target"
              state={campaignTarget} onFieldChange={(newState) => {handleFieldChange("campaignTarget", newState)}}
            />
          </div>
          <div className="campaign_end">
            <InputField
              typeInput="datetime-local"
              placeholder="Insert campaign end date"
              state={campaignEndDate} onFieldChange={(newState) => {handleFieldChange("campaignEndDate", newState)}}
            />
          </div>
          <div className="campaign_nft">
            <InputField typeInput="text" placeholder="Insert NFT Name" state={nftName} onFieldChange={(newState) => {handleFieldChange("nftName", newState)}}/>
            <InputField typeInput="text" placeholder="Insert NFT Symbol" state={nftSymbol} onFieldChange={(newState) => {handleFieldChange("nftSymbol", newState)}}/>
          </div>
          <div className="campaign_pay">
            <ButtonDonation text="Create & Pay" onClick={createAndPay}/>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateCampaign;
