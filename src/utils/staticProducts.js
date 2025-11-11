import { Chemical_Dosing, CF_new, uv, stripperImage } from "../assets/images";

// Static product data - replace this with API call later
export const staticProducts = [
  {
    id: "cartridgefilter",
    name: "Cartridge Filter",
    displayName: "Cartridge Filter",
    unitopType: "cartridgefilter",
    prefix: "CF",
    code: "CF",
    imageUrl: CF_new,
    category: "Ancillary (Inline)",
    regions: ["NAM", "EMEA"],
    frequencies: ["50Hz", "60Hz"],
    proposalTypes: [
      "packagedSystemLevel1QualifierFullProposal",
      "packagedSystemFirmProposal",
      "channelPartnerChannelPartnerProposal",
    ],
    storageKey: "cf-dict",
  },
  {
    id: "stripper",
    name: "Clean in Place (CIP)",
    displayName: "CIP",
    unitopType: "stripper",
    prefix: "STR",
    code: "STR",
    imageUrl: stripperImage,
    category: "Ancillary (Inline)",
    regions: ["NAM"],
    frequencies: ["50Hz", "60Hz"],
    proposalTypes: [
      "packagedSystemLevel1QualifierFullProposal",
      "packagedSystemFirmProposal",
    ],
    storageKey: "stripper-dict",
  },
  {
    id: "chemicaldosing",
    name: "Chemical Feed",
    displayName: "Chemical Feed",
    unitopType: "chemicaldosing",
    prefix: "Dose",
    code: "Dose",
    imageUrl: Chemical_Dosing,
    category: "Ancillary (Inline)",
    regions: ["NAM", "EMEA"],
    frequencies: ["50Hz", "60Hz"],
    proposalTypes: [
      "packagedSystemLevel1QualifierFullProposal",
      "packagedSystemFirmProposal",
    ],
    storageKey: "dosing-dict",
  },
  {
    id: "dpump",
    name: "Distribution Pump",
    displayName: "Distribution Pump",
    unitopType: "dpump",
    prefix: "DPUMP",
    code: "DPUMP",
    imageUrl: CF_new,
    category: "Ancillary (Inline)",
    regions: ["NAM", "EMEA"],
    frequencies: ["50Hz", "60Hz"],
    proposalTypes: [
      "packagedSystemLevel1QualifierFullProposal",
      "packagedSystemFirmProposal",
    ],
    storageKey: "dpump-dict",
  },
  {
    id: "uvlight",
    name: "UV Light",
    displayName: "UV Light",
    unitopType: "uvlight",
    prefix: "UV",
    code: "UV",
    imageUrl: uv,
    category: "Ancillary (Inline)",
    regions: ["NAM"],
    frequencies: ["60Hz"],
    proposalTypes: [
      "packagedSystemLevel1QualifierFullProposal",
      "packagedSystemFirmProposal",
    ],
    storageKey: "uv-dict",
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
      storageKey: product.storageKey,
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
    value: category.toLowerCase().replace(/\s+/g, "-"),
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
    cartridgeFilter: "cartridgefilter",
    distributionPump: "dpump",
    chemicalFeed: "chemicaldosing",
    uvLight: "uvlight",
    stripper: "stripper",
    cip: "stripper",
    stripper: "stripper",
    CIP: "stripper", // ← ADD THIS LINE
    cip: "stripper",
  };

  return (
    mapping[productModel] || productModel?.toLowerCase().replace(/\s+/g, "")
  );
};

/**
 * Create canvas nodes from CPQ configured products
 */
export const createNodesFromCPQProducts = (
  configuredProducts,
  unitopConfig,
  startX = 100,
  startY = 100,
  spacing = 250
) => {
  const nodes = [];
  const edges = [];

  if (!window.unitopIdTrackers) {
    window.unitopIdTrackers = {};
  }

  configuredProducts.forEach((product, index) => {
    const unitopType = mapCPQProductToUnitopType(product);
    const config = unitopConfig[unitopType];

    if (!config) {
      console.warn(`No configuration found for unitop type: ${unitopType}`);
      return;
    }

    if (!window.unitopIdTrackers[unitopType]) {
      window.unitopIdTrackers[unitopType] = [];
    }

    let idNumber = 1;
    const existingIds = window.unitopIdTrackers[unitopType];
    if (existingIds.length > 0) {
      existingIds.sort((a, b) => a - b);
      for (let i = 0; i < existingIds.length; i++) {
        if (idNumber === existingIds[i]) {
          idNumber++;
        } else {
          break;
        }
      }
    }

    window.unitopIdTrackers[unitopType].push(idNumber);
    const nodeId = `${unitopType}_${idNumber}`;

    // Get base model name
    const baseModel =
      product.configAttributes?.baseModelMap_allFamilies ||
      product.configAttributes?.coreProduct_PROflex ||
      `${config.prefix}_${idNumber}`;

    localStorage.setItem(nodeId, baseModel);

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
        label: baseModel,
        unitopType: unitopType,
        config: config,
        documentNumber: product.documentNumber,
        transactionId: product.configAttributes?.transactionId_allFamilies,
        cDSProductIndex: product.configAttributes?.cDSProductIndex_allFamilies,
        frequency: product.configAttributes?.frequency_family?.value,
        region: product.configAttributes?.region_allFamilies?.value,
        currency: product.configAttributes?.currency_allFamilies?.value,
        salesOrg: product.configAttributes?.salesOrg_allFamilies?.value,
        productFamily: product.configAttributes?.productFamily_allFamilies,
        productLine: product.configAttributes?.productLine_allFamilies,
        configAttributes: product.configAttributes,
        cpqProduct: product,
      },
    };

    nodes.push(node);

    // Create edge to next node
    if (index < configuredProducts.length - 1) {
      const nextProduct = configuredProducts[index + 1];
      const nextUnitopType = mapCPQProductToUnitopType(nextProduct);

      // Calculate next node ID
      let nextIdNumber = 1;
      if (window.unitopIdTrackers[nextUnitopType]) {
        const nextIds = window.unitopIdTrackers[nextUnitopType];
        nextIdNumber = nextIds.length > 0 ? Math.max(...nextIds) + 1 : 1;
      }

      const nextNodeId = `${nextUnitopType}_${nextIdNumber}`;

      const edge = {
        id: `e${nodeId}-${nextNodeId}`,
        source: nodeId,
        target: nextNodeId,
        sourceHandle: "c",
        targetHandle: "a",
        type: "custom",
        animated: false,
        style: { stroke: "lightblue", strokeWidth: 2 },
        markerEnd: { type: "arrowclosed" },
        data: {
          text: index + 1,
          streamNum_dict: { [index + 1]: index + 1 },
          connection_number: true,
          source: nodeId,
        },
      };

      edges.push(edge);
    }
  });

  return { nodes, edges };
};
