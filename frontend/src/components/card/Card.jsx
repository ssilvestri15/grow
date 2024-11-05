import React from "react";
import "./card.css";


export function MyContributionCard({ amount }) {
    return (
        <div className="contribution_card">
            <div className="left_c">
                <p className="tier_name">Epic Tier</p>
                <p className="tier_description">exclusive access, premium rewards, and groundbreaking innovation!</p>
            </div>
            <div className="right_c">
                <p className="tier_price">{amount} ETH</p>
            </div>
        </div>
    )
}

export function ContributionCard({ donorAddress, amount }) {
    return (
        <div className="contribution_card">
            <div className="left_c">
                <p className="wallett_title">Wallett</p>
                <p className="wallett_addr">{donorAddress}</p>
            </div>
            <div className="right_c">
                <p className="wallett_contr_amount">{amount} ETH</p>
            </div>
        </div>
    )
}