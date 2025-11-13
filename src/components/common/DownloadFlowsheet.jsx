import React, { useEffect } from "react";
import { Panel, useReactFlow, getNodesBounds } from "reactflow";
import { toPng } from "html-to-image";

function DownloadFlowsheet(props) {
  const { flowsheetImage, triggerDownload } = props;
  const { getNodes } = useReactFlow();
  
  const onTheFlyStyle = (toTag = "input", withTag = "img", flag = true) => {
    document.querySelectorAll(".nodeimg").forEach((ele) => {
      const targetElement = ele.querySelector(toTag);
      if (!targetElement) return;

      const customNode = ele.closest(".custom-node-element");
      if (customNode) {
        const closeIcon = customNode.querySelector(".unitop-close-icon-div");
        const errorIcon = customNode.querySelector(".unitop-error-icon-div");
        
        if (closeIcon) closeIcon.classList.toggle("hide-close", flag);
        if (errorIcon) errorIcon.classList.toggle("hide-close", flag);
      }

      const reactFlowNodes = ele.closest(".react-flow__nodes");
      if (reactFlowNodes) {
        reactFlowNodes.querySelectorAll(".parent").forEach((parent) => {
          parent.classList.toggle("hide-close", flag);
        });
      }

      const replacementElement = document.createElement(withTag);
      Array.from(targetElement.attributes).forEach(({ name, value }) => {
        replacementElement.setAttribute(name, value);
      });
      targetElement.parentNode.replaceChild(replacementElement, targetElement);
    });
  };

 const onClick = async () => {
  try {
    await document.fonts.ready;
    const nodes = getNodes();
    
    if (nodes.length === 0) {
      console.warn('No nodes to capture');
      return;
    }

    const nodesBounds = getNodesBounds(nodes);
    onTheFlyStyle("input", "img", true);

    const viewport = document.querySelector(".react-flow__viewport");
    const renderer = document.querySelector(".react-flow__renderer");
    const background = document.querySelector(".react-flow__background");
    const edgesLayer = document.querySelector(".react-flow__edges");
    
    if (!viewport || !renderer) {
      console.error('ReactFlow elements not found');
      onTheFlyStyle("img", "input", false);
      return;
    }

    // Store original styles
    const originalTransform = viewport.style.transform;
    const originalWidth = renderer.style.width;
    const originalHeight = renderer.style.height;
    const originalOverflow = renderer.style.overflow;
    const originalBgDisplay = background?.style.display;

    // Hide background
    if (background) background.style.display = 'none';
    
    // CRITICAL: Force all SVG paths to be visible and inline
    if (edgesLayer) {
      edgesLayer.style.opacity = '1';
      edgesLayer.style.visibility = 'visible';
      edgesLayer.style.display = 'block';
      
      // Force all paths to be visible
      const allPaths = edgesLayer.querySelectorAll('path');
      allPaths.forEach(path => {
        path.style.opacity = '1';
        path.style.visibility = 'visible';
        path.style.display = 'block';
        // Ensure stroke is visible
        if (!path.getAttribute('stroke') || path.getAttribute('stroke') === 'none') {
          path.setAttribute('stroke', '#bed6f0'); // Default edge color
        }
        if (!path.getAttribute('stroke-width')) {
          path.setAttribute('stroke-width', '1');
        }
      });
    }

    // Calculate dimensions
    const padding = 100;
    const nodeCount = nodes.length;
    const minWidth = nodeCount <= 3 ? 800 : 1200;
    const minHeight = nodeCount <= 3 ? 300 : 500;
    
    const captureWidth = Math.max(nodesBounds.width + padding * 2, minWidth);
    const captureHeight = Math.max(nodesBounds.height + padding * 2, minHeight);

    // Apply capture styles
    renderer.style.width = `${captureWidth}px`;
    renderer.style.height = `${captureHeight}px`;
    renderer.style.overflow = 'visible';
    renderer.style.position = 'relative';
    viewport.style.transform = `translate(${-(nodesBounds.x - padding)}px, ${-(nodesBounds.y - padding)}px) scale(1)`;

    // Wait longer for SVG to render
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Capture with specific SVG handling
    const imageUrl = await toPng(renderer, {
      backgroundColor: "#ffffff",
      width: captureWidth,
      height: captureHeight,
      pixelRatio: 2,
      cacheBust: true,
      skipFonts: false,
      includeQueryParams: true,
      filter: (node) => {
        // Include all nodes, especially SVG elements
        return true;
      },
    });

    // Restore original styles
    viewport.style.transform = originalTransform;
    renderer.style.width = originalWidth;
    renderer.style.height = originalHeight;
    renderer.style.overflow = originalOverflow;
    renderer.style.position = '';
    if (background) background.style.display = originalBgDisplay || '';
    onTheFlyStyle("img", "input", false);

    flowsheetImage(imageUrl);
  } catch (error) {
    console.error('Screenshot failed:', error);
    onTheFlyStyle("img", "input", false);
  }
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
        className="download-btn flowsheet"
        onClick={onClick}
      >
        Download Image
      </button>
    </Panel>
  );
}

export default DownloadFlowsheet;
