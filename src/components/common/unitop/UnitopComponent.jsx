import React from "react";
import {
  IconButton,
  Tooltip,
  Modal as MuiModal,
} from "@mui/material";
import { Handle } from "reactflow";

function UnitopComponent({id,unitopName,checkUnitopExitsId,node,handleEnter,deleteUnitTop,shouldShowWarning,warningType, image}) {
  return (
    <div className="custom-node-element">
      <div className="unitop-close-icon-div">
        <IconButton
          aria-label="new"
          // Replaced onClick instand of OnMouseDown in version 11 @sudarsana
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
            {warningType === "error" && maxCapacity && requiredOutput && (
              <span style={{ display: "block", fontSize: "7px" }}>
                {/* (Req: {requiredOutput.toFixed(0)} | Max:{" "} */}
                {/* {maxCapacity.toFixed(0)}) */}
              </span>
            )}
          </p>
        )}
        <div
          className={`${id} unitop-label `}
          style={{
            //  display: "none",
            width: "-webkit-fill-available",
          }}
          id="tooltip"
        >
          <Tooltip title={unitopName} placement="top" arrow>
            <input
              className="nodrag"
              type="text"
              id={`anujText${id}`}
              key={unitopName}
              style={{
                marginTop: "-10px",
                // width: "-webkit-fill-available",
                height: 10,
                fontSize: 9,
                border: "none",
                textAlign: "center",
              }}
              autoComplete="off"
              onFocus={(e) => {
                onMouseEnterNode(e, id);
              }}
              onBlur={(e) => {
                onBluerNode(e, id);
              }}
              placeholder={
                localStorage.getItem(id)
                  ? null
                  : localStorage.setItem(id, `CF_${checkUnitopExitsId}`)
              }
              onChange={(e) => {
                // setAnujName(e.target.value);
                localStorage.setItem(id, e.target.value);
                localStorage.setItem("globalExitBtn", "true");
                // setChecked(false);
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
        <div className="nodeimg" id={id}>
          <input
            className="nodrag"
            type="image"
            src={image}
            width="48"
            height="36"
            style={{ zIndex: "-9", position: "relative" }}
          />
        </div>
      </div>
      <Tooltip
        title="Inlet"
        onMouseOver={(e) => {
          hoverSource(e);
        }}
        onMouseLeave={(e) => {
          exithoverSource(e);
        }}
      >
        <Handle
          id="a"
          type="target"
          position="left"
          style={{ background: "green" }}
        />
      </Tooltip>
      <Tooltip
        title="Outlet"
        onMouseOver={(e) => {
          hoverSource(e);
        }}
        onMouseLeave={(e) => {
          exithoverSource(e);
        }}
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
