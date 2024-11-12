import React from "react";
import "./btndonations.css";

function ButtonDonation({ text, onClick }) {
  return (
    <button className="btn-donation" onClick={onClick}>
      {text}
    </button>
  );
}

export { ButtonDonation };