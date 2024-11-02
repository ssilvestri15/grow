import React from "react";
import "./card.css";


export function MyContributionCard() {
    return (
        <div className="contribution_card">
            <div className="left_c">
                <p className="tier_name">Epic Tier</p>
                <p className="tier_description">exclusive access, premium rewards, and groundbreaking innovation!</p>
            </div>
            <div className="right_c">
                <p className="tier_price">250$</p>
            </div>
        </div>
    )
}

export function ContributionCard() {
    return (
        <div className="contribution_card">
            <div className="left_c">
                <p className="wallett_title">Wallett</p>
                <p className="wallett_addr">vdskgvskdjgksdjslkdgjskjdlskdgjsdkjlsgkdjlsdkjgklsdjklgjljkgkjbdlfjgldjfhkdfjkhlkhlklkjdhflkhlkflkd</p>
            </div>
            <div className="right_c">
                <p className="wallett_contr_amount">123$</p>
            </div>
        </div>
    )
}