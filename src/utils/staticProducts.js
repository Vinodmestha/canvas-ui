import { Chemical_Dosing, CF_new, uv, stripperImage } from "../assets/images";

// Static product data - replace this with API call later
export const staticProducts = [
  {
    id: "cartridgeFilter",
    name: "Cartridge Filter",
    unitopType: "cartridgeFilter",
    prefix: "CF",
    imageUrl: CF_new,
    path: "/config/proGen/filtration/cartridgeFilter",
    category: "Ancillary (Inline)",
    regions: ["NAM", "EMEA"],
    frequencies: ["50Hz", "60Hz"],
    proposalTypes: [
      "packagedSystemLevel1QualifierFullProposal",
      "packagedSystemFirmProposal",
      "channelPartnerChannelPartnerProposal",
    ],
  },
  {
    id: "stripper",
    name: "Clean in Place (CIP)",
    unitopType: "CIP",
    prefix: "STR",
    imageUrl: stripperImage,
    path: "/config/proGen/filtration/CIP",
    category: "Ancillary (Inline)",
    regions: ["NAM"],
    frequencies: ["50Hz", "60Hz"],
    proposalTypes: [
      "packagedSystemLevel1QualifierFullProposal",
      "packagedSystemFirmProposal",
    ],
  },
  {
    id: "chemicaldosing",
    name: "Chemical Feed",
    unitopType: "chemicalFeed",
    prefix: "Dose",
    imageUrl: Chemical_Dosing,
    path: "/config/proGen/ancillary/chemicalFeed",
    category: "Ancillary (Inline)",
    regions: ["NAM", "EMEA"],
    frequencies: ["50Hz", "60Hz"],
    proposalTypes: [
      "packagedSystemLevel1QualifierFullProposal",
      "packagedSystemFirmProposal",
    ],
  },
  {
    id: "dpump",
    name: "Distribution Pump",
    unitopType: "distributionPump",
    prefix: "DPUMP",
    imageUrl: CF_new,
    path: "/config/proGen/ancillary/distributionPump",
    category: "Ancillary (Inline)",
    regions: ["NAM", "EMEA"],
    frequencies: ["50Hz", "60Hz"],
    proposalTypes: [
      "packagedSystemLevel1QualifierFullProposal",
      "packagedSystemFirmProposal",
    ],
  },
  {
    id: "uvlight",
    name: "UV Light",
    unitopType: "uvLight",
    prefix: "UV",
    imageUrl: uv,
    path: "/config/proGen/mobileEquipment/uVLight",
    category: "Ancillary (Inline)",
    regions: ["NAM"],
    frequencies: ["60Hz"],
    proposalTypes: [
      "packagedSystemLevel1QualifierFullProposal",
      "packagedSystemFirmProposal",
    ],
  },
  // Add more products as needed
];

// Helper function to transform products into UNITOP_CONFIG format
export const transformToUnitopConfig = (products) => {
  return products.reduce((config, product) => {
    config[product.unitopType] = {
      prefix: product.prefix,
      name: product.name,
      image: product.imageUrl,
      // storageKey: product.storageKey,
      // Store additional metadata
      category: product.category,
      regions: product.regions,
      frequencies: product.frequencies,
      proposalTypes: product.proposalTypes,
    };
    return config;
  }, {});
};

// Helper function to transform products for sidebar
export const transformForSidebar = (products) => {
  // Group products by category
  const grouped = products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push({
      title: product.name,
      onDragStart: "customnode_unitops",
      unitopType: product.unitopType,
      src: product.imageUrl,
      text: product.displayName,
      packagedSystemLevel1QualifierFullProposal: product.proposalTypes.includes(
        "packagedSystemLevel1QualifierFullProposal"
      ),
      packagedSystemFirmProposal: product.proposalTypes.includes(
        "packagedSystemFirmProposal"
      ),
      channelPartnerChannelPartnerProposal: product.proposalTypes.includes(
        "channelPartnerChannelPartnerProposal"
      ),
      region: product.regions,
      frequency: product.frequencies,
    });
    return acc;
  }, {});

  // Convert to array format for sidebar
  return Object.entries(grouped).map(([category, items]) => ({
    label: category,
    value: category,
    children: items,
  }));
};

/**
 * Map CPQ product model to unitop type
 */
