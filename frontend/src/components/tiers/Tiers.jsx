import React, { useState } from "react";
import "./tiers.css";
import { ButtonDonation } from "../btn_dona/ButtonDonation";

export function Tiers({setShowTiers, donateToCampaign}) {
  const [selectedTier, setSelectedTier] = useState(null);
  const [amount, setAmount] = useState(0);
  const [inputError, setInputError] = useState("");
  
  return (
    <div className="tiers_card">
      <div className="tiers_header">
        <p>Make a donation</p>
        <div className="close_btn_container">
          <span class="material-symbols-outlined" onClick={() => {setShowTiers(false)}}>close</span>
        </div>
      </div>
      <div className="tiers_body">
        <div className={(selectedTier != null) ? "amount_list selected" : "amount_list"}>
          <div className={"amount_item"+ getTierClass("1", selectedTier)} onClick={() => {changeTier("1", selectedTier, setSelectedTier, setAmount)}}>1</div>
          <div className={"amount_item"+ getTierClass("5", selectedTier)} onClick={() => {changeTier("5", selectedTier, setSelectedTier, setAmount)}}>5</div>
          <div className={"amount_item"+ getTierClass("10", selectedTier)} onClick={() => {changeTier("10", selectedTier, setSelectedTier, setAmount)}}>10</div>
          <div className={"amount_item"+ getTierClass("Other", selectedTier)} onClick={() => {changeTier("Other", selectedTier, setSelectedTier, setAmount)}}>Other</div>
        </div>
        {
            selectedTier == "Other" ? 
            <div className="amount_input">
                <div className="amount_input_field">
                  <span className="amount_input_symbol">ETH</span>
                  <input onChange={(event) => {listenForAmountChange(event, setAmount, setInputError)}} type="number" placeholder="Amount" min={0}/>
                </div>
                {
                    inputError != "" ? <span className="amount_input_error">{inputError}</span> : null
                }
            </div> : null
        }
        {
            (selectedTier != null  && selectedTier == "Other" && amount != "0") ? (
                <ButtonDonation text="Donate" onClick={() => {validateAnMakeTransaction(amount, donateToCampaign)}} />
            ) : (selectedTier != null && selectedTier != "Other") ? (
                <ButtonDonation text="Donate" onClick={() => {validateAnMakeTransaction(selectedTier, donateToCampaign)}} />
            ) : null
        }
      </div>
    </div>
  );
}

function validateAnMakeTransaction(amount, donateToCampaign) {
  const numberRegex = /^\d+(\.\d+)?$/;
  if (numberRegex.test(amount)) {
    donateToCampaign(amount);
  }
  return;
}

function listenForAmountChange(event, setAmount, setInputError) {
  const inputAmount = event.target.value;
  const numberRegex = /^\d+(\.\d+)?$/;

  if (inputAmount == "") {
    setInputError("");
    return setAmount(0);
  }

  if (numberRegex.test(inputAmount)) {
    setInputError("");
    return setAmount(inputAmount);
  }

  setInputError("Invalid amount");

}

function changeTier(tier, selectedTier, setSelectedTier, setAmount) {
    setAmount(0);
    if (tier == selectedTier) {
        return setSelectedTier(null);
    }
    return setSelectedTier(tier);
}

function getTierClass(tier, selectedTier) {
    if (selectedTier == null) {
        return "";
    }
    if (selectedTier == tier) {
        return " selected";
    }else{
        return " minimized";
    }
}