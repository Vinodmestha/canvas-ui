/* eslint-disable no-console */
/* eslint-disable max-len */
import React, { useState, useRef, useEffect } from "react";
import $ from "jquery";
// import Tooltip from "@mui/material/Tooltip";
import {
  grid_view,
  grid_view_pressed,
  single_view_grid,
  single_view_grid_pressed,
} from "../../../assets/images/index";
import "../sidebar/style.scss";
import useGroupToggle from "../../../hooks/useGroupToggle";
import { sidemenuIconGroups } from "../../../db/unitopJSONData";

// Filtering function
const filterIconsByProposal = (groups, proposalType, region, frequencies) => {
  // Convert to array if it's not already
  const freqArray = Array.isArray(frequencies) ? frequencies : [frequencies];

  return groups
    .map((group) => ({
      ...group,
      children: group.children.filter(
        (icon) =>
          icon[proposalType] === true &&
          icon.region.includes(region) &&
          freqArray.some((freq) => icon.frequency.includes(freq))
      ),
    }))
    .filter((group) => group.children.length > 0);
};

// Declare outside any other component
const RenderIconGroups = React.memo(({ iconGroups = [], onDragStart }) => {
  const { openGroups, toggleGroup } = useGroupToggle(iconGroups.length);
  return iconGroups.map((group, groupIndex) => (
    <div key={`group-${groupIndex}`} className="icon-group">
      <div
        onClick={() => toggleGroup(groupIndex)}
        className="icon-category"
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "10px 6px",
        }}
      >
        <h5 style={{ fontSize: "15px" }}>{group.label}</h5>
        <button type="button" style={{ border: "0" }}>
          {openGroups[groupIndex] ? "▼" : "▶"}
        </button>
      </div>
      {openGroups[groupIndex] &&
        Array.isArray(group.icons) &&
        group.icons.map((icon, iconIndex) => (
          <div
            key={`icon-${iconIndex}`}
            className="dndnode feed-icon"
            onDragStart={(event) => 
              onDragStart(event, icon.onDragStart, icon.unitopType)
            }
            draggable
          >
            <span className="center-flowsheet">
              <label className="icon-name sansW4SeLig">{icon.text}</label>
              <div className="tooltip-content">
                <input
                  className="nodrag feed-image"
                  type="image"
                  src={icon.src}
                />
              </div>
            </span>
          </div>
        ))}
    </div>
  ));
});

const getFrequencies = (region) => {
  if (region?.includes("APAC") || region?.includes("EMEA")) {
    return ["50Hz"];
  }
  return ["50Hz", "60Hz"];
};

export default (props) => {
  // eslint-disable-next-line
  console.log(props)
  const [doubleGrid, setdoubleGrid] = useState(false);
  const [singleGrid, setsingleGrid] = useState(true);
  const onDragStart = (event, nodeType, unitopType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.setData("application/unitoptype", unitopType);
    event.dataTransfer.effectAllowed = "move";
  };
  const [widthExpand, setWidthExpand] = useState(70);
  const feedIconBlock = useRef();
  function increaseWidth() {
    setdoubleGrid(true);
    setsingleGrid(false);
    setWidthExpand(155);
    $(".feed-icon-block").css("display", "block");
    $(".canvas-wrapper, .wrapper-sidebar").addClass("expended");
    document.querySelector(".feed-icon-block").scrollTop = 0;
  }
  function decreaseWidth() {
    setdoubleGrid(false);
    setsingleGrid(true);
    setWidthExpand(80);
    $(".feed-icon-block").css("display", "");
    $(".canvas-wrapper, .wrapper-sidebar").removeClass("expended");
  }
  // const filterIconsByAccess = (icons, access) => {
  //   console.log(icons);
  //   if (!Array.isArray(icons)) return []; // safety check
  //   if (!access) {
  //     // return icons.filter(item => item.title !== 'CLRO');
  //     return icons?.filter((item) => item.title !== "DSSRO");
  //   }
  //   return icons;
  // };
  useEffect(() => {
    increaseWidth();
  }, []);

  const getFrequencyOptions = (region) => {
    if (region?.includes("APAC")) return ["50Hz"];
    if (region?.includes("LAM")) return ["60Hz"];
    return ["50Hz", "60Hz"];
  };

  // Side menu component
  const SideMenuComponent = React.memo(
    ({ proposalType, region, frequency, sidemenuIconGroups }) => {
      const filteredGroups = filterIconsByProposal(
        sidemenuIconGroups,
        proposalType,
        region,
        frequency
      ).map((group) => ({ label: group.label, icons: group.children }));

      return (
        <RenderIconGroups
          iconGroups={filteredGroups}
          onDragStart={onDragStart}
        />
      );
    }
  );
  return (
    <div className="wrapper-sidebar">
      <span className="material-icons" style={{ cursor: "pointer" }}>
        <img
          src={singleGrid ? single_view_grid_pressed : single_view_grid}
          style={{ height: "18px", width: "18px", padding: "5px" }}
          className="center-img center-img-sigleNav"
          onClick={() => {
            decreaseWidth();
          }}
        />
        <img
          src={doubleGrid ? grid_view_pressed : grid_view}
          style={{ height: "18px", width: "18px", padding: "5px" }}
          className="center-img center-img-doubleNav"
          onClick={() => {
            increaseWidth();
          }}
        />
      </span>
      <div
        ref={feedIconBlock}
        className="feed-icon-block"
        style={{ width: widthExpand, marginTop: "10px" }}
      >
        {/* {(() => {
          return SideMenuComponent({ clroAccess, sidemenuIconGroups });
        })()} */}
        <SideMenuComponent
          proposalType={props?.cpqData?.proposalType}
          region={props?.cpqData?.region}
          frequency={props?.cpqData?.frequency}
          sidemenuIconGroups={sidemenuIconGroups}
        />
      </div>
    </div>
  );
};