export const mapCPQProductToUnitopType = (product) => {
  // Get product model from configAttributes
  const productModel = product.configAttributes?.productModel_allFamilies;

  const mapping = {
    cartridgeFilter: "cartridgeFilter",
    distributionPump: "distributionPump",
    chemicalFeed: "chemicalFeed",
    uvLight: "uvLight",
    CIP: "CIP",
  };

  return mapping[productModel] || productModel;
};

/**
 * Create canvas nodes from CPQ configured products
 */
//  In createNodesFromCPQProducts function
export const createNodesFromCPQProducts = (
  configuredProducts,
  unitopConfig,
  startX = 100,
  startY = 100,
  spacing = 250
) => {
  if (!configuredProducts || !Array.isArray(configuredProducts)) {
    console.error("configuredProducts must be an array");
    return { nodes: [], edges: [], currentFlowState: null };
  }

  if (!unitopConfig || typeof unitopConfig !== "object") {
    console.error("unitopConfig is undefined or invalid");
    return { nodes: [], edges: [], currentFlowState: null };
  }

  const nodes = [];
  const edges = [];

  //  RESET ID trackers at the start
  window.unitopIdTrackers = {};

  configuredProducts.forEach((product, index) => {
    const unitopType = mapCPQProductToUnitopType(product);

    if (!unitopType || !unitopConfig[unitopType]) {
      console.error(`Invalid unitop type: ${unitopType}`);
      return;
    }

    const config = unitopConfig[unitopType];

    //  Initialize tracker for this type if not exists
    if (!window.unitopIdTrackers[unitopType]) {
      window.unitopIdTrackers[unitopType] = [];
    }

    //  Use index + 1 directly for CPQ products
    const idNumber = index + 1;

    //  Only add to tracker, don't search for gaps
    window.unitopIdTrackers[unitopType].push(idNumber);

    const nodeId = `${unitopType}_${idNumber}`;
    const shortName = `${config.prefix}_${idNumber}`;
    console.log(product, nodeId);
    const unitopStorageKey = `unitop_${nodeId}`;
    const unitopData = {
      age: product.configAttributes?.baseModelMap_allFamilies,
      displayName: shortName,
      qty: product.configAttributes?.canvasQty_allFamilies || 1,
      id: unitopStorageKey,
      type: nodeId,
      // configuredViaCanvas: product.configuredViaCanvas || false,
      // fromCPQ: true,
      payloadData: product,
    };

    localStorage.setItem(unitopStorageKey, JSON.stringify(unitopData));
    localStorage.setItem(nodeId, shortName);

    console.log(` Created unitop: ${nodeId} -> ${shortName}`);

    const position = {
      x: startX + index * spacing,
      y: startY,
    };

    const node = {
      id: nodeId,
      type: "customnode_unitops",
      position: position,
      style: { width: "auto", height: "auto", zIndex: 5 },
      data: {
        label: shortName,
        displayName: shortName,
        unitopType: unitopType,
        config: config,
        // fromCPQ: true,
        unitopStorageKey: unitopStorageKey,
        // documentNumber: product.documentNumber,
        // transactionId: product.configAttributes?.transactionId_allFamilies,
      },
    };

    nodes.push(node);
  });

  //  Create edges using actual node indices
  for (let i = 0; i < nodes.length - 1; i++) {
    const sourceNode = nodes[i];
    const targetNode = nodes[i + 1];

    const edge = {
      id: `e${sourceNode.id}-${targetNode.id}`,
      source: sourceNode.id,
      target: targetNode.id,
      sourceHandle: "c",
      targetHandle: "a",
      type: "custom",
      animated: false,
      style: { stroke: "lightblue", strokeWidth: 2 },
      markerEnd: { type: "arrowclosed" },
      data: {
        text: i + 1,
        streamNum_dict: { [i + 1]: i + 1 },
        connection_number: true,
        source: sourceNode.id,
      },
    };

    edges.push(edge);
  }

  const currentFlowState = {
    elements: [...nodes, ...edges],
    connectionInfo: {},
    connectionInfo_source_target: {},
    edge_id_details: [],
    edges: edges,
    streamNum_dict: {},
    timestamp: Date.now(),
  };

  localStorage.setItem("currentFlowState", JSON.stringify(currentFlowState));

  return { nodes, edges, currentFlowState };
};
