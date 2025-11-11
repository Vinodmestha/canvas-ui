import React from "react";
import {
  IconButton,
  Tooltip,
  Modal as MuiModal,
} from "@mui/material";
import { Handle } from "reactflow";

// 3. Updated UnitopComponent to use all the props
function UnitopComponent({
  id,
  unitopName,
  unitopType,
  checkUnitopExitsId,
  displayValue,
  config,
  node,
  handleEnter,
  deleteUnitTop,
  shouldShowWarning,
  warningType,
  warningMessage,
  image,
  hoverSource,
  exithoverSource
}) {
  
  const onMouseEnterNode = (e, nodeId) => {
    // Your existing logic
  };
  
  const onBluerNode = (e, nodeId) => {
    // Your existing logic
  };
  
  return (
    <div className="custom-node-element">
      <div className="unitop-close-icon-div">
        <IconButton
          aria-label="delete"
          onClick={(e) => deleteUnitTop(e, node)}
          size="small"
          className="unitop-close-icon"
        >
          X
        </IconButton>
      </div>
      
      <div
        id="unitop_anuj"
        style={{ marginTop: "-5px", height: "50px" }}
        className={`Node_${id}`}
      >
        {/* Warning message display */}
        {shouldShowWarning && (
          <p
            style={{
              fontSize: "8px",
              position: "absolute",
              top: "-36px",
              left: "-1px",
              color: warningType === "error" ? "red" : "orange",
              fontWeight: warningType === "error" ? "bold" : "normal",
            }}
          >
            {warningMessage}
          </p>
        )}
        
        {/* Unit operation label/name input */}
        <div
          className={`${id} unitop-label`}
          style={{
            width: "-webkit-fill-available",
          }}
          id="tooltip"
        >
          <Tooltip title={unitopName} placement="top" arrow>
            <input
              className="nodrag"
              type="text"
              id={`anujText${id}`}
              key={displayValue}
              style={{
                marginTop: "-10px",
                height: 10,
                fontSize: 9,
                border: "none",
                textAlign: "center",
              }}
              autoComplete="off"
              onFocus={(e) => onMouseEnterNode(e, id)}
              onBlur={(e) => onBluerNode(e, id)}
              placeholder={
                localStorage.getItem(id)
                  ? null
                  : localStorage.setItem(id, displayValue)
              }
              onChange={(e) => {
                localStorage.setItem(id, e.target.value);
                localStorage.setItem("globalExitBtn", "true");
              }}
              onKeyDown={handleEnter}
              onMouseOver={(e) => {
                e.target.style.color = "#0679CC";
              }}
              onMouseLeave={(e) => {
                e.target.style.color = "#000";
              }}
              defaultValue={unitopName}
            />
          </Tooltip>
        </div>
        
        {/* Unit operation image */}
        <div className="nodeimg" id={id}>
          <input
            className="nodrag"
            type="image"
            src={image}
            alt={unitopName}
            width="48"
            height="36"
            style={{ zIndex: "-9", position: "relative" }}
          />
        </div>
      </div>
      
      {/* Inlet handle */}
      <Tooltip
        title="Inlet"
        onMouseOver={(e) => hoverSource(e)}
        onMouseLeave={(e) => exithoverSource(e)}
      >
        <Handle
          id="a"
          type="target"
          position="left"
          style={{ background: "green" }}
        />
      </Tooltip>
      
      {/* Outlet handle */}
      <Tooltip
        title="Outlet"
        onMouseOver={(e) => hoverSource(e)}
        onMouseLeave={(e) => exithoverSource(e)}
      >
        <Handle
          id="c"
          type="source"
          position="right"
          style={{ background: "blue" }}
        />
      </Tooltip>
    </div>
  );
}

export default UnitopComponent;