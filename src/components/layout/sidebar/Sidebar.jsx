/* eslint-disable no-console */
/* eslint-disable max-len */
import React, { useState, useRef, useEffect } from "react";
import $ from "jquery";
// import Tooltip from "@mui/material/Tooltip";
import {
  Feed,
  ProductOut,
  WasteOut,
  MixSplit,
  Pump,
  RO,
  RO_Pump,
  Chemical_Dosing,
  CF_new,
  uv,
  CLRO,
  EDI,
  stripperImage,
  TC,
  PW,
  ERD,
  grid_view,
  grid_view_pressed,
  single_view_grid,
  single_view_grid_pressed,
} from "../../../assets/images/index";
import "../sidebar/style.scss";
import useGroupToggle from "../../../hooks/useGroupToggle";

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
  let { clroAccess } = props;
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
  const sidemenuIconGroups = [
    // Group 1
    {
      label: "Ancillary (Inline)",
      value: "ancillary-inline",
      children: [
        {
          title: "Chemical Feed",
          onDragStart: "customnode_unitops",
          unitopType: "chemicaldosing",
          src: Chemical_Dosing,
          text: "Chemical Feed",
          packagedSystemLevel1QualifierFullProposal: true,
          packagedSystemFirmProposal: true,
          bridgeAndEmergencyResponseFirmProposal: false,
          assetCareSDIProposal: false,
          expertProtectionOutsourcingFirmProposal: false,
          channelPartnerChannelPartnerProposal: true,
          region: ["NAM", "EMEA"],
          frequency: props?.cpqData?.region.includes("EMEA")
            ? ["50Hz"]
            : ["50Hz", "60Hz"],
        },
        {
          title: "STR",
          onDragStart: "customnode_unitops",
          unitopType: "stripper", 
          src: stripperImage,
          text: "CIP",
          packagedSystemLevel1QualifierFullProposal: true,
          packagedSystemFirmProposal: true,
          bridgeAndEmergencyResponseFirmProposal: false,
          assetCareSDIProposal: false,
          expertProtectionOutsourcingFirmProposal: true,
          channelPartnerChannelPartnerProposal: true,
          region: ["NAM"],
          frequency: props?.cpqData?.region.includes("EMEA")
            ? ["50Hz"]
            : ["50Hz", "60Hz"],
        },
        {
          title: "CF",
          onDragStart: "customnode_unitops",
          unitopType: "cartridgefilter", 
          src: CF_new,
          text: "Cartridge Filter",
          packagedSystemLevel1QualifierFullProposal: true,
          packagedSystemFirmProposal: true,
          bridgeAndEmergencyResponseFirmProposal: false,
          assetCareSDIProposal: false,
          expertProtectionOutsourcingFirmProposal: false,
          channelPartnerChannelPartnerProposal: true,
          region: ["NAM"],
          frequency: props?.cpqData?.region.includes("EMEA")
            ? ["50Hz"]
            : ["50Hz", "60Hz"],
        },
        {
          title: "Distribution Pump",
          onDragStart: "customnode_unitops",
          unitopType: "distributionpump", 
          src: Pump,
          text: "Distribution Pump",
          packagedSystemLevel1QualifierFullProposal: true,
          packagedSystemFirmProposal: true,
          bridgeAndEmergencyResponseFirmProposal: false,
          assetCareSDIProposal: false,
          expertProtectionOutsourcingFirmProposal: false,
          channelPartnerChannelPartnerProposal: true,
          region: ["NAM", "EMEA"],
          frequency: props?.cpqData?.region.includes("EMEA")
            ? ["50Hz"]
            : ["50Hz", "60Hz"],
        },
        {
          title: "Ozone",
          onDragStart: "customnode_unitops",
          unitopType: "ozone", 
          src: Pump,
          text: "Ozone",
          packagedSystemLevel1QualifierFullProposal: true,
          packagedSystemFirmProposal: true,
          bridgeAndEmergencyResponseFirmProposal: false,
          assetCareSDIProposal: false,
          expertProtectionOutsourcingFirmProposal: false,
          channelPartnerChannelPartnerProposal: true,
          region: ["EMEA"],
          frequency: props?.cpqData?.region.includes("EMEA")
            ? ["50Hz"]
            : ["50Hz", "60Hz"],
        },
        {
          title: "Storage Tank",
          onDragStart: "customnode_unitops",
          unitopType: "storagetank", 
          src: Pump,
          text: "Storage Tank",
          packagedSystemLevel1QualifierFullProposal: true,
          packagedSystemFirmProposal: true,
          bridgeAndEmergencyResponseFirmProposal: false,
          assetCareSDIProposal: false,
          expertProtectionOutsourcingFirmProposal: false,
          channelPartnerChannelPartnerProposal: true,
          region: ["NAM", "EMEA"],
          frequency: props?.cpqData?.region.includes("EMEA")
            ? ["50Hz"]
            : ["50Hz", "60Hz"],
        },
        {
          title: "UVLight",
          onDragStart: "customnode_unitops",
          unitopType: "uvlight", 
          src: uv,
          text: "UV Light",
          packagedSystemLevel1QualifierFullProposal: true,
          packagedSystemFirmProposal: true,
          bridgeAndEmergencyResponseFirmProposal: false,
          assetCareSDIProposal: false,
          expertProtectionOutsourcingFirmProposal: false,
          channelPartnerChannelPartnerProposal: true,
          region: ["NAM"],
          frequency: props?.cpqData?.region.includes("EMEA")
            ? ["50Hz"]
            : ["60Hz"],
        },
      ],
    },
    // Group 2
    // {
    //   label: "EDI/EDR",
    //   value: "edi-edr",
    //   children: [
    //     {
    //       title: "EDI",
    //       onDragStart: "customnode_edi",
    //       src: Chemical_Dosing,
    //       text: "EDI",
    //       packagedSystemLevel1QualifierFullProposal: true,
    //       packagedSystemFirmProposal: true,
    //       bridgeAndEmergencyResponseFirmProposal: false,
    //       assetCareSDIProposal: false,
    //       expertProtectionOutsourcingFirmProposal: false,
    //       channelPartnerChannelPartnerProposal: true,
    //       region: ["NAM", "EMEA", "APAC"],
    //       frequency: getFrequencies(props?.cpqData?.region),
    //     },
    //     {
    //       title: "EDR System",
    //       onDragStart: "customnode_edrsystem",
    //       src: stripperImage,
    //       text: "EDR System",
    //       packagedSystemLevel1QualifierFullProposal: true,
    //       packagedSystemFirmProposal: true,
    //       bridgeAndEmergencyResponseFirmProposal: false,
    //       assetCareSDIProposal: false,
    //       expertProtectionOutsourcingFirmProposal: false,
    //       channelPartnerChannelPartnerProposal: true,
    //       region: ["NAM"],
    //       frequency: props?.cpqData?.region.includes("EMEA")
    //         ? ["50Hz"]
    //         : ["50Hz", "60Hz"],
    //     },
    //   ],
    // },
    // Group 3
    // {
    //   label: "Filtration",
    //   value: "filtration",
    //   children: [
    //     {
    //       title: "Activated Carbon Filter",
    //       onDragStart: "customnode_carbon_filter",
    //       src: Feed,
    //       text: "Activated Carbon Filter",
    //       packagedSystemLevel1QualifierFullProposal: true,
    //       packagedSystemFirmProposal: true,
    //       bridgeAndEmergencyResponseFirmProposal: false,
    //       assetCareSDIProposal: false,
    //       expertProtectionOutsourcingFirmProposal: false,
    //       channelPartnerChannelPartnerProposal: true,
    //       region: ["NAM"],
    //       frequency: props?.cpqData?.region.includes("EMEA")
    //         ? ["50Hz"]
    //         : ["50Hz", "60Hz"],
    //     },
    //     {
    //       title: "BEV Carbon Filter",
    //       onDragStart: "customnode_bev_carbon_filter",
    //       src: CF_new,
    //       text: "BEV Carbon Filter",
    //       packagedSystemLevel1QualifierFullProposal: true,
    //       packagedSystemFirmProposal: true,
    //       bridgeAndEmergencyResponseFirmProposal: false,
    //       assetCareSDIProposal: false,
    //       expertProtectionOutsourcingFirmProposal: false,
    //       channelPartnerChannelPartnerProposal: true,
    //       region: ["NAM"],
    //       frequency: props?.cpqData?.region.includes("EMEA")
    //         ? ["50Hz"]
    //         : ["60Hz"],
    //     },
    //     {
    //       title: "BEV Multi-Media Filter",
    //       onDragStart: "customnode_multimedia_filter",
    //       src: CF_new,
    //       text: "BEV Multi-Media Filter",
    //       packagedSystemLevel1QualifierFullProposal: true,
    //       packagedSystemFirmProposal: true,
    //       bridgeAndEmergencyResponseFirmProposal: false,
    //       assetCareSDIProposal: false,
    //       expertProtectionOutsourcingFirmProposal: false,
    //       channelPartnerChannelPartnerProposal: true,
    //       region: ["NAM"],
    //       frequency: props?.cpqData?.region.includes("EMEA")
    //         ? ["50Hz"]
    //         : ["60Hz"],
    //     },
    //     {
    //       title: "Greensand Filter",
    //       onDragStart: "customnode_greensand",
    //       src: MixSplit,
    //       text: "Greensand Filter",
    //       packagedSystemLevel1QualifierFullProposal: true,
    //       packagedSystemFirmProposal: true,
    //       bridgeAndEmergencyResponseFirmProposal: false,
    //       assetCareSDIProposal: false,
    //       expertProtectionOutsourcingFirmProposal: false,
    //       channelPartnerChannelPartnerProposal: true,
    //       region: ["NAM"],
    //       frequency: props?.cpqData?.region.includes("EMEA")
    //         ? ["50Hz"]
    //         : ["50Hz", "60Hz"],
    //     },
    //     {
    //       title: "Multi-Media FIlter",
    //       onDragStart: "customnode_multimedia",
    //       src: RO_Pump,
    //       text: "Multi-Media FIlter",
    //       packagedSystemLevel1QualifierFullProposal: true,
    //       packagedSystemFirmProposal: true,
    //       bridgeAndEmergencyResponseFirmProposal: false,
    //       assetCareSDIProposal: false,
    //       expertProtectionOutsourcingFirmProposal: false,
    //       channelPartnerChannelPartnerProposal: true,
    //       region: ["NAM", "EMEA"],
    //       frequency: props?.cpqData?.region.includes("EMEA")
    //         ? [""]
    //         : ["50Hz", "60Hz"],
    //     },
    //   ],
    // },
    // Group 4
    // {
    //   label: "Ion Exchange",
    //   value: "ion-exchange",
    //   children: [
    //     {
    //       title: "Water Softener",
    //       onDragStart: "customnode_watersoftener",
    //       src: RO,
    //       text: "Water Softener",
    //       packagedSystemLevel1QualifierFullProposal: true,
    //       packagedSystemFirmProposal: true,
    //       bridgeAndEmergencyResponseFirmProposal: false,
    //       assetCareSDIProposal: false,
    //       expertProtectionOutsourcingFirmProposal: false,
    //       channelPartnerChannelPartnerProposal: true,
    //       region: ["NAM"],
    //       frequency: props?.cpqData?.region.includes("EMEA")
    //         ? ["50Hz"]
    //         : ["50Hz", "60Hz"],
    //     },
    //   ],
    // },
    // Group 5
    // {
    //   label: "Membrane Filtration",
    //   value: "membrane-filtration",
    //   children: [
    //     {
    //       title: "BEV Machine",
    //       onDragStart: "customnode_bevmachine",
    //       src: CLRO,
    //       text: "BEV Machine",
    //       packagedSystemLevel1QualifierFullProposal: true,
    //       packagedSystemFirmProposal: true,
    //       bridgeAndEmergencyResponseFirmProposal: false,
    //       assetCareSDIProposal: false,
    //       expertProtectionOutsourcingFirmProposal: false,
    //       channelPartnerChannelPartnerProposal: true,
    //       region: ["NAM"],
    //       frequency: props?.cpqData?.region.includes("EMEA")
    //         ? ["50Hz"]
    //         : ["60Hz"],
    //     },
    //     {
    //       title: "E-Series",
    //       onDragStart: "customnode_eseries",
    //       src: CLRO,
    //       text: "E-Series",
    //       packagedSystemLevel1QualifierFullProposal: true,
    //       packagedSystemFirmProposal: true,
    //       bridgeAndEmergencyResponseFirmProposal: false,
    //       assetCareSDIProposal: false,
    //       expertProtectionOutsourcingFirmProposal: false,
    //       channelPartnerChannelPartnerProposal: true,
    //       region: ["NAM", "EMEA", "APAC"],
    //       frequency:
    //         props?.cpqData?.region.includes("APAC") ||
    //         props?.cpqData?.region.includes("EMEA")
    //           ? ["50Hz"]
    //           : ["50Hz", "60Hz"],
    //     },
    //     {
    //       title: "PROflex NAM",
    //       onDragStart: "customnode_proflex",
    //       src: CLRO,
    //       text: "PROflex",
    //       packagedSystemLevel1QualifierFullProposal: true,
    //       packagedSystemFirmProposal: true,
    //       bridgeAndEmergencyResponseFirmProposal: false,
    //       assetCareSDIProposal: false,
    //       expertProtectionOutsourcingFirmProposal: false,
    //       channelPartnerChannelPartnerProposal: true,
    //       region: ["NAM"],
    //       frequency: props?.cpqData?.region.includes("EMEA")
    //         ? ["50Hz"]
    //         : ["50Hz", "60Hz"],
    //     },
    //     {
    //       title: "PROflex AP",
    //       onDragStart: "customnode_proflex_ap",
    //       src: CLRO,
    //       text: "PROflex",
    //       packagedSystemLevel1QualifierFullProposal: true,
    //       packagedSystemFirmProposal: true,
    //       bridgeAndEmergencyResponseFirmProposal: false,
    //       assetCareSDIProposal: false,
    //       expertProtectionOutsourcingFirmProposal: false,
    //       channelPartnerChannelPartnerProposal: true,
    //       region: ["APAC"],
    //       frequency: props?.cpqData?.region.includes("EMEA")
    //         ? ["50Hz"]
    //         : ["50Hz", "60Hz"],
    //     },
    //     {
    //       title: "PROflex EU",
    //       onDragStart: "customnode_proflex_eu_cis",
    //       src: CLRO,
    //       text: "PROflex",
    //       packagedSystemLevel1QualifierFullProposal: true,
    //       packagedSystemFirmProposal: true,
    //       bridgeAndEmergencyResponseFirmProposal: false,
    //       assetCareSDIProposal: false,
    //       expertProtectionOutsourcingFirmProposal: false,
    //       channelPartnerChannelPartnerProposal: true,
    //       region: ["EMEA"],
    //       frequency: ["50Hz"],
    //     },
    //     {
    //       title: "PROflex LAM",
    //       onDragStart: "customnode_proflex_lam",
    //       src: CLRO,
    //       text: "PROflex",
    //       packagedSystemLevel1QualifierFullProposal: true,
    //       packagedSystemFirmProposal: true,
    //       bridgeAndEmergencyResponseFirmProposal: false,
    //       assetCareSDIProposal: false,
    //       expertProtectionOutsourcingFirmProposal: false,
    //       channelPartnerChannelPartnerProposal: true,
    //       region: ["LAM"],
    //       frequency: props?.cpqData?.region.includes("EMEA")
    //         ? ["50Hz"]
    //         : ["50Hz", "60Hz"],
    //     },
    //     {
    //       title: "PROflex LT (Non-CE/EAC)",
    //       onDragStart: "customnode_proflex_lt",
    //       src: CLRO,
    //       text: "PROflex LT (Non-CE/EAC)",
    //       packagedSystemLevel1QualifierFullProposal: true,
    //       packagedSystemFirmProposal: true,
    //       bridgeAndEmergencyResponseFirmProposal: false,
    //       assetCareSDIProposal: false,
    //       expertProtectionOutsourcingFirmProposal: false,
    //       channelPartnerChannelPartnerProposal: true,
    //       region: ["APAC", "LAM", "NAM", "EMEA"],
    //       frequency: getFrequencyOptions(props?.cpqData?.region),
    //     },
    //     {
    //       title: "RO EDI",
    //       onDragStart: "customnode_ro_edi",
    //       src: CLRO,
    //       text: "RO EDI",
    //       packagedSystemLevel1QualifierFullProposal: true,
    //       packagedSystemFirmProposal: true,
    //       bridgeAndEmergencyResponseFirmProposal: false,
    //       assetCareSDIProposal: false,
    //       expertProtectionOutsourcingFirmProposal: false,
    //       channelPartnerChannelPartnerProposal: true,
    //       region: ["NAM", "EMEA"],
    //       frequency: props?.cpqData?.region.includes("EMEA")
    //         ? ["50Hz"]
    //         : ["50Hz", "60Hz"],
    //     },
    //     {
    //       title: "SeaPRO",
    //       onDragStart: "customnode_seapro",
    //       src: CLRO,
    //       text: "SeaPRO",
    //       packagedSystemLevel1QualifierFullProposal: true,
    //       packagedSystemFirmProposal: true,
    //       bridgeAndEmergencyResponseFirmProposal: false,
    //       assetCareSDIProposal: false,
    //       expertProtectionOutsourcingFirmProposal: false,
    //       channelPartnerChannelPartnerProposal: true,
    //       region: ["NAM", "EMEA", "APAC"],
    //       frequency:
    //         //  props?.cpqData?.region.includes("EMEA")
    //         //   ? ["60Hz"]
    //         // :
    //         ["50Hz", "60Hz"],
    //     },
    //     {
    //       title: "SeaPRO-E",
    //       onDragStart: "customnode_seapro_e",
    //       src: CLRO,
    //       text: "SeaPRO-E",
    //       packagedSystemLevel1QualifierFullProposal: true,
    //       packagedSystemFirmProposal: true,
    //       bridgeAndEmergencyResponseFirmProposal: false,
    //       assetCareSDIProposal: false,
    //       expertProtectionOutsourcingFirmProposal: false,
    //       channelPartnerChannelPartnerProposal: true,
    //       region: ["NAM", "EMEA", "APAC"],
    //       frequency:
    //         // props?.cpqData?.region.includes("EMEA")
    //         //   ? ["60Hz"]
    //         //   :
    //         ["50Hz", "60Hz"],
    //     },
    //     {
    //       title: "Z-PAK R",
    //       onDragStart: "customnode_zpak",
    //       src: CLRO,
    //       text: "Z-PAK R",
    //       packagedSystemLevel1QualifierFullProposal: true,
    //       packagedSystemFirmProposal: true,
    //       bridgeAndEmergencyResponseFirmProposal: false,
    //       assetCareSDIProposal: false,
    //       expertProtectionOutsourcingFirmProposal: false,
    //       channelPartnerChannelPartnerProposal: true,
    //       region: ["NAM"],
    //       frequency: props?.cpqData?.region.includes("EMEA")
    //         ? ["50Hz"]
    //         : ["50Hz", "60Hz"],
    //     },
    //     {
    //       title: "Aquasource",
    //       onDragStart: "customnode_aquasource",
    //       src: CLRO,
    //       text: "Aquasource",
    //       packagedSystemLevel1QualifierFullProposal: true,
    //       packagedSystemFirmProposal: true,
    //       bridgeAndEmergencyResponseFirmProposal: false,
    //       assetCareSDIProposal: false,
    //       expertProtectionOutsourcingFirmProposal: false,
    //       channelPartnerChannelPartnerProposal: true,
    //       region: ["EMEA"],
    //       frequency: props?.cpqData?.region.includes("EMEA")
    //         ? ["50Hz"]
    //         : ["50Hz"],
    //     },
    //   ],
    // },
    // Group 6
    // {
    //   label: "Services - Asset Care",
    //   value: "services-asset-care",
    //   children: [
    //     {
    //       title: "SDI Column",
    //       onDragStart: "customnode_sdi_column",
    //       src: RO,
    //       text: "SDI Column",
    //       packagedSystemLevel1QualifierFullProposal: false,
    //       packagedSystemFirmProposal: false,
    //       bridgeAndEmergencyResponseFirmProposal: false,
    //       assetCareSDIProposal: true,
    //       expertProtectionOutsourcingFirmProposal: false,
    //       channelPartnerChannelPartnerProposal: false,
    //       region: "",
    //       frequency: "",
    //     },
    //     {
    //       title: "SDI Install Kit",
    //       onDragStart: "customnode_sdi_install",
    //       src: RO,
    //       text: "SDI Install Kit",
    //       packagedSystemLevel1QualifierFullProposal: false,
    //       packagedSystemFirmProposal: false,
    //       bridgeAndEmergencyResponseFirmProposal: false,
    //       assetCareSDIProposal: true,
    //       expertProtectionOutsourcingFirmProposal: false,
    //       channelPartnerChannelPartnerProposal: false,
    //       region: "",
    //       frequency: "",
    //     },
    //     {
    //       title: "SDI RO System",
    //       onDragStart: "customnode_sdi_ro_system",
    //       src: RO,
    //       text: "SDI RO System",
    //       packagedSystemLevel1QualifierFullProposal: false,
    //       packagedSystemFirmProposal: false,
    //       bridgeAndEmergencyResponseFirmProposal: false,
    //       assetCareSDIProposal: true,
    //       expertProtectionOutsourcingFirmProposal: false,
    //       channelPartnerChannelPartnerProposal: false,
    //       region: "",
    //       frequency: "",
    //     },
    //     {
    //       title: "SDI Spot Free System",
    //       onDragStart: "customnode_sdi_spot_free_system",
    //       src: RO,
    //       text: "SDI Spot Free System",
    //       packagedSystemLevel1QualifierFullProposal: false,
    //       packagedSystemFirmProposal: false,
    //       bridgeAndEmergencyResponseFirmProposal: false,
    //       assetCareSDIProposal: true,
    //       expertProtectionOutsourcingFirmProposal: false,
    //       channelPartnerChannelPartnerProposal: false,
    //       region: "",
    //       frequency: "",
    //     },
    //     {
    //       title: "SDI UHP Water Systems",
    //       onDragStart: "customnode_sdi_uhp_water",
    //       src: RO,
    //       text: "SDI UHP Water Systems",
    //       packagedSystemLevel1QualifierFullProposal: false,
    //       packagedSystemFirmProposal: false,
    //       bridgeAndEmergencyResponseFirmProposal: false,
    //       assetCareSDIProposal: true,
    //       expertProtectionOutsourcingFirmProposal: false,
    //       channelPartnerChannelPartnerProposal: false,
    //       region: "",
    //       frequency: "",
    //     },
    //   ],
    // },
    // Group 7
    // {
    //   label: "Services - Bridge & Emergency",
    //   value: "services-bridge-emergency",
    //   children: [
    //     {
    //       title: "Deionisation",
    //       onDragStart: "customnode_deionisation",
    //       src: RO,
    //       text: "Deionisation",
    //       packagedSystemLevel1QualifierFullProposal: false,
    //       packagedSystemFirmProposal: false,
    //       bridgeAndEmergencyResponseFirmProposal: true,
    //       assetCareSDIProposal: false,
    //       expertProtectionOutsourcingFirmProposal: false,
    //       channelPartnerChannelPartnerProposal: false,
    //       region: "",
    //       frequency: "",
    //     },
    //     {
    //       title: "Media Filtration",
    //       onDragStart: "customnode_media_filtration",
    //       src: RO,
    //       text: "Media Filtration",
    //       packagedSystemLevel1QualifierFullProposal: false,
    //       packagedSystemFirmProposal: false,
    //       bridgeAndEmergencyResponseFirmProposal: true,
    //       assetCareSDIProposal: false,
    //       expertProtectionOutsourcingFirmProposal: false,
    //       channelPartnerChannelPartnerProposal: false,
    //       region: "",
    //       frequency: "",
    //     },
    //     {
    //       title: "Mobile EDI",
    //       onDragStart: "customnode_mobile_edi",
    //       src: RO,
    //       text: "Mobile EDI",
    //       packagedSystemLevel1QualifierFullProposal: false,
    //       packagedSystemFirmProposal: false,
    //       bridgeAndEmergencyResponseFirmProposal: true,
    //       assetCareSDIProposal: false,
    //       expertProtectionOutsourcingFirmProposal: false,
    //       channelPartnerChannelPartnerProposal: false,
    //       region: "",
    //       frequency: "",
    //     },
    //     {
    //       title: "Mobile RO (Brackish)",
    //       onDragStart: "customnode_mobile_ro",
    //       src: RO,
    //       text: "Mobile RO (Brackish)",
    //       packagedSystemLevel1QualifierFullProposal: false,
    //       packagedSystemFirmProposal: false,
    //       bridgeAndEmergencyResponseFirmProposal: true,
    //       assetCareSDIProposal: false,
    //       expertProtectionOutsourcingFirmProposal: false,
    //       channelPartnerChannelPartnerProposal: false,
    //       region: "",
    //       frequency: "",
    //     },

    //     {
    //       title: "Other",
    //       onDragStart: "customnode_other",
    //       src: RO,
    //       text: "Other",
    //       packagedSystemLevel1QualifierFullProposal: false,
    //       packagedSystemFirmProposal: false,
    //       bridgeAndEmergencyResponseFirmProposal: true,
    //       assetCareSDIProposal: false,
    //       expertProtectionOutsourcingFirmProposal: false,
    //       channelPartnerChannelPartnerProposal: false,
    //       region: "",
    //       frequency: "",
    //     },
    //     {
    //       title: "Process separations (DAF / Clarifier)",
    //       onDragStart: "customnode_process_seperation",
    //       src: RO,
    //       text: "Process separations (DAF / Clarifier)",
    //       packagedSystemLevel1QualifierFullProposal: false,
    //       packagedSystemFirmProposal: false,
    //       bridgeAndEmergencyResponseFirmProposal: true,
    //       assetCareSDIProposal: false,
    //       expertProtectionOutsourcingFirmProposal: false,
    //       channelPartnerChannelPartnerProposal: false,
    //       region: "",
    //       frequency: "",
    //     },
    //     {
    //       title: "Pump Skid FDA",
    //       onDragStart: "customnode_pump_skid_fda",
    //       src: RO,
    //       text: "Pump Skid FDA",
    //       packagedSystemLevel1QualifierFullProposal: false,
    //       packagedSystemFirmProposal: false,
    //       bridgeAndEmergencyResponseFirmProposal: true,
    //       assetCareSDIProposal: false,
    //       expertProtectionOutsourcingFirmProposal: false,
    //       channelPartnerChannelPartnerProposal: false,
    //       region: "",
    //       frequency: "",
    //     },
    //     {
    //       title: "Seawater RO",
    //       onDragStart: "customnode_seawater_ro",
    //       src: RO,
    //       text: "Seawater RO",
    //       packagedSystemLevel1QualifierFullProposal: false,
    //       packagedSystemFirmProposal: false,
    //       bridgeAndEmergencyResponseFirmProposal: true,
    //       assetCareSDIProposal: false,
    //       expertProtectionOutsourcingFirmProposal: false,
    //       channelPartnerChannelPartnerProposal: false,
    //       region: "",
    //       frequency: "",
    //     },
    //     {
    //       title: "Ultrafiltration",
    //       onDragStart: "customnode_ultrafiltration",
    //       src: RO,
    //       text: "Ultrafiltration",
    //       packagedSystemLevel1QualifierFullProposal: false,
    //       packagedSystemFirmProposal: false,
    //       bridgeAndEmergencyResponseFirmProposal: true,
    //       assetCareSDIProposal: false,
    //       expertProtectionOutsourcingFirmProposal: false,
    //       channelPartnerChannelPartnerProposal: false,
    //       region: "",
    //       frequency: "",
    //     },
    //   ],
    // },
  ];
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
