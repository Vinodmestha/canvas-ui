import React from "react";
import "./header.scss"

const Header = () => {
  const handleRedirect=()=>{
    const transactionData = localStorage.getItem("cpq-data-key");
    if (!transactionData) return;

    const parsedTransData = JSON.parse(transactionData);
    const transactionId = parsedTransData.transactionId;
      localStorage.clear();
        window.location.href = `https://watertechnologiesdev.bigmachines.com/commerce/transaction/oraclecpqo/${transactionId}`;
  }
  return (
    <header className="header">
      <div className="header-container">
        <button className="return-button" onClick={()=>handleRedirect()}>Return to Quote</button>

        <button className="assistance-button">
          <span className="question-icon">?</span>
          <span className="assistance-text">Get Assistance</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
