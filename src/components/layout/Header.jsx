import React from "react";
import "./header.scss"

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        <button className="return-button">Return to Quote</button>

        <button className="assistance-button">
          <span className="question-icon">?</span>
          <span className="assistance-text">Get Assistance</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
