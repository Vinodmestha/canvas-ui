const RightSidebar = ({onClick,handleCPQIntegration, cpqBtnLoader}) => {
  return (
    <div className="right-sidebar">
      <div>
        <div className="target-output">
        {/* <div className="output-label">Target Output:</div> */}
        {/* <div className="output-value">5000</div> */}
        {/* <div className="output-unit">GPM</div> */}
      </div>
      {/* <button className="sidebar-btn settings-btn">
        <i className="icon-settings"></i>
      </button>
      <button className="sidebar-btn delete-btn">
        <i className="icon-trash"></i>
      </button>
      <button className="sidebar-btn unit-btn">
        <span>GPM</span>
        <span>m³/h</span>
      </button> */}
      <button className="sidebar-btn auto-size-btn" onClick={onClick}>
        <span>Auto</span>
        <span>Size</span>
      </button>
      </div>
      <div>
        <button className="sidebar-btn cart-btn" onClick={handleCPQIntegration} disabled={cpqBtnLoader} style={{cursor:"pointer"}}>
        {cpqBtnLoader?"Loading":"Cart"}
        {/* <i className="icon-cart"></i> */}
      </button>
      </div>
    </div>
  );
};
export default RightSidebar;