/* eslint-disable max-len */
/* eslint-disable no-console */
import React, { useEffect } from "react";
import { Panel, useReactFlow, getRectOfNodes } from "reactflow";
import { toPng } from "html-to-image";

function DownloadFlowsheet(props) {
  const { flowsheetImage, triggerDownload } = props;
  const { getNodes } = useReactFlow();
  const onTheFlyStyle = (toTag = "input", withTag = "img", flag = true) => {
    document.querySelectorAll(".nodeimg").forEach((ele) => {
      const imgEle = document.createElement(withTag);
      if (ele.querySelector(toTag)) {
        const closeTag = ele
          .closest(".custom-node-element")
          .querySelector(".unitop-close-icon-div");
        if (closeTag) {
          if (flag) {
            closeTag.classList.add("hide-close");
          } else {
            closeTag.classList.remove("hide-close");
          }
        }
        const errorTag = ele
          .closest(".custom-node-element")
          .querySelector(".unitop-error-icon-div");
        if (errorTag) {
          if (flag) {
            errorTag.classList.add("hide-close");
          } else {
            errorTag.classList.remove("hide-close");
          }
        }
        const parentRect = ele
          .closest(".react-flow__nodes")
          .querySelectorAll(".parent");
        parentRect.forEach((parent) => {
          if (flag) {
            parent.classList.add("hide-close");
          } else {
            parent.classList.remove("hide-close");
          }
        });
        Array.from(ele.querySelector(toTag).attributes).forEach(
          ({ name, value }) => {
            imgEle.setAttribute(name, value);
          }
        );
        ele
          .querySelector(toTag)
          .parentNode.replaceChild(imgEle, ele.querySelector(toTag));
      }
    });
  };
  // Helper function to calculate bounds for zig-zag layout
  const calculateZigZagBounds = (nodes) => {
    if (nodes.length === 0) return { x: 0, y: 0, width: 0, height: 0 };

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    nodes.forEach((node) => {
      console.log(node);
      const nodeWidth = node.width || 150;
      const nodeHeight = node.height || 100;

      minX = Math.min(minX, node.position.x);
      minY = Math.min(minY, node.position.y);
      maxX = Math.max(maxX, node.position.x + nodeWidth);
      maxY = Math.max(maxY, node.position.y + nodeHeight);
    });
    console.log({
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    });
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  };
  const onClick = async () => {
    await document.fonts.ready; // Wait for fonts to load
    const spaceAllLTRB = 20;
    const nodes = getNodes();
    const nodeCount = nodes.length;

    // Determine layout and calculate bounds accordingly
    let nodesBounds;
    if (nodeCount <= 3) {
      nodesBounds = getRectOfNodes(nodes);
    } else {
      nodesBounds = calculateZigZagBounds(nodes);
    }

    onTheFlyStyle("input", "img", true);

    const element = document.querySelector(
      ".react-flow__viewport.react-flow__container"
    );
    const styleEle = element.style.transform;
    const scale = styleEle.split("scale");
    element.style.transform = `${scale[0]} scale(1)`;

    const left = Number(styleEle.split("(")[1].split("px")[0]);
    const top = Number(styleEle.split("(")[1].split(",")[1].split("px")[0]);

    // FIXED: Use actual content bounds for both width and height
    const actualContentWidth = nodesBounds.width + spaceAllLTRB * 2;
    const actualContentHeight = nodesBounds.height + spaceAllLTRB * 2;

    // Set minimum dimensions for Word visibility
    const minWidth = nodeCount <= 3 ? 800 : 1200;
    const minHeight = nodeCount <= 3 ? 300 : 500;

    const captureWidth = Math.max(actualContentWidth, minWidth);
    const captureHeight = Math.max(actualContentHeight, minHeight);

    // CRITICAL: Calculate centering offsets
    const horizontalOffset = (captureWidth - actualContentWidth) / 2;
    const verticalOffset = (captureHeight - actualContentHeight) / 2;

    const imageUrl = await toPng(document.querySelector(".react-flow__pane"), {
      backgroundColor: "#ffffff", // White background for Word
      width: captureWidth,
      height: captureHeight,
      skipFonts: true,
      pixelRatio: 2,
      quality: 1,
      style: {
        // CENTER the content by adding offsets
        margin: `${-top + -(nodesBounds.y - spaceAllLTRB) + verticalOffset}px 0 0 ${-left - (nodesBounds.x - spaceAllLTRB) + horizontalOffset}px`,
        transform: "scale(1)",
        imageRendering: "crisp-edges",
      },
    });

    onTheFlyStyle("img", "input", false);
    element.style.transform = scale.join("scale");

    flowsheetImage(imageUrl);
  };

  useEffect(() => {
    if (triggerDownload) {
      onClick();
    }
  }, [triggerDownload]);
  return (
    <Panel position="top-left" style={{ display: "none" }}>
      <button
        type="button"
        className="download-btn flowsheet "
        onClick={onClick}
      >
        Download Image
      </button>
    </Panel>
  );
}
export default DownloadFlowsheet;
