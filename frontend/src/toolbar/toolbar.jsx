import React from "react";
import "./toolbar.css";
import Searchbar from "../searchbar/searchbar";
import IndefiniteProgressBar from "../circlepb/IndefiniteProgressBar";

export function WalletButton({ walletStatus, connectWallet }) {
  switch (walletStatus.kind) {
    case "failed":
      console.log(walletStatus.msg);
      return (
        <div className="wallet_div error">
          <span class="material-symbols-outlined">warning</span>
          <a className="btn_text">Wallet</a>
        </div>
      );
    case "success":
      return (
        <div className="wallet_div">
          <span class="material-symbols-outlined">wallet</span>
          <a className="btn_text">{walletStatus.data}</a>
        </div>
      );
    case "loading":
      return (
        <div className="wallet_div loading">
          <IndefiniteProgressBar width={32} height={32} stroke={3} color="#141414" />
          </div>
      );
    case "empty":
      return (
        <div className="wallet_div" onClick={connectWallet}>
          <span class="material-symbols-outlined">wallet</span>
          <a className="btn_text">Wallet</a>
        </div>
      );
    default:
      return (
        <div className="wallet_div">
          <span class="material-symbols-outlined">wallet</span>
          <a className="btn_text">Wallet</a>
        </div>
      );
  }
}

function Toolbar({ walletStatus, connectWallet }) {
  return (
    <div className="toolbar">
      <a className="logo_title">Grow</a>
      <Searchbar />
      <WalletButton walletStatus={walletStatus} connectWallet={connectWallet} />
    </div>
  );
}

export default Toolbar;
