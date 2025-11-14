import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import ReactFlow, {
  addEdge,
  Handle,
  ReactFlowProvider,
  Background,
  ControlButton,
  Controls,
  useNodesState,
  useEdgesState,
  MarkerType,
  useStoreApi,
  updateEdge,
} from "reactflow";
import {
  Box,
  Backdrop,
  CircularProgress,
  Switch,
  styled,
  Button,
  IconButton,
  Tooltip,
  Grid,
  Modal as MuiModal,
} from "@mui/material";
import $ from "jquery";
import "../Validation.css";
import "./style.scss";
import "../dnd.scss";
import "reactflow/dist/style.css"; // Added CSS version 11 import statement
import {
  checkExitsLocalStorageValue,
  defaultModalOptions,
  getBorderColor,
} from "../../utils";
import { CustomEdge } from "../CustomEdge";
import NotificationModal from "../../components/common/modal";
import UnitopComponent from "../../components/common/unitop/UnitopComponent";
import {
  createNodesFromCPQProducts,
} from "../../utils/staticProducts";
import UnitopModalComponent from "../../components/common/UnitopModalComponent";
import { unitopJSONData } from "../../db/unitopJSONData";
import RightSidebar from "../../components/layout/sidebar/RightsideBar";
import { Rnd } from "react-rnd";
import Loader from "../../components/common/Loader";
import ErrorModal from "../../components/common/modal/error-modal";
import Sidebar from "../../components/layout/sidebar/Sidebar";
import DownloadFlowsheet from "../../components/common/DownloadFlowsheet";
// import { useTranslation } from "react-i18next";

const unitopsErrorLabel = {
  cartridgeFilter: "Cartridge Filter",
  CIP: "CIP",
  chemicalFeed: "Chemical Feed",
  distributionPump: "Distribution Pump",
  uvLight: "uVLight",
  proflex: "PROflex",
};
// vinod added dynamically path to check fn
function getProductTypeFromNode(nodeType) {
  console.log(nodeType);
  const NODE_MAPPING = {
    cartridgeFilter: "configproGen.filtration.cartridgeFilter",
    CIP: "configproGen.filtration.CIP",
    chemicalFeed: "configproGen.ancillary.chemicalFeed",
    distributionPump: "configproGen.ancillary.distributionPump",
    uVLight: "configproGen.mobileEquipment.uVLight",
    proflex: "configflexConfigurator.flexConfigurator.proflex",
    zPakR: "configproGen.membraneFilteration.zPakR",
  };

  return NODE_MAPPING[nodeType];
}
let unitop_source = [];
let unitop_target = [];
let unitop_edge = [];
let connectionInfo = {};
let connectionInfo_source_target = {};
let streamNum_dict = {};

let edge_id_details = [];
let edge_details_SaveFiles = [];

let node1 = [];

let c_anuj = [];

let del_element_check = 0;

let handleClickStr = "";
let updateconnectionInfoDelete = false;

// GET WINDOW SCREEN WIDTH
function getScreenWidth() {
  const { innerWidth } = window;
  return innerWidth;
}
// GET WINDOW SCREEN HEIGHT
function getScreenHeight() {
  const { innerHeight } = window;
  return innerHeight;
}
function Flow({ UNITOP_CONFIG, setAutoSizeHandler }) {
  const initialElements = [];
  const initialEdges = [];
  // upgraded version 11 elements changes
  const [elements, setElements, onNodesChange] = useNodesState(initialElements);
  // upgaraded version 11 Edge changes
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [width_canvas, setWidth_canvas] = useState(
    Number(getScreenWidth() - 210)
  );
  const [height_canvas, setHeight_canvas] = useState(
    Number(getScreenHeight() - 150)
  );
  const [edgeText, setEdgeText] = useState(0);
  const [, setClonedEdgeText] = useState(0);
  const [modalOption, setModalOption] = useState(defaultModalOptions);

  // from lhs sequence it will adding here
  const [connectionOrderState, setConnectionOrderState] = useState([]);
  const [rfInstance, setRfInstance] = useState(null);
  const [flowIndex, setFlowIndex] = useState(1); // instead of let flowIndex = 1
  const [cpqBtnLoader, setCpqBtnLoader] = useState(false);

  const [errorModal, setErrorModal] = useState(false);
  const [errorModalDetails, setErrorModalDetails] = useState([]);

  const [unitopVisible, setUnitopVisible] = useState(false);
  const [unitopDetails, setUnitopDetails] = useState({});

  // for image download automatically
  const [triggerDownload, setTriggerDownload] = React.useState(false);

  // auto size functionality added this
  const [targetOutput, setTargetOutput] = useState(
    () => JSON.parse(localStorage.getItem("target_output")) || 0
  );
  const [autoSizeUpdate, setAutoSizeUpdate] = useState(() => {
    return localStorage.getItem("autoSizeUpdate") === "true";
  });
  // auto size functionality added this
  const [autoSizeValue, setAutoSizeValue] = useState(targetOutput);
  const [autoSizeLoader, setAutoSizeLoader] = useState(false);
  // Parent component
  const [autoSizeConfiguredData, setAutoSizeConfiguredData] = useState({});
  const [autoSizeCalculation, setAutoSizeCalculation] = useState(() => {
    return JSON.parse(localStorage.getItem("autoSizecalcultionValue")) || [];
  });

  const [defaultCalculation, setDefaultCalculation] = useState("GPM");
  // add data to cpq then model showing in modal
  const [addDataCurrentModel, setAddDataCurrentModel] = useState([]);

  // reconfiguring data here
  const [cpqData, setCpqData] = useState(null);
  const [configurationData, setConfigurationData] = useState(null);
  const [transactionCPQDataNew, setTransactionCPQDataNew] = useState({});

  const [unitopDataCache, setUnitopDataCache] = useState({}); // Add this
  // Add state to force re-render:
  const [refreshKey, setRefreshKey] = useState(0);
  const [forceupdate, setForceupdate] = useState(0);
  const reactFlowWrapper = useRef(null);
  // Use refs to avoid dependency issues
  const cacheRef = useRef(unitopDataCache);
  const autoSizeRef = useRef(autoSizeCalculation);
  // Fix 1: Use useLayoutEffect to ensure data loads before render
  React.useLayoutEffect(() => {
    console.log(" Loading unitop data, refreshKey:", refreshKey);
    console.log(" connectionOrderState:", connectionOrderState);

    const newCache = {};

    // Make sure connectionOrderState exists and has items
    if (!connectionOrderState || connectionOrderState.length === 0) {
      console.warn(" connectionOrderState is empty!");
      return;
    }

    connectionOrderState.forEach((nodeId) => {
      const key = `unitop_${nodeId}`;
      const data = localStorage.getItem(key);

      console.log(`  Reading ${key}:`, data ? "Found" : "Not found");

      if (data) {
        try {
          const parsed = JSON.parse(data);
          newCache[nodeId] = parsed;
          console.log(`    Loaded ${nodeId}:`, {
            hasPayloadData: !!parsed.payloadData,
            age: parsed.age,
          });
        } catch (e) {
          console.error(`  ❌ Error parsing ${nodeId}:`, e);
        }
      }
    });

    console.log(" Setting cache with keys:", Object.keys(newCache));
    setUnitopDataCache(newCache);
  }, [refreshKey,connectionOrderState.length]); // Add length as dependency
  useEffect(() => {
    cacheRef.current = unitopDataCache;
    setForceupdate((prev) => prev + 1);
  }, [unitopDataCache]);

  useEffect(() => {
    autoSizeRef.current = autoSizeCalculation;
  }, [autoSizeCalculation]);

  //  Define normalizeType at the top
  const normalizeType = (val) =>
    val?.replace(/^customnode_/, "").replace(/^node_/, "");

  //  Load saved transaction data ONCE on mount
  useEffect(() => {
    const savedData = localStorage.getItem("transactionCPQData");
    if (savedData) {
      try {
        setTransactionCPQDataNew(JSON.parse(savedData));
      } catch (error) {
        console.error("Error loading transaction data:", error);
      }
    }
  }, []);

  //  Save to localStorage whenever transactionCPQDataNew changes
  useEffect(() => {
    if (
      transactionCPQDataNew &&
      Object.keys(transactionCPQDataNew).length > 0
    ) {
      localStorage.setItem(
        "transactionCPQData",
        JSON.stringify(transactionCPQDataNew)
      );
    }
  }, [transactionCPQDataNew]);

  //  Remove border animation after render
  useEffect(() => {
    if (transactionCPQDataNew[cpqData?.transactionId]) {
      transactionCPQDataNew[cpqData.transactionId].forEach((item) => {
        getBorderColor(item?.type);
      });
    }
  }, [transactionCPQDataNew, cpqData?.transactionId]);
  //  Updated mergeIntoTransaction
  const mergeIntoTransaction = useCallback(
    (cpqData, mode, id, setTransactionCPQDataNew, uData) => {
      console.log("mergeIntoTransaction:", cpqData, mode, id, uData);

      const cpqDataKey = localStorage.getItem("cpq-data-key");
      const parsedCpqData = cpqDataKey ? JSON.parse(cpqDataKey) : null;
      const transactionKey =
        parsedCpqData?.transactionId || cpqData.transactionId;

      if (!transactionKey) return;

      if (uData?.id || mode === "cpqPreload") {
        setTransactionCPQDataNew((prevState) => {
          const existingArray1 = prevState[transactionKey]
            ? [...prevState[transactionKey]]
            : [];

          // Case-insensitive match by type
          const existingIndex = existingArray1.findIndex(
            (item) => item.type === uData.type
          );

          if (existingIndex !== -1) {
            // UPDATE existing
            existingArray1[existingIndex] = {
              ...existingArray1[existingIndex],
              ...uData,
            };
            console.log(" Updated unitop:", uData.type);
          } else {
            // ADD new
            existingArray1.push(uData);
            console.log(" Added new unitop:", uData.type);
          }

          existingArray1.forEach((item) => {
            return getBorderColor(item?.type);
          });

          //  Sort by connectionOrderState using FULL type (with suffix)
          if (
            Array.isArray(connectionOrderState) &&
            connectionOrderState.length > 0
          ) {
            console.log(
              "Sorting by connectionOrderState:",
              connectionOrderState
            );

            existingArray1.sort((a, b) => {
              // Use the full type as-is (e.g., "cartridgefilter_1")
              const typeA = a.type;
              const typeB = b.type;

              // Find index in connectionOrderState
              const aIndex = connectionOrderState.findIndex(
                (item) => item === typeA
              );
              const bIndex = connectionOrderState.findIndex(
                (item) => item === typeB
              );

              console.log(
                `Comparing ${a.type} (index: ${aIndex}) vs ${b.type} (index: ${bIndex})`
              );

              return (
                (aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex) -
                (bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex)
              );
            });

            console.log(
              " Sorted array:",
              existingArray1.map((item) => `${item.type}: ${item.age}`)
            );
          }

          return { [transactionKey]: existingArray1 };
        });
      }
    },
    [connectionOrderState]
  );

  // Add useEffect to re-sort when connectionOrderState changes
  //  Re-sort transactionCPQData when connectionOrderState changes
  useEffect(() => {
    const cpqDataKey = localStorage.getItem("cpq-data-key");
    if (!cpqDataKey) return;

    try {
      const parsedCpqData = JSON.parse(cpqDataKey);
      const transactionKey = parsedCpqData?.transactionId;

      if (transactionKey && connectionOrderState?.length > 0) {
        setTransactionCPQDataNew((prevState) => {
          const existingArray = prevState[transactionKey];

          if (!existingArray || existingArray.length === 0) return prevState;

          const sortedArray = [...existingArray].sort((a, b) => {
            const typeA = a.type;
            const typeB = b.type;

            const aIndex = connectionOrderState.findIndex(
              (item) => item === typeA
            );
            const bIndex = connectionOrderState.findIndex(
              (item) => item === typeB
            );

            return (
              (aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex) -
              (bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex)
            );
          });

          console.log(
            " Re-sorted by connectionOrderState:",
            sortedArray.map((item) => `${item.type}: ${item.age}`)
          );
          return { ...prevState, [transactionKey]: sortedArray };
        });
      }
    } catch (error) {
      console.error("Error re-sorting transactionCPQData:", error);
    }
  }, [connectionOrderState]);
  //  Message handler
  useEffect(() => {
    const handleMessage = (event) => {
      const eventDataFromCPQ = event.data;

      if (
        !eventDataFromCPQ ||
        eventDataFromCPQ.type === "webpackWarnings" ||
        eventDataFromCPQ.type === "webpackOk"
      ) {
        return;
      }

      if (event.origin !== "https://watertechnologiesdev.bigmachines.com") {
        return;
      }

      let jsonConvertedEventDataFromCPQ;
      if (typeof eventDataFromCPQ === "string") {
        try {
          jsonConvertedEventDataFromCPQ = JSON.parse(eventDataFromCPQ);
        } catch {
          return;
        }
      } else {
        jsonConvertedEventDataFromCPQ = eventDataFromCPQ;
      }

      console.log("Received CPQ message:", jsonConvertedEventDataFromCPQ);

      const productIndexVal = jsonConvertedEventDataFromCPQ.productIndex;
      const lastunitopData = localStorage.getItem("lastUnitop");
      const lastUnitopType = localStorage.getItem("lastUnitopType");

      if (productIndexVal != null) {
        //  UNITOP CONFIGURATION - Always use original transaction ID
        const cpqDataKey = localStorage.getItem("cpq-data-key");
        const parsedCpqData = cpqDataKey ? JSON.parse(cpqDataKey) : null;
        const originalTransactionId = parsedCpqData?.transactionId;

        if (!originalTransactionId) {
          console.error("No transaction ID found in cpq-data-key");
          return;
        }

        const getData = JSON.parse(jsonConvertedEventDataFromCPQ?.productData);

        const updatedUnitop = {
          age:
            getData?.configAttributes?.baseModelMap_allFamilies ||
            getData?.configAttributes?.coreProduct_PROflex,
          qty: getData?.configAttributes?.canvasQty_allFamilies,
          payloadData: {
            ...jsonConvertedEventDataFromCPQ,
            transactionId: originalTransactionId,
          },
          id: lastunitopData,
          type: lastUnitopType,
        };

        localStorage.setItem(lastunitopData, JSON.stringify(updatedUnitop));

        mergeIntoTransaction(
          {
            ...jsonConvertedEventDataFromCPQ,
            transactionId: originalTransactionId,
          },
          "unitops",
          lastunitopData,
          setTransactionCPQDataNew,
          updatedUnitop
        );
      } else if (jsonConvertedEventDataFromCPQ?.products) {
        localStorage.setItem(
          "cpq-data-key",
          typeof eventDataFromCPQ === "string"
            ? eventDataFromCPQ
            : JSON.stringify(eventDataFromCPQ)
        );

        const arr =
          typeof eventDataFromCPQ === "string"
            ? JSON.parse(eventDataFromCPQ)
            : eventDataFromCPQ;
        const newArr = JSON.parse(arr?.products);

        const selections = newArr?.configuredProducts?.map(
          (d) => `transactionLine/${d.documentNumber}`
        );
        localStorage.setItem("selections", JSON.stringify(selections));

        setCpqData(jsonConvertedEventDataFromCPQ);
        setConfigurationData(newArr);

        const transactionId = jsonConvertedEventDataFromCPQ.transactionId;
        if (transactionId && newArr?.configuredProducts) {
          const currentState = JSON.parse(
            localStorage.getItem("currentFlowState")
          );
          const canvasElements = currentState?.elements || [];

          const existingProducts = newArr.configuredProducts.map(
            (product, index) => {
              const productData = product.configAttributes || {};
              const productIndex = String(index + 1);
              const productModel = productData.productModel_allFamilies;

              //  Find matching canvas element by checking localStorage for matching productIndex
              let matchingElement = null;

              for (const element of canvasElements) {
                const storedData = localStorage.getItem(element.id);
                if (storedData) {
                  try {
                    const parsed = JSON.parse(storedData);
                    const storedProductIndex =
                      parsed.payloadData?.productIndex || parsed.productIndex;
                    if (storedProductIndex === productIndex) {
                      matchingElement = element;
                      break;
                    }
                  } catch (e) {}
                }
              }

              //  Use canvas element id and type if found
              const unitopId =
                matchingElement?.id ||
                `unitop_${productModel || "unknown"}_${productIndex}`;
              const unitopType =
                matchingElement?.id ||
                `${productModel || "unknown"}_${productIndex}`;

              return {
                age:
                  productData.baseModelMap_allFamilies ||
                  productData.coreProduct_PROflex ||
                  "Unknown Product",
                qty: productData.canvasQty_allFamilies || 1,
                payloadData: {
                  transactionId: transactionId,
                  region: jsonConvertedEventDataFromCPQ.region,
                  salesOrg: jsonConvertedEventDataFromCPQ.salesOrg,
                  currency: jsonConvertedEventDataFromCPQ.currency,
                  productIndex: productIndex,
                  productData: JSON.stringify(product),
                  frequency: productData.frequency_family?.value || "60Hz",
                  source: "cpqPreload",
                },
                id: unitopId,
                type: unitopType, //  Set proper type from canvas or generate
                connectedTo: null,
                productIndex: productIndex,
              };
            }
          );

          setTransactionCPQDataNew({
            [transactionId]: existingProducts,
          });

          console.log(
            "Loaded CPQ products with types:",
            existingProducts.map((p) => ({ type: p.type, id: p.id }))
          );
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [mergeIntoTransaction]);

  //  SINGLE UNIFIED EFFECT to process configurationData
  const hasProcessedConfigRef = useRef(false);

  useEffect(() => {
    if (!configurationData) return;
    if (Object.keys(UNITOP_CONFIG).length === 0) return;

    const products = configurationData?.configuredProducts ?? [];
    if (products.length === 0) return;

    const cpqDataRaw = localStorage.getItem("cpq-data-key");
    if (!cpqDataRaw) return;

    try {
      const baseCpqData = JSON.parse(cpqDataRaw);
      const transactionId = baseCpqData.transactionId;

      const configId = products.map((p) => p.documentNumber).join("-");

      if (lastProcessedTransactionRef.current === configId) {
        console.log("Configuration already processed:", configId);
        return;
      }

      console.log("Processing CPQ configuration:", transactionId);
      lastProcessedTransactionRef.current = configId;

      //  Clear ALL unitop-related keys from localStorage
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          // Remove unitop_ keys
          if (key.startsWith("unitop_")) {
            keysToRemove.push(key);
          }
          // Remove type_number keys (e.g., cartridgefilter_1)
          else if (key.includes("_") && !key.includes("-")) {
            const unitopType = key.split("_")[0];
            if (UNITOP_CONFIG[unitopType]) {
              keysToRemove.push(key);
            }
          }
        }
      }

      console.log("🗑️ Removing keys:", keysToRemove);
      keysToRemove.forEach((key) => localStorage.removeItem(key));

      //  Reset ID trackers
      window.unitopIdTrackers = {};

      // Create nodes from CPQ products
      const { nodes, edges: cpqEdges } = createNodesFromCQProducts(
        products,
        UNITOP_CONFIG,
        100,
        100,
        250
      );

      console.log(
        " Created nodes:",
        nodes.map((n) => n.id)
      );
      console.log(
        " Created edges:",
        cpqEdges.map((e) => e.id)
      );

      // Rest of your code...
    } catch (e) {
      console.error("Error processing configurationData", e);
    }
  }, [configurationData, UNITOP_CONFIG]);

  //  Reset processing flag when transaction changes
  useEffect(() => {
    if (cpqData?.transactionId) {
      hasProcessedConfigRef.current = false;
    }
  }, [cpqData?.transactionId]);

  // Store both elements and edges
  useEffect(() => {
    // resetVariable();
    // removeItemFromLocalStorage();
    window.onbeforeunload = () => {
      const cf_keys = [];
      const cf_dict_final = JSON.parse(localStorage.getItem("cf-dict")) || {};
      // removeItemFromLocalStorage();
      // if (localStorage.getItem("db_version")) {
      //   localStorage.removeItem("db_version");
      // }
      if (Object.keys(cf_dict_final).length > 0) {
        Object.entries(cf_dict_final.cf).forEach(([key]) => {
          cf_keys.push(key);
        });
        for (let i = 0; i < cf_keys.length; i++) {
          localStorage.removeItem(`${cf_keys[i]}-key`);
        }
      }
    };
    return () => {
      window.onbeforeunload = null;
    };
  }, []);

  // 1. LOAD on mount (runs once)
  useEffect(() => {
    const savedFlowState = localStorage.getItem("currentFlowState");

    if (savedFlowState) {
      try {
        const flowState = JSON.parse(savedFlowState);

        if (
          Array.isArray(flowState.elements) &&
          flowState.elements.length > 0
        ) {
          setElements(
            flowState.elements.map((el) => ({
              ...el,
              position: el.position || { x: 0, y: 0 },
            }))
          );
        }

        if (Array.isArray(flowState.edges) && flowState.edges.length > 0) {
          setEdges(
            flowState.edges.map((edge) => ({
              ...edge,
              data: {
                ...edge.data,
                setEdgeText,
                // handleChangeEdgeText,
                setModalOption,
                // setChecked,
              },
            }))
          );
        }
      } catch (error) {
        console.error("Failed to restore flow state:", error);
        restoreFlowFromCPQ();
      }
    } else {
      restoreFlowFromCPQ();
    }
  }, []);

  // 2. SAVE effect - only save when elements/edges actually exist
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // In your save effect:
  useEffect(() => {
    // Don't save during initial load or if both are empty
    if (isInitialLoad || (elements.length === 0 && edges.length === 0)) {
      return;
    }

    const flowState = {
      elements,
      edges,
      connectionInfo,
      connectionInfo_source_target,
      streamNum_dict,
      edge_id_details,
      timestamp: Date.now(),
    };

    localStorage.setItem("currentFlowState", JSON.stringify(flowState));
    console.log("Saved flow state:", flowState);
  }, [elements, edges]); // Remove connectionOrderState dependency

  // 3. Keep your auto-edge creation effect as-is
  const firstRender = useRef(true);
  const isAutoConnectEdgesFromCPQ = useRef(false); // Only auto-connect when loading from CPQ

  useEffect(() => {
    if (
      firstRender.current &&
       isAutoConnectEdgesFromCPQ.current && // ← Only auto-connect when loading from CPQ
      elements.length > 1 &&
      edges.length === 0
      // configurationData?.configuredProducts?.length > 1
    ) {
      const autoEdges = [];
      for (let i = 0; i < elements.length - 1; i++) {
        const pair = `${elements[i].id}-${elements[i + 1].id}`;
        const edgeItem = {
          id: `e${pair}`,
          source: elements[i].id,
          target: elements[i + 1].id,
          sourceHandle: "c",
          targetHandle: "a",
        };
        autoEdges.push(createEdge(edgeItem, i));
      }
      setEdges(autoEdges);
      firstRender.current = false;
      isAutoConnectEdgesFromCPQ.current = false; // Reset
    }
  }, [elements]);

  // Reusable edge creation function
  const createEdge = (edgeItem, index) => {
    const edge = {
      id: edgeItem.id || `e${edgeItem.source}-${edgeItem.target}`,
      source: edgeItem.source,
      target: edgeItem.target,
      sourceHandle: edgeItem.sourceHandle || "c",
      targetHandle: edgeItem.targetHandle || "a",
      type: "custom",
      animated: false,
      style: { stroke: "lightblue", strokeWidth: 2 },
      markerEnd: { type: "arrowclosed" },
      data: {
        text: index + 1,
        streamNum_dict: {},
        connection_number: false,
        setEdgeText,
        // handleChangeEdgeText,
        source: edgeItem.source,
        setModalOption,
        // setChecked,
      },
    };

    connectionInfo[edge.source + edge.sourceHandle] = edge.sourceHandle;
    connectionInfo[edge.target + edge.targetHandle] = edge.targetHandle;
    connectionInfo_source_target[edge.source] = edge.target;

    edge_id_details.push(edge);
    edge_details_SaveFiles.push(edge);

    return edge;
  };

  // Restore flow from CPQ data
  const restoreFlowFromCPQ = useCallback(() => {
    if (!configurationData || !configurationData.configuredProducts) {
      console.log("No CPQ data to restore");
      setElements([]);
      setEdges([]);
      return;
    }

    console.log("Restoring flow from CPQ data:", configurationData);
// Set flag to enable auto-connection
  isAutoConnectEdgesFromCPQ.current = true;
    // Create nodes and edges from CPQ products
    const { nodes, edges: cpqEdges } = createNodesFromCPQProducts(
      configurationData.configuredProducts,
      UNITOP_CONFIG,
      100, // startX
      100, // startY
      250 // spacing between nodes
    );

    console.log("Created nodes:", nodes);
    console.log("Created edges:", cpqEdges);

    // Set elements and edges
    setElements(nodes);
    setEdges(
      cpqEdges.map((edge, index) => ({
        ...edge,
        data: {
          ...edge.data,
          setEdgeText,
          setModalOption,
        },
      }))
    );

    // Update connection info
    cpqEdges.forEach((edge) => {
      connectionInfo[edge.source + edge.sourceHandle] = edge.sourceHandle;
      connectionInfo[edge.target + edge.targetHandle] = edge.targetHandle;
      connectionInfo_source_target[edge.source] = edge.target;
    });
  }, [configurationData, UNITOP_CONFIG]);

  useEffect(() => {
    if (Object.keys(UNITOP_CONFIG).length === 0) return;

    const savedFlowState = localStorage.getItem("currentFlowState");

    if (savedFlowState) {
      try {
        const flowState = JSON.parse(savedFlowState);

        if (
          Array.isArray(flowState.elements) &&
          flowState.elements.length > 0
        ) {
          console.log("Restoring from saved flow state");
           // Check if this is CPQ data (has edges already)
        if (flowState.edges && flowState.edges.length > 0) {
          isAutoConnectEdgesFromCPQ.current = false; // Has edges, don't auto-connect
        } else {
          isAutoConnectEdgesFromCPQ.current = true; // No edges, allow auto-connect
        }
          setElements(
            flowState.elements.map((el) => ({
              ...el,
              position: el.position || { x: 0, y: 0 },
            }))
          );

          if (Array.isArray(flowState.edges) && flowState.edges.length > 0) {
            setEdges(
              flowState.edges.map((edge) => ({
                ...edge,
                data: {
                  ...edge.data,
                  setEdgeText,
                  setModalOption,
                },
              }))
            );
          }

          // Mark initial load as complete
          setTimeout(() => setIsInitialLoad(false), 100);
        } else {
          restoreFlowFromCPQ();
          setTimeout(() => setIsInitialLoad(false), 100);
        }
      } catch (error) {
        console.error("Failed to restore flow state:", error);
        restoreFlowFromCPQ();
        setTimeout(() => setIsInitialLoad(false), 100);
      }
    } else {
      restoreFlowFromCPQ();
      setTimeout(() => setIsInitialLoad(false), 100);
    }
  }, [UNITOP_CONFIG]); // Remove configurationData dependency

  function getChains(elements, edges) {
    const visited = new Set();
    const chains = [];
    function dfsChain(nodeId, chain) {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      chain.push(nodeId);
      const nextEdges = edges.filter((e) => e.source === nodeId);
      nextEdges.forEach((e) => dfsChain(e.target, chain));
    }

    const targets = new Set(edges.map((e) => e.target));
    const starts = elements.filter(
      (el) => edges.some((e) => e.source === el.id) && !targets.has(el.id)
    );

    // Build chains from start nodes
    starts.forEach((start) => {
      const chain = [];
      dfsChain(start.id, chain);
      chains.push(chain);
    });

    // Visit remaining connected nodes not yet visited
    elements.forEach((el) => {
      const hasOutgoing = edges.some((e) => e.source === el.id);
      if (hasOutgoing && !visited.has(el.id)) {
        const chain = [];
        dfsChain(el.id, chain);
        chains.push(chain);
      }
    });

    // Add disconnected nodes as single-item chains
    // Instead of pushing disconnected nodes blindly at the end
    const disconnectedChains = [];
    elements.forEach((el) => {
      if (!visited.has(el.id)) {
        const chain = [];
        dfsChain(el.id, chain);
        disconnectedChains.push(chain);
      }
    });

    // Merge: LHS first, then disconnected chains
    console.log("disconnectedChains", disconnectedChains);
    // return [...chains.flat(), ...disconnectedChains.flat()];

    // this check is if unitop is one then we do auto size we din't get connectionOrderState update,
    //  so here we checking if only one unitop then based on elements.length if it is 1 then this condition execute
    if (elements?.length === 1) {
      return disconnectedChains;
    } else {
      return chains;
    }
  }

  function getFixedOrder(elements, edges) {
    const chains = getChains(elements, edges);
    const targets = new Set(edges.map((e) => e.target));
    // Identify LHS chain
    let lhsChain = chains.find((chain) => !targets.has(chain[0]));
    if (!lhsChain) {
      lhsChain = chains[0]; // fallback
    }

    const otherChains = chains.filter((chain) => chain !== lhsChain);
    // Merge: LHS first, RHS second
    return lhsChain ? [...lhsChain, ...otherChains.flat()] : chains.flat();
  }

  function updateEdgesWithChainLabels(elements, edges) {
    const chains = getChains(elements, edges).filter(Boolean); // remove undefined/null chains
    const targets = new Set(edges.map((e) => e.target));

    // Identify LHS chain
    let lhsChain = chains.find(
      (chain) => Array.isArray(chain) && !targets.has(chain[0])
    );
    if (!lhsChain) lhsChain = chains[0] || [];

    const otherChains = chains.filter((chain) => chain !== lhsChain);

    const mergedChains = [lhsChain, ...otherChains].filter(Boolean);
    const updatedEdges = [];
    let labelCounter = 1;

    mergedChains.forEach((chain) => {
      if (!Array.isArray(chain)) return; // skip invalid chains
      chain.forEach((nodeId) => {
        const edge = edges.find((e) => e.source === nodeId);
        if (edge) {
          updatedEdges.push({
            ...edge,
            data: {
              ...edge.data,
              text: labelCounter,
            },
          });
          labelCounter++;
        }
      });
    });

    return updatedEdges;
  }

  // Effect 1: update connection order and edge labels when elements/edges change
  useEffect(() => {
    const newOrder = getFixedOrder(elements, edges);
    setConnectionOrderState([...newOrder]);

    const updatedEdges = updateEdgesWithChainLabels(elements, edges);

    if (JSON.stringify(updatedEdges) !== JSON.stringify(edges)) {
      setEdges(updatedEdges);
    }
  }, [elements, edges]);

  // 1️ configurationData effect - FIXED to preserve existing positions
  useEffect(() => {
    if (isInitialLoad) return;
    if (!configurationData) return;
    const products = configurationData?.configuredProducts ?? [];
    if (products.length === 0) return;

    console.log(products, "original order");

    //  FIX: Pass UNITOP_CONFIG and destructure the result
    const { nodes: nodesFromConfig, edges: edgesFromConfig } =
      createNodesFromCPQProducts(
        products,
        UNITOP_CONFIG, //  Make sure UNITOP_CONFIG is imported/defined
        100,
        100,
        250
      );

    //  FIX: Check if nodes were created
    if (!nodesFromConfig || nodesFromConfig.length === 0) {
      console.warn("No nodes created from CPQ products");
      return;
    }

    const deletedIds = JSON.parse(
      localStorage.getItem("deletedUnitops") || "[]"
    );

    const filteredPrev = elements.filter(
      (el) => !deletedIds.includes(el.data?.storageKey)
    );

    const filteredPrevWithoutNewNodes = filteredPrev.filter(
      (el) => !nodesFromConfig.some((n) => n.id === el.id)
    );

    const mergedElements = [];

    // Add new nodes from config
    nodesFromConfig.forEach((newNode) => {
      mergedElements.push(newNode);
    });

    // Add existing nodes, preserving their current positions and data
    filteredPrevWithoutNewNodes.forEach((existingNode) => {
      const matchingConfigNode = nodesFromConfig.find((configNode) => {
        return configNode.id === existingNode.id;
      });
      if (matchingConfigNode) {
        mergedElements.push({
          ...matchingConfigNode,
          position: existingNode.position,
          selected: existingNode.selected,
          dragging: existingNode.dragging,
          animated: existingNode.animated,
          height: existingNode.height,
          width: existingNode.width,
          positionAbsolute: existingNode.positionAbsolute,
        });
      } else {
        mergedElements.push(existingNode);
      }
    });

    console.log(
      "Merged elements preserving positions:",
      mergedElements.map((el) => ({ id: el.id, x: el.position.x }))
    );
    setElements(mergedElements);

    //  FIX: Merge edges from CPQ with existing edges
    if (edgesFromConfig && edgesFromConfig.length > 0) {
      setEdges((prev) => {
        // Remove duplicate edges
        const existingEdgeIds = new Set(prev.map((e) => e.id));
        const newEdges = edgesFromConfig.filter(
          (e) => !existingEdgeIds.has(e.id)
        );
        return [...prev, ...newEdges];
      });
    }

    // Create edge for new nodes only
    const actuallyNewNodes = nodesFromConfig.filter(
      (newNode) => !elements.some((existingEl) => existingEl.id === newNode.id)
    );

    if (actuallyNewNodes.length && filteredPrevWithoutNewNodes.length) {
      const newNodeId = actuallyNewNodes[0].id;
      const firstOldNodeId = filteredPrevWithoutNewNodes[0].id;
      if (firstOldNodeId && firstOldNodeId !== newNodeId) {
        const newEdge = createEdge(
          {
            source: newNodeId,
            target: firstOldNodeId,
            sourceHandle: "c",
            targetHandle: "a",
          },
          edges.length
        );
        setEdges((prev) => [...prev, newEdge]);
      }
    }
  }, [configurationData, isInitialLoad]);

  // 2️ Keep connectionOrderState in sync
  useEffect(() => {
    if (!elements.length) return;
    const newOrder = getFixedOrder(elements, edges).map(normalizeType);
    setConnectionOrderState([...newOrder]);
  }, [elements, edges]);

  // 3️ Reorder elements and update transactionCPQDataNew
  useEffect(() => {
    if (
      !elements.length ||
      !connectionOrderState.length ||
      !transactionCPQDataNew
    )
      return;

    //  Build order directly from elements IDs
    const elementOrder = elements.map((el) => normalizeType(el.id));

    // Reorder elements based on connectionOrderState (fallback to elementOrder if needed)
    const reorderedElements = [...elements].sort((a, b) => {
      const aIndex = connectionOrderState.indexOf(normalizeType(a.id));
      const bIndex = connectionOrderState.indexOf(normalizeType(b.id));
      return (
        (aIndex === -1 ? elementOrder.indexOf(normalizeType(a.id)) : aIndex) -
        (bIndex === -1 ? elementOrder.indexOf(normalizeType(b.id)) : bIndex)
      );
    });

    if (JSON.stringify(reorderedElements) !== JSON.stringify(elements)) {
      setElements(reorderedElements);
    }

    //  Reorder transactionCPQDataNew based on connectionOrderState (fallback to elementOrder)
    const updatedTransactionData = JSON.parse(
      JSON.stringify(transactionCPQDataNew)
    );
    Object.keys(updatedTransactionData).forEach((transactionKey) => {
      updatedTransactionData[transactionKey] = updatedTransactionData[
        transactionKey
      ]
        .sort((a, b) => {
          const aIndex = connectionOrderState.indexOf(normalizeType(a.type));
          const bIndex = connectionOrderState.indexOf(normalizeType(b.type));
          return (
            (aIndex === -1
              ? elementOrder.indexOf(normalizeType(a.type))
              : aIndex) -
            (bIndex === -1
              ? elementOrder.indexOf(normalizeType(b.type))
              : bIndex)
          );
        })
        .map((u) => {
          const edge = edges.find(
            (e) => normalizeType(e.source) === normalizeType(u.type)
          );
          return {
            ...u,
            connectedTo: edge ? edge.target : null,
          };
        });
    });

    if (
      JSON.stringify(updatedTransactionData) !==
      JSON.stringify(transactionCPQDataNew)
    ) {
      setTransactionCPQDataNew(updatedTransactionData);
      localStorage.setItem(
        "transactionCPQData",
        JSON.stringify(updatedTransactionData)
      );
    }
  }, [connectionOrderState, edges, elements, transactionCPQDataNew]);

  // In parent
  const updateProductQty = (transactionId, productId, newQty) => {
    console.log(transactionId, productId, newQty);
    setTransactionCPQDataNew((prevState) => {
      const existingArray = prevState[transactionId]
        ? [...prevState[transactionId]]
        : [];
      const existingIndex = existingArray.findIndex(
        (item) => item.id === productId
      );
      if (existingIndex !== -1) {
        const unitop = { ...existingArray[existingIndex], qty: newQty };
        if (unitop.payloadData?.productData) {
          const parsedProductInfoData =
            typeof unitop.payloadData.productData === "string"
              ? JSON.parse(unitop.payloadData.productData)
              : { ...unitop.payloadData.productData };
          parsedProductInfoData.configAttributes = {
            ...parsedProductInfoData.configAttributes,
            canvasQty_allFamilies: newQty,
          };
          unitop.payloadData = {
            ...unitop.payloadData,
            productData: JSON.stringify(parsedProductInfoData),
          };
        }
        existingArray[existingIndex] = unitop;
      }
      const updatedState = { ...prevState, [transactionId]: existingArray };
      localStorage.setItem("transactionCPQData", JSON.stringify(updatedState));
      return updatedState;
    });
  };
  // In CPQIntegration

  const clearAutoSizeWarnings = () => {
  console.log('🧹 Clearing autosize warnings...');
  
  connectionOrderState.forEach((nodeId) => {
    const unitopId = `unitop_${nodeId}`;
    const existingData = JSON.parse(localStorage.getItem(unitopId) || '{}');

    // Clear ALL autosize-related data
    const updatedData = {
      ...existingData,
      recommendedModel: null,
      hasAutoSize: false,
      noSuitableModel: false,        
      maxCapacity: null,            
      configuredAge: existingData.age, // ← Keep current age as configured
      // Keep userSelectedModel as is - don't change it
    };
    localStorage.setItem(unitopId, JSON.stringify(updatedData));
    
    // Also update the cache ref
    if (cacheRef.current[nodeId]) {
      cacheRef.current[nodeId] = updatedData;
    }
  });

  // Clear autosize calculation
  setAutoSizeCalculation([]);
  localStorage.removeItem('autoSizecalcultionValue');
  localStorage.removeItem('target_output');
  localStorage.setItem('autoSizeUpdate', 'false');
  setAutoSizeUpdate(false);
  
  // Clear the autoSizeRef
  autoSizeRef.current = [];

  console.log(' Autosize warnings cleared');
  
  // Refresh UI
  setRefreshKey((prev) => prev + 1);
};

  const CPQIntegration = async () => {
    const errors = [];
    const transactionData = localStorage.getItem("cpq-data-key");
    const transactionDataNewData = localStorage.getItem("transactionCPQData");
    const parsedNewdata = JSON.parse(transactionDataNewData || "{}");
    if (!transactionData) return;

    const parsedTransData = JSON.parse(transactionData);
    const transactionId = parsedTransData.transactionId;
    const getData = parsedNewdata[transactionId] || [];
    const currentState = JSON.parse(localStorage.getItem("currentFlowState"));
    console.log(getData, parsedNewdata, parsedNewdata[transactionId]);
    // if unitops not added then we cannot proceed or add to cpq
    if (!currentState) {
      errors.push(...errors, "Please add a product to the canvas");
    }

    const elementsLength = currentState?.elements?.length ?? 0;
    const edgesLength = currentState?.edges?.length ?? 0;

    const result = currentState?.elements.filter((item2) => {
      return !getData.some((item1) => item1.type === item2.id);
    });
    console.log(result, getData, currentState?.elements, currentState);
    if (result?.length > 0) {
      const errorMessages = result.map(
        (u, index) =>
          `Unconfigured Unitops (${index + 1}): ${
            unitopsErrorLabel[u?.id.split("_")[0]] || "Unnamed UnitOp"
          }`
      );
      errors.push(...errorMessages);
    }

    // Condition 2: Check connectivity
    const connectedCount = currentState?.edges?.length ?? 0;
    const elementsCount = (currentState?.elements?.length ?? 0) - 1;

    // this first check basically for if only one unitop we need to add to cpq
    if (currentState?.elements?.length > 1) {
      // this 2nd check basically multiple unitops when edges are connected
      if (
        currentState?.elements.length !== 0 &&
        connectedCount !== elementsCount
      ) {
        const err = ["Some Unitops edges are not connected."];
        errors.push(...err);
      }
    }

    if (errors.length > 0) {
      // alert(errors.join("\n"));
      setErrorModal(true);
      setErrorModalDetails(errors);
      setCpqBtnLoader(false);
      return;
    }
    // Clear autosize warnings after successful validation
    clearAutoSizeWarnings();
    setCpqBtnLoader(true);
    if (
      elementsLength === (getData?.length ?? 0) &&
      elementsLength - 1 === edgesLength
    ) {
      const apiGatewayUrl =
        "https://ogsmf0l2t7.execute-api.us-east-1.amazonaws.com/Test-stage";

      const callDeleteAPI = async (retryCount = 1) => {
        const selectionsRaw = localStorage.getItem("selections");
        const selections = selectionsRaw ? JSON.parse(selectionsRaw) : [];
        if (selections.length === 0) return true;

        const deletePayload = {
          bsId: Number(transactionId),
          callType: "delete",
        };

        try {
          const deleteResponse = await fetch(apiGatewayUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(deletePayload),
          });

          if (deleteResponse.status === 500) {
            setErrorModal(true);
            setErrorModalDetails([`Delete API returned 500`]);
            // alert("Delete API returned 500");
            return false;
          }

          if (!deleteResponse.ok) {
            if (retryCount > 0) {
              return callDeleteAPI(retryCount - 1);
            }
            setErrorModal(true);
            setErrorModalDetails([`Delete API HTTP error`]);
            // alert("Delete API HTTP error");
            return false;
          }

          const deleteData = await deleteResponse.json();
          console.log(deleteData);
          if (deleteData.statusCode !== 200) {
            if (retryCount > 0) {
              return callDeleteAPI(retryCount - 1);
            }
            // alert("Delete API statusCode error");
            setErrorModal(true);
            setErrorModalDetails([`Delete API statusCode error`]);
            return false;
          }
          console.log("delete API Successfully called", deleteData);
          return true;
        } catch (err) {
          console.log(err);
          if (retryCount > 0) {
            return callDeleteAPI(retryCount - 1);
          }
          setErrorModal(true);
          setErrorModalDetails([`Delete API request failed`]);
          // alert("Delete API request failed");
          return false;
        }
      };

      const callAddAPI = async () => {
        return getData.reduce((promiseChain, unitop, index) => {
          return promiseChain.then(async (successSoFar) => {
            if (!successSoFar) return false; // stop chain if previous failed

            const productInfo = unitop?.payloadData?.productData;
            if (!productInfo) return true; // skip empty

            const parsedProductInfoData =
              typeof productInfo === "string"
                ? JSON.parse(productInfo)
                : productInfo;
            const productType = getProductTypeFromNode(
              parsedProductInfoData.configAttributes.productModel_allFamilies
            );
            setAddDataCurrentModel([
              parsedProductInfoData.configAttributes.baseModelMap_allFamilies ||
                parsedProductInfoData?.configAttributes?.coreProduct_PROflex,
            ]);
            console.log(productType, parsedProductInfoData.configAttributes);
            const addPayload = {
              bsId: Number(transactionId),
              documentId: 36244074,
              configData:
                // parsedProductInfoData?.id
                //   ? {}
                //   :
                parsedProductInfoData.configAttributes,
              productType,
              callType: "add",
            };
            try {
              const response = await fetch(apiGatewayUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(addPayload),
              });
              console.log(
                `Add API for index ${index}:`,
                parsedProductInfoData,
                addPayload,
                response
              );
              console.log(response);
              if (response.status === 500) {
                // alert(`Add API returned 500 for index ${index}`);
                setErrorModal(true);
                setErrorModalDetails([
                  `Unitops ${
                    index + 1
                  } Add API response error, please Add Data to CPQ`,
                ]);
                return false; // stop immediately
              }

              if (!response.ok) {
                setErrorModal(true);
                setErrorModalDetails([
                  `Add API HTTP error for Unitops ${index + 1}`,
                ]);
                // alert(`Add API HTTP error for index ${index}`);
                return false; // stop immediately
              }

              const responseData = await response.json();
              console.log(responseData, "response add api call");
              if (responseData.statusCode != 200) {
                setErrorModal(true);
                setErrorModalDetails([
                  `Add API statusCode error for Unitops ${index + 1}`,
                ]);
                // alert(`Add API statusCode error for index ${index}`);
                return false; // stop immediately
              }
              return true;
            } catch (error) {
              setErrorModal(true);
              setErrorModalDetails([
                `Please Add Data to CPQ, Unitop ${
                  index + 1
                } getting error response: ${error.message}`,
              ]);
              // alert(`Add API error for index ${index}: ${error.message}`);
              return false; // stop immediately
            }
          });
        }, Promise.resolve(true));
      };

      try {
        const deleteSuccess = await callDeleteAPI();
        if (!deleteSuccess) {
          setCpqBtnLoader(false);
          return;
        }

        const addSuccess = await callAddAPI();
        if (!addSuccess) {
          //  alert("Add API failed, process stopped");
          setErrorModal(true);
          setErrorModalDetails([
            `Add API failed, Please check unitops before ADD Data to CPQ`,
          ]);
          setCpqBtnLoader(false);
          setAddDataCurrentModel([]);

          // this delete api call basically for if any of add products get failed after calling api
          //  we need to clear or call delate api to remove all products from list
          callDeleteAPI();
          return; // stop completely, no retry
        }
        if (addSuccess) {
          // Wait a moment for UI to update, then trigger image capture
          setTriggerDownload(true);
        }
        //  alert("All products successfully added to transaction");
        // window.top.postMessage(
        //   "Sending Data From UPW Application",
        //   "https://watertechnologiesdev.bigmachines.com"
        // );
        // localStorage.clear();
        // window.location.href = `https://watertechnologiesdev.bigmachines.com/commerce/transaction/oraclecpqo/${transactionId}`;
      } catch (error) {
        console.log(`Error processing transaction: ${error.message}`);
      }
    } else {
      alert("Please configure data before Add Data to CPQ1");
    }
  };
  const callImageAPI = async (imageUrl) => {
    const transactionData = localStorage.getItem("cpq-data-key");
    if (!transactionData) return false; // return false if no transaction

    const parsedTransData = JSON.parse(transactionData);
    const transactionId = parsedTransData.transactionId;

    const apiGatewayUrl =
      "https://ogsmf0l2t7.execute-api.us-east-1.amazonaws.com/Test-stage";
    const rawBase64 = imageUrl.replace(/^data:image\/png;base64,/, "");
    const imagePayload = {
      bsId: Number(transactionId),
      callType: "uploadImage",
      imageBase64: rawBase64,
    };

    try {
      const response = await fetch(apiGatewayUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(imagePayload),
      });
      const data = await response.json();
      console.log(data, "res");
      if (data.statusCode === 200) {
        // redirect only on success
        window.top.postMessage(
          "Sending Data From UPW Application",
          "https://watertechnologiesdev.bigmachines.com"
        );
        localStorage.clear();
        window.location.href = `https://watertechnologiesdev.bigmachines.com/commerce/transaction/oraclecpqo/${transactionId}`;
        return true;
      } else {
        console.error("Image upload failed", data);
        setErrorModal(true);
        setErrorModalDetails(["Image upload failed"]);
        return false;
      }
    } catch (err) {
      setErrorModal(true);
      setErrorModalDetails(["Image upload failed"]);
      return false;
    } finally {
      setCpqBtnLoader(false);
      setTriggerDownload(false);
    }
  };
  console.log(
    connectionOrderState,
    edges,
    elements,
    transactionCPQDataNew,
    configurationData,
    "transactionCPQDataNew"
  );
  const onConnect = (params) => {
    console.log(params);
    setEdges((eds) => {
      const exists = eds.some(
        (e) => e.source === params.source && e.target === params.target
      );
      if (exists) return eds; // prevent duplicates
      return [...eds, createEdge(params, eds.length)]; // always custom type
    });
    // @ (08/28/2024) when user deleting edge or unitops this logic is used to re-filling the entire connectionInfo dictionary
    if (Object.keys(connectionInfo).length === 0) {
      const edges = rfInstance?.toObject()?.edges ?? [];
      edges.forEach((edge) => {
        if (!edge.source.includes("mixsplit")) {
          const sourceKey = edge.source + edge.sourceHandle;
          connectionInfo[sourceKey] = edge.sourceHandle;
        }
        if (!edge.target.includes("mixsplit")) {
          const targetKey = edge.target + edge.targetHandle;
          connectionInfo[targetKey] = edge.targetHandle;
        }
      });
    }
    updateValue(); // calling the function here
    if (
      // checked_newButton == 0 &&
      connectionInfo[params.source + params.sourceHandle] !=
        params.sourceHandle &&
      connectionInfo[params.target + params.targetHandle] != params.targetHandle
    ) {
      let finaldata = false;
      if (params.source === params.target) {
        finaldata = true;
      }

      if (
        !finaldata &&
        params.source &&
        params.target &&
        params.target !== undefined
      ) {
        const streamNum_dict_new = {};
        edges.forEach((e) => {
          if (e.source && e.data?.streamNum_dict) {
            streamNum_dict_new[e.data.text] = e.data.text;
          }
        });
        localStorage.setItem(
          "streamNum_dict",
          JSON.stringify(streamNum_dict_new)
        );

        if (!params.source.includes("mixsplit")) {
          connectionInfo[params.source + params.sourceHandle] =
            params.sourceHandle;
        }
        if (!params.target.includes("mixsplit")) {
          connectionInfo[params.target + params.targetHandle] =
            params.targetHandle;
        }

        connectionInfo_source_target[params.source] = params.target;

        setElements((prevElements) => {
          const sourceExists = prevElements.some((n) => n.id === params.source);
          const targetExists = prevElements.some((n) => n.id === params.target);

          if (!sourceExists || !targetExists) {
            console.warn(
              "Edge not added: source or target node not found",
              params
            );
            return prevElements;
          }

          // First add the user-created edge
          setEdges((prevEdges) => {
            const filtered = prevEdges.filter(
              (e) => !(e.source === params.source && e.target === params.target)
            );
            const newEdge = {
              id: `e${params.source}-${params.target}`,
              source: params.source,
              target: params.target,
              type: "custom",
              arrowHeadType: "arrowclosed",
              data: {
                text: filtered.length + 1,
                streamNum_dict: {
                  [filtered.length + 1]: filtered.length + 1,
                },
                source: params.source,
                connection_number: true,
                update_connection_number: true,
                setEdgeText,
                // handleChangeEdgeText,
                setModalOption,
                // setChecked,
              },
              style: { stroke: "lightblue", strokeWidth: 2 },
              sourceHandle: params.sourceHandle,
              targetHandle: params.targetHandle,
              markerEnd: { type: "arrowclosed" },
              updatable: "target",
            };

            const userEdges = [...filtered, newEdge].filter(
              (e) => !e.generated
            );

            // Now generate sequential edges based on cDSProductIndex_allFamilies
            const sortedNodes = [...prevElements]
              .filter((n) => n.data?.pricing)
              .sort((a, b) => {
                const indexA = parseInt(
                  a.data?.cDSProductIndex_allFamilies || 0,
                  10
                );
                const indexB = parseInt(
                  b.data?.cDSProductIndex_allFamilies || 0,
                  10
                );
                return indexA - indexB;
              });

            const autoEdges = [];
            for (let i = 0; i < sortedNodes.length - 1; i++) {
              autoEdges.push({
                id: `e${sortedNodes[i].id}-${sortedNodes[i + 1].id}`,
                source: sortedNodes[i].id,
                target: sortedNodes[i + 1].id,
                type: "smoothstep",
                generated: true,
              });
            }

            return [...userEdges, ...autoEdges];
          });

          return prevElements;
        });
      }

      executeOptionFlag = true;
    }
  };
  // Added useMemo hook for avoid - rerender in version 11
  const edgeTypes = useMemo(
    () => ({
      custom: CustomEdge,
    }),
    []
  );
  const onEdgeContextMenu = (event, edge) => {
    event.preventDefault();
    // setVisibleFeed(false);
    handleCloseModal(edge, "connection");
  };

  const onEdgeMouseEnter = () => {};
  const onConnectStart = () => {};
  const onConnectStop = () => {};
  const onConnectEnd = () => {
    setClonedEdgeText(Number(edgeText) + 1);
    if (Object.keys(streamNum_dict).length > 0) {
      setEdgeText(Number(Math.max(...Object.keys(streamNum_dict))) + 1);
    }
  };
  const onElementClicksData = () => {};
  const CustomControls = () => {
    return (
      <Controls>
        {/* <ControlButton
          className="react-flow__controls-button react-flow__controls-height"
          onClick={() => setHeight_canvas(height_canvas + 75)}
        >
          <HeightRoundedIcon className="react-flow-control react-flow-width" />
        </ControlButton>
        <ControlButton
          className="react-flow__controls-button react-flow__controls-width"
          onClick={() => setWidth_canvas(width_canvas + 150)}
        >
          <HeightRoundedIcon className="react-flow-control react-flow-height" />
        </ControlButton> */}
      </Controls>
    );
  };
  // upgarded version 11 for Edgeupdate code changes
  const onEdgeUpdate = useCallback(
    (oldEdge, newConnection) => {
      //  fixed the bug GB:2885
      // Need to add this for bug fixing GB:3042 because when updating the edge faling connection validation
      if (Object.keys(connectionInfo).length === 0) {
        // console.log('edges', edges)
        const edges = rfInstance?.toObject()?.edges ?? [];
        edges.forEach((edge) => {
          if (!edge.source.includes("mixsplit")) {
            const sourceKey = edge.source + edge.sourceHandle;
            connectionInfo[sourceKey] = edge.sourceHandle;
          }
          if (!edge.target.includes("mixsplit")) {
            const targetKey = edge.target + edge.targetHandle;
            connectionInfo[targetKey] = edge.targetHandle;
          }
        });
      }
      if (
        oldEdge.targetHandle != "a_bp" &&
        oldEdge.targetHandle != "a_w" &&
        oldEdge.targetHandle != "c_w"
      ) {
        setEdges((edges) => {
          const updatedEdges = edges.map((item) => {
            if (item.data) {
              item.data.update_connection_number = false;
            }
            return item;
          });
          return updatedEdges;
        });

        if (
          connectionInfo[newConnection.target + newConnection.targetHandle] !=
            newConnection.targetHandle ||
          newConnection.target.replace(/[\d_]+/g, "") == "mixsplit"
        ) {
          // @ invalidConnection in flexible edges in version 11
          let finaldata = false;
          if (newConnection.source === newConnection.target) {
            finaldata = true;
          } else {
            if (newConnection.source && newConnection.target) {
              const source = newConnection.source.split("_")[0];
              const destination = newConnection.target.split("_")[0];
              for (let i = 0; i < invalidConnection.length; i++) {
                const ele = invalidConnection[i];
                if (
                  uniqueValue[ele.source].indexOf(source) >= 0 &&
                  uniqueValue[ele.Destination].indexOf(destination) >= 0
                ) {
                  const sourceHandle = handleValue[ele.sourcePort];
                  const targetHandle = handleValue[ele.targetPort];
                  if (
                    sourceHandle === newConnection.sourceHandle &&
                    targetHandle === newConnection.targetHandle
                  ) {
                    finaldata = true;
                    if (ele.Msg) {
                      document.querySelector("#toatster-msg span").innerHTML =
                        ele.Msg;
                      document.querySelector("#toatster-msg").style.display =
                        "block";
                      setTimeout(() => {
                        document.querySelector("#toatster-msg").style.display =
                          "none";
                        document.querySelector("#toatster-msg span").innerHTML =
                          "";
                      }, 3000);
                    }
                    break;
                  }
                }
              }
            }
          }
          if (!finaldata) {
            setEdges((els) => updateEdge(oldEdge, newConnection, els));
          }
          delete connectionInfo[oldEdge.target + oldEdge.targetHandle];
          if (wexpex_all_unitop.length >= 6) {
            if (
              oldEdge.target === wexpex_all_unitop[0].id &&
              wexpex_all_unitop[0].id.replace(/[\d_]+/g, "") === "mixsplit"
            ) {
              delete connectionInfo_source_target[newConnection.source];
            }
          }
          connectionInfo[oldEdge.source + oldEdge.sourceHandle] =
            oldEdge.sourceHandle; // by Sudarsana for proximity connection
          // @ mixsplit validation condition  in flexiable edges in version 11
          if (newConnection.target.replace(/[\d_]+/g, "") !== "mixsplit") {
            connectionInfo[newConnection.target + newConnection.targetHandle] =
              newConnection.targetHandle;
          }
          // @ added here for connection not working in update edge
          updateconnectionsource =
            newConnection.source + newConnection.sourceHandle;
          updateconnectionInfoDelete = true;
        }
      }
    },
    [edges]
  ); // required for bug fixing dependency
  const getClosestEdge = useCallback(
    (node) => {
      let closestNode = {};
      // Need to add this for bug fixing GB:3042 because when updating the edge faling connection validation
      if (Object.keys(connectionInfo).length === 0) {
        const edges = rfInstance?.toObject()?.edges ?? [];
        edges.forEach((edge) => {
          if (!edge.source.includes("mixsplit")) {
            const sourceKey = edge.source + edge.sourceHandle;
            connectionInfo[sourceKey] = edge.sourceHandle;
          }
          if (!edge.target.includes("mixsplit")) {
            const targetKey = edge.target + edge.targetHandle;
            connectionInfo[targetKey] = edge.targetHandle;
          }
        });
      }
      const storeNodes = JSON.parse(localStorage.getItem("storeNodes"));

      //  condtion for original proximity connection normal nodes
      let d = 0;
      closestNode = storeNodes
        .filter((item) => !item.id.startsWith("groupROHP_"))
        .reduce(
          (res, n) => {
            if (n.id !== node.id) {
              const dx = n.positionAbsolute.x - node.positionAbsolute.x;
              const dy = n.positionAbsolute.y - node.positionAbsolute.y;
              d = Math.sqrt(dx * dx + dy * dy);
              // if (d < res.distance && d < MIN_DISTANCE) {
              //   res.distance = d;
              //   res.node = n;
              // }
            }
            return res;
          },
          {
            distance: Number.MAX_VALUE,
            node: null,
          }
        );
      if (!closestNode.node) {
        return null;
      }
      // by Sudarsana for proximity connection
      const closeNodeIsSource =
        closestNode.node.positionAbsolute.x < node.positionAbsolute.x;
      const sources = closeNodeIsSource ? closestNode.node.id : node.id;
      const target = closeNodeIsSource ? node.id : closestNode.node.id;

      onConnect({
        source: sources,
        sourceHandle: "c",
        target: target,
        targetHandle: "a",
      });
    },
    [edges]
  );
  const onNodeDrag = useCallback(
    (_, node) => {
      const mixspiltnode = node.id;
      const getmixsplitnode = mixspiltnode.replace(/_\d+$/, "");
      // Disable proximity connection feature for MixSplit unitop.
      const closeEdge = getClosestEdge(node);
      setEdges((es) => {
        const nextEdges = es.filter((e) => e.className !== "temp");
        if (
          closeEdge &&
          !nextEdges.find(
            (ne) =>
              ne.source === closeEdge.source && ne.target === closeEdge.target
          )
        ) {
          closeEdge.className = "temp";
          nextEdges.push(closeEdge);
        }
        return nextEdges;
      });
    },
    [getClosestEdge, setEdges]
  );

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData("application/reactflow");
      const unitopType = event.dataTransfer.getData("application/unitoptype");
      console.log(unitopType);
      const position = rfInstance.project({
        x: event.clientX - reactFlowBounds.left - 30,
        y: event.clientY - reactFlowBounds.top - 20,
      });

      if (type === "customnode_unitops" && unitopType) {
        // Get or create the ID tracking array for this unitop type
        if (!window.unitopIdTrackers) {
          window.unitopIdTrackers = {};
        }

        if (!window.unitopIdTrackers[unitopType]) {
          window.unitopIdTrackers[unitopType] = [];
        }

        const idArray = window.unitopIdTrackers[unitopType];
        let newId = 1;

        // Find next available ID
        if (idArray.length > 0) {
          idArray.sort((a, b) => a - b);
          for (let i = 0; i < idArray.length; i++) {
            if (newId === idArray[i]) {
              newId++;
            } else {
              break;
            }
          }
        }

        // Check localStorage for existing IDs
        while (localStorage.getItem(`${unitopType}_${newId}`)) {
          newId++;
        }

        // Get config for this unitop type
        const config = UNITOP_CONFIG[unitopType];
        console.log(config, "config", unitopType);
        if (!config) {
          console.error(
            `No configuration found for unitop type: ${unitopType}`
          );
          return;
        }

        // Store in localStorage
        localStorage.setItem(
          `${unitopType}_${newId}`,
          `${config.prefix}_${newId}`
        );
        idArray.push(newId);

        // Create new node
        const newNode = {
          id: `${unitopType}_${newId}`,
          type: "customnode_unitops",
          position,
          style: { width: "auto", height: "auto", zIndex: 5 },
          data: {
            label: `${config.name} ${newId}`,
            unitopType: unitopType,
            config: config,
          },
        };

        node1.push(newNode);
        setElements((es) => es.concat(newNode));
      }
    },
    [rfInstance]
  );

  // Added useCallback hook in version 11 @
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    // setChecked(false);
    // convasEmptyFun();
  }, []);

  // Click the any unitop to call this function onClick unitop.
  const onElementClick = useCallback((event, element) => {
    // Only handle node clicks, not edges
    if (!element.source && !element.target) {
      console.log("Clicked unitop:", element);

      // Set the unitop details
      setUnitopDetails({
        id: element.id,
        type: element.data.unitopType,
        label: element.data.label,
        config: element.data.config,
        data: element.data,
      });

      // Open the modal
      setUnitopVisible(true);
    }
  }, []);
  // // function to animate the connection for outgoing connection when user clicks any untiop
  // const GetOutgoingConnection = (ob, elms) => {
  //   setElements(() => {
  //     for (let i = 0; i < elms.length; i++) {
  //       if (elms[i].source != undefined && elms[i].source == ob) {
  //         elms[i].animated = true;
  //       } else {
  //         elms[i].animated = false;
  //       }
  //     }
  //     return [...elms];
  //   });
  //   // updateControlsButtonTitle();
  // };

  function handleEnter(event) {
    if (event.keyCode === 13) {
      event.target.blur();
    }
  }
  const hoverSource = (e) => {
    e.target.style.transform = "scale(2)";
    if (
      e.target.style.background === "blue" ||
      e.target.style.background === "green"
    )
      e.target.style.top = "45%";
    if (e.target.style.left === "50%") e.target.style.left = "45%";
    if (e.target.style.left === "70%") e.target.style.left = "65%";
    if (e.target.style.left === "30%") e.target.style.left = "20%";
  };
  const exithoverSource = (e) => {
    e.target.style.transform = "scale(1)";
    if (
      e.target.style.background === "blue" ||
      e.target.style.background === "green"
    )
      e.target.style.top = "45%";
    if (e.target.style.left === "50%") e.target.style.left = "45%";
    if (e.target.style.left === "70%") e.target.style.left = "65%";
    if (e.target.style.left === "30%") e.target.style.left = "20%";
  };
  const updateValue = () => {
    setTimeout(() => {
      if (
        document.querySelectorAll(".react-flow__edge.react-flow__edge-custom")
          .length
      ) {
        const obj = {};
        document
          .querySelectorAll(".react-flow__edgelabel-renderer input")
          .forEach((ele) => {
            obj[ele.value] = +ele.value; // starting increment the values here
          });
        // Save the updated values to localStorage
        localStorage.setItem("streamNum_dict", JSON.stringify(obj)); // here entire dictinary is apending onces connection done
        streamNum_dict = JSON.parse(localStorage.getItem("streamNum_dict"));
      }
    }, 100);
  };
  // delete product from transactionCPQData
  const deleteProductById = (
    transactionKey,
    ids = [],
    setTransactionCPQDataNew,
    documentNumber
  ) => {
    const getTransactionKey = JSON.parse(localStorage.getItem("cpq-data-key"));
    const transactionKeyId = transactionKey ?? getTransactionKey?.transactionId;

    // Ensure ids is an array
    const idsArray = Array.isArray(ids) ? ids : [ids];

    if (!idsArray || idsArray.length === 0) return;

    // Load existing deleted IDs from localStorage
    const deletedIds = JSON.parse(
      localStorage.getItem("deletedUnitops") || "[]"
    );

    if (documentNumber) {
      const selections = JSON.parse(localStorage.getItem("selections") || "[]");
      // optional: update selections here
    }

    // Update state
    setTransactionCPQDataNew((prevState) => {
      const existingArray = prevState[transactionKeyId]
        ? [...prevState[transactionKeyId]]
        : [];

      //  Case-insensitive filtering by id or type
      const updatedArray = existingArray.filter((item) => {
        const itemId = item.id;
        const itemType = item.type;

        return !idsArray.some((id) => {
          const deleteId = id;
          return itemId === deleteId || itemType === deleteId;
        });
      });

      // Update localStorage transactionCPQData
      const storedData = JSON.parse(
        localStorage.getItem("transactionCPQData") || "{}"
      );
      if (storedData[transactionKeyId]) {
        storedData[transactionKeyId] = storedData[transactionKeyId].filter(
          (item) => {
            const itemId = item.id;
            const itemType = item.type;

            return !idsArray.some((id) => {
              const deleteId = id;
              return itemId === deleteId || itemType === deleteId;
            });
          }
        );
        localStorage.setItem("transactionCPQData", JSON.stringify(storedData));
      }

      // Store deleted IDs
      localStorage.setItem(
        "deletedUnitops",
        JSON.stringify([...deletedIds, ...idsArray])
      );

      console.log(
        " Deleted from transactionCPQData:",
        idsArray,
        "Remaining:",
        updatedArray.length
      );

      return { ...prevState, [transactionKeyId]: updatedArray };
    });
  };

  // #### function for deletion of unitop ########
  const handleConfirm = (isClose = false, elem) => {
    const { type } = elem;
    console.log(elem);
    // console.log(type, elem);
    let previousUnitsData = [];
    let item = type;
    let identify_erd = "na";
    if (elem.id) {
      del_element_check = 0;
    }
    // #### if edge deletion #######
    if (elem.sourceHandle) {
      if (localStorage.getItem("streamNum_dict"))
        streamNum_dict = JSON.parse(localStorage.getItem("streamNum_dict"));
      delete connectionInfo[elem.source + elem.sourceHandle];
      delete connectionInfo[elem.target + elem.targetHandle];
      delete streamNum_dict[elem.data.text];
      delete streamNum_dict[
        Object.keys(streamNum_dict).find(
          (key) => streamNum_dict[key] === elem.data.text
        )
      ];
      localStorage.setItem("streamNum_dict", JSON.stringify(streamNum_dict));
      delete connectionInfo_source_target[elem.source];
      if (
        localStorage.getItem("mixSplit-dict") &&
        elem.source.replace(/[\d_]+/g, "") == "mixsplit"
      ) {
        removeItemsInLocalStorage("mixSplit-dict", "mixSplit", elem.source);
        getBorderColor(elem.source, "add");
      }
      // const edgesdata = rfInstance?.toObject()?.edges ?? [];
      connectionInfo = {}; // for bug fixing added this as empty GB-3042 for incase if multiple connection happened single unitop, then it will helpful for details
    }
    // #### if unitop deletion #######
    else {
      // @ here exiting code commented because issue is happing on connection between in hppump and pump
      // so we removed inculde statement and maked as "==="
      const res_source = Object.entries(connectionInfo).filter(([k]) => {
        return k.slice(0, -1) === elem.id;
      });
      if (res_source)
        res_source.map((item, index) => {
          delete connectionInfo[res_source[index][0]];
        });
      if (elem.id.replace(/[\d_]+/g, "") == "roPump") {
        const res_source_hppump = Object.entries(connectionInfo).filter(([k]) =>
          k.includes(`hppump_${elem.id[elem.id.length - 1]}`)
        );
        if (res_source_hppump && res_source_hppump.length) {
          // added by chandrashekhar 14-08-2024 because after deleteting ropump data has been retain in hppump start
          const data = res_source_hppump[0][0].split(
            res_source_hppump[0][1]
          )[0];
          removeLocalStorageRoOutputData([], elem, data);
          // added by chandrashekhar 14-08-2024 because after deleteting ropump data has been retain in hppump end
          res_source_hppump.map((item, index) => {
            delete connectionInfo[res_source_hppump[index][0]];
          });
        }
        const res_source_peltonwheel = Object.entries(connectionInfo).filter(
          ([k]) => k.includes(`peltonwheel_${elem.id[elem.id.length - 1]}`)
        );
        if (res_source_peltonwheel)
          res_source_peltonwheel.map((item, index) => {
            delete connectionInfo[res_source_peltonwheel[index][0]];
          });
      }
      // Source
      let source_index = unitop_source.map((item, index) => {
        if (elem.id.replace(/[\d_]+/g, "") != "roPump") {
          // @ commeted this "item.includes(elem.id)" added in this if condtion  "item.slice(0, -1) === (elem.id)"
          if (item.slice(0, -1) === elem.id) return index;
          else return -1;
        } else {
          if (
            item.includes(`hppump_${elem.id[elem.id.length - 1]}`) ||
            item.includes(elem.id)
          ) {
            return index;
          } else {
            return -1;
          }
        }
      });
      source_index = source_index.filter((item) => {
        return item >= 0;
      });

      // Target
      let target_index = unitop_target.map((item, index) => {
        if (elem.id.replace(/[\d_]+/g, "") != "roPump") {
          if (item.includes(elem.id)) return index;
          else return -1;
        } else {
          if (
            item.includes(`hppump_${elem.id[elem.id.length - 1]}`) ||
            item.includes(elem.id)
          ) {
            return index;
          } else {
            return -1;
          }
        }
      });
      target_index = target_index.filter((item) => {
        return item >= 0;
      });

      // ######## delete connectionInfo dict based on SourceIndex and TargetIndex ######
      if (source_index.length > 0) {
        for (let i = 0; i < source_index.length; i++) {
          if (source_index[i] >= 0) {
            const key = Object.entries(connectionInfo).find(([k]) =>
              k.includes(unitop_target[source_index[i]])
            );
            if (key) delete connectionInfo[key[0]];
          }
        }
        for (let i = 0; i < target_index.length; i++) {
          if (target_index[i] >= 0) {
            const key = Object.entries(connectionInfo).find(([k]) =>
              k.includes(unitop_source[target_index[i]])
            );
            if (key) delete connectionInfo[key[0]];
          }
        }
      } else {
        // product, waste unitop
        for (let i = 0; i < target_index.length; i++) {
          if (target_index[i] >= 0) {
            const key = Object.entries(connectionInfo).find(([k]) =>
              k.includes(unitop_target[target_index[i]])
            );
            if (key) delete connectionInfo[key[0]];
            const key1 = Object.entries(connectionInfo).find(([k]) =>
              k.includes(unitop_source[target_index[i]])
            );
            if (key1) delete connectionInfo[key1[0]];
          }
        }
      }
      // ########## end #######

      // ########## clearing unitop_source and unitop_target list values and re-adjust their postion ########
      for (let i = 0; i < source_index.length; i++) {
        unitop_target[source_index[i]] = "xx";
      }
      for (let i = 0; i < target_index.length; i++) {
        unitop_source[target_index[i]] = "xx";
      }

      unitop_source = unitop_source.filter((item) => {
        return !item.includes(elem.id) && item != "xx";
      }); // unitop_source.filter((item)=>{return (item != elem.id && item != 'xx')});
      unitop_target = unitop_target.filter((item) => {
        return !item.includes(elem.id) && item != "xx";
      }); // unitop_target.filter((item)=>{return (item != elem.id && item != 'xx')});

      setTimeout(() => {
        if (
          document.querySelectorAll(".react-flow__edge.react-flow__edge-custom")
            .length
        ) {
          const obj = {};
          streamNum_dict = {};
          document
            .querySelectorAll(".react-flow__edgelabel-renderer input")
            .forEach((ele) => {
              obj[ele.value] = +ele.value;
            });
          localStorage.setItem("streamNum_dict", JSON.stringify(obj));
          streamNum_dict = JSON.parse(localStorage.getItem("streamNum_dict"));
        }
      }, 100);
    }
    if (type === "customnode_feed") item = "feed";
    if (type === "customnode_productOut") item = "ro";
    /*
     * When open flowsheet exits Feed, Product, RO_HP
     * delete any one we have update the localstroage value
     * flow_dict, feed_flow_dict and product_flow_dict
     * If user delete the Feed we have update localStorage flow_dict and feed_flow_dict and
     * user delete the product and RO_HP we have update the  localStorage flow_dict and product_flow_dict
     * get the name of unitop using localStorage.getItem(elem.id);
     * delete are using for delete the object key and value delete flow_dict_data[localStorage.getItem(elem.id)];
     * check if item === 'feed' || type === 'customnode_product' || type === 'customnode_ROpump' then
     * localstorage is updated.
     */
    if (isClose) {
      setModalOption(defaultModalOptions);
      // setModalIsOpen_alert(false);
      for (let i = 0; i < node1.length; i++) {
        if (node1[i].id == elem.id) {
          node1.splice(i, 1);
        }
      }
      // @ added here to solve the update edge issue connection after deleting
      if (updateconnectionInfoDelete) {
        delete connectionInfo[updateconnectionsource];
        updateconnectionInfoDelete = false;
      }
      // deleting the element and edge in version 11 code @
      setElements((nds) => {
        const updatedElements = nds.filter((node) => node.id !== elem.id);
        // start --> here we written the logic for delection of unitops for all and again drag new unitops connection that stream number should start from '1'
        const uniqueEdges = edge_id_details.reduce((acc, current) => {
          const x = acc.find(
            (item) =>
              item.source === current.source &&
              item.target === current.target &&
              item.type === current.type
          );
          if (!x) {
            return acc.concat([current]);
          } else {
            return acc;
          }
        }, []); // this was written for remove the duplicate of array of edge_id_details
        const matchingEdges = uniqueEdges.filter(
          (edge) => edge.source === elem.id || edge.target === elem.id
        );
        // matchingEdges logic written for get the data both source and target
        if (
          !elem.id.includes("reactflow__edge") ||
          elem.id.replace(/[\d_]+/g, "") !== "roPump"
        ) {
          // here this condition should satisfy only untiop deletion not for edge deletion
          matchingEdges.forEach((edge) => {
            const connectDeletion = Object.keys(streamNum_dict).find((key) => {
              return streamNum_dict[key] === edge.data.text;
            });
            if (connectDeletion) {
              delete connectionInfo[edge.source + edge.sourceHandle]; // it wil get source for which connection need to delete
              delete connectionInfo[edge.target + edge.targetHandle]; // it wil get target for which connection need to delete
            }
          });
          if (updatedElements.length === 0) {
            edge_id_details = [];
          }
        }
        // end
        return updatedElements;
      });
      setEdges((nds) =>
        nds.filter((edge) => edge.source !== elem.id && edge.target !== elem.id)
      );
      setEdges((nds) => {
        const updatedEdge = nds.filter((edge) => edge.id !== elem.id);
        return updatedEdge;
      });
      if (elem.id) {
        const elemId = elem.id;
        setTimeout(() => {
          localStorage.removeItem(elemId);
        }, 0);
      }
      delete connectionInfo_source_target[elem.id];

      // if (elem.id.replace(/[\d_]+/g, "") == "cartridgefilter") {
      c_anuj.splice(
        c_anuj.indexOf(Number(elem.id.substring(elem.id.indexOf("_") + 1))),
        1
      );
      c_anuj.sort((a, b) => {
        return a - b;
      });
      // removeItemsInLocalStorage("anuj-dict", "st", elem.id);
      const storageKey = `unitop_${elem.id}`;
      localStorage.removeItem(storageKey);
      //   Also update transaction state and localStorage transaction key
      deleteProductById(
        elem?.data?.transactionId,
        storageKey,
        setTransactionCPQDataNew,
        elem?.data?.documentNumber
      );
      // }
    }
    // @ this logic is main important for after deleting the unitops make sure stremNum_dict is empty
    if (!elem.id.includes("reactflow__edge")) {
      setTimeout(() => {
        localStorage.setItem("streamNum_dict", JSON.stringify({}));
        // @ (08/28/2024) here added connectionInfo empty for logic after deletion make it as a empty
        // again this connectionInfo re-filling On Drop and onConnection Functions
        connectionInfo = {};
        if (
          document.querySelectorAll(".react-flow__edge.react-flow__edge-custom")
            .length === 0
        ) {
          streamNum_dict = {};
        }
        if (Object.keys(streamNum_dict).length === 0) {
          setEdgeText(0);
        }
      }, 1000);
    }
    //  bug fixing after saving the file in case the connection info data not deleted --> starting code
    // commeted code  for bug fixing GB-2008
    //  bug fixing ending code
    // disabledStripperAndExplorerTab();
    /**
     * remove the localstorage value when user delete the RO with Pump
     * roPump delete in localStorage but hppump value is not deleted
     * so generate the error
     * error is when user drag `RO with Pump` add two value in localStorage roPump and hppump
     * when delete the ropump remove the `roPump` localStorage value but `hppump` is not deleted
     * add this line to remove the hppump value in localStorage `localStorage.removeItem(`hppump_${elem.id.slice(-1)}`);`
     */
  };
  const deleteUnitTop = (event, node) => {
    event.stopPropagation();
    // setVisibleFeed(false);
    del_element_check = 1;
    handleCloseModal(node, "unitop");
    localStorage.setItem("globalExitBtn", "true");
    // convasEmptyFun();
  };
  const handleCloseModal = (ele, arg) => {
    setModalOption({
      ...defaultModalOptions,
      visible: true,
      // message: t(`Do you want to delete this ${arg}?`),
      message: `Do you want to delete this ${arg}?`,
      yesOrNo: true,
      onNo: () => closeModelOption(),
      onYes: () => handleConfirm(true, ele),
      type: "warning",
    });
  };
  const closeModelOption = () => {
    if (handleClickStr === "blank") {
      handleClick();
    } else if (handleClickStr === "editfile") {
      handleClick("editfile");
    }
    // if (!preValFlag) {
    //   returnDuplicateValue();
    // } else {
    //   if (duplicateNodeFlag) {
    //     returnDuplicateValue();
    //   }
    setModalOption(defaultModalOptions);
    // }
    document.body.classList.remove("duplicate");
    setCallExecuteFun(false);
    setFindAllConnection(false);
    updateControlsButtonTitle();
  };

  const handleCloseOption = useCallback(() => {
    setUnitopVisible(false);
    setUnitopDetails(null);
  }, []);
//  Add a flag to block rendering during calculation:
const isCalculatingAutosize = useRef(false);

//  No warnings without active autosize
//  No warnings without recoveryValue
//  Warnings clear after clearAutoSizeWarnings()
//  No stale warnings from old data
//  Warnings only show when autosize is actually running
// The key is the hasRecoveryValue check that combines all three conditions to determine if valid autosize data exist
  // 2. Refactored CustomNode
const CustomNode = useCallback(
  (node) => {
    const { id } = node;
    const unitopType = id.replace(/[\d_]+/g, "");
    const config = UNITOP_CONFIG[unitopType];

    if (!config) {
      console.warn(`No configuration found for unitop type: ${unitopType}`);
      return null;
    }

    const autoSizeActive = localStorage.getItem('autoSizeUpdate') === 'true';
    
    const getUnitopDataDirect = JSON.parse(
      localStorage.getItem(`unitop_${id}`) || "null"
    );
    const getUnitopDataCache = cacheRef.current?.[id];
    const getUnitopData = getUnitopDataDirect || getUnitopDataCache;

    const autoSizeDataFromStorage = JSON.parse(
      localStorage.getItem("autoSizecalcultionValue") || "[]"
    );
    const matchingItemFromStorage = autoSizeDataFromStorage?.find(
      (item) => item?.id === id
    );
    const matchingItemFromRef = autoSizeRef.current?.find(
      (item) => item?.id === id
    );
    const matchingItem = matchingItemFromStorage || matchingItemFromRef;

    const transactionData = JSON.parse(
      localStorage.getItem("transactionCPQData") || "{}"
    );
    const transactionKey = Object.keys(transactionData)[0];
    const configuredModelData = transactionData[transactionKey]?.find(
      (item) => item?.type === id
    );
    const hasPayloadData =
      configuredModelData?.payloadData &&
      Object.keys(configuredModelData.payloadData).length > 0;

    const hasRecoveryValue = 
      autoSizeActive &&
      getUnitopData?.hasAutoSize === true &&
      matchingItem &&
      Object.keys(matchingItem).length > 0;

    console.log(`[${id}] Recovery check:`, {
      autoSizeActive,
      unitopHasAutoSize: getUnitopData?.hasAutoSize,
      hasMatchingItem: !!matchingItem,
      hasRecoveryValue
    });

    if (!hasRecoveryValue) {
      console.log(`[${id}] No recoveryValue, skipping warnings`);
      
      const checkUnitopExitsId = checkExitsLocalStorageValue(unitopType);
      const displayValue = localStorage.getItem(id) || `${config.prefix}_${checkUnitopExitsId}`;
      $(`.Node_${id}`).css({ width: "50px", display: "flex" });

      return (
        <UnitopComponent
          id={id}
          checkUnitopExitsId={checkUnitopExitsId}
          unitopName={config.name}
          unitopType={unitopType}
          displayValue={displayValue}
          config={config}
          node={node}
          handleEnter={handleEnter}
          deleteUnitTop={(e, node) => deleteUnitTop(e, node)}
          warningType={null}
          warningMessage=""
          shouldShowWarning={false}
          image={config.image}
          hoverSource={hoverSource}
          exithoverSource={exithoverSource}
        />
      );
    }

    // ===== FIX: Check if configured model matches recommendation =====
    const recommendedModel = matchingItem?.age;
    const configuredAge = hasPayloadData 
      ? configuredModelData?.age 
      : getUnitopData?.age;
    
    // User has configured if:
    // 1. They have payload data (configured in CPQ)
    // 2. AND the configured model matches the current recommendation
    const configuredMatchesRecommendation = 
      configuredAge === recommendedModel;
    
    const userHasConfigured = 
      hasPayloadData && configuredMatchesRecommendation;
    
    console.log(`[${id}] Configuration check:`, {
      recommendedModel,
      configuredAge,
      hasPayloadData,
      configuredMatchesRecommendation,
      userHasConfigured
    });
    // ===== END FIX =====

    const noSuitableModel =
      matchingItem?.noSuitableModel === true ||
      getUnitopData?.noSuitableModel === true;
    
    const hasAutoSizeModel =
      matchingItem?.age !== null && matchingItem?.age !== undefined;

    let warningType = null;
    let warningMessage = "";
    let shouldShowWarning = false;

    if (noSuitableModel) {
      warningType = "error";
      warningMessage = "There are no models that are rated for this flow rate";
      shouldShowWarning = true;
    } else if (hasAutoSizeModel && recommendedModel && !userHasConfigured) {
      warningType = "warning";
      warningMessage = "Configure recommended model";
      shouldShowWarning = true;
    }

    console.log(`[${id}] Warning decision:`, {
      hasRecoveryValue,
      noSuitableModel,
      hasAutoSizeModel,
      userHasConfigured,
      shouldShowWarning,
      warningType
    });

    const checkUnitopExitsId = checkExitsLocalStorageValue(unitopType);
    const displayValue = localStorage.getItem(id) || `${config.prefix}_${checkUnitopExitsId}`;
    $(`.Node_${id}`).css({ width: "50px", display: "flex" });

    return (
      <UnitopComponent
        id={id}
        checkUnitopExitsId={checkUnitopExitsId}
        unitopName={config.name}
        unitopType={unitopType}
        displayValue={displayValue}
        config={config}
        node={node}
        handleEnter={handleEnter}
        deleteUnitTop={(e, node) => deleteUnitTop(e, node)}
        warningType={warningType}
        warningMessage={warningMessage}
        shouldShowWarning={shouldShowWarning}
        image={config.image}
        hoverSource={hoverSource}
        exithoverSource={exithoverSource}
      />
    );
  },
  [refreshKey]
);


  // Added useMemo hook to avoid the re-render in version 11
  const nodeTypes = useMemo(
    () => ({
      // for all unitops
      customnode_unitops: CustomNode,
    }),
    [CustomNode]
  );

  const mapping = {
    cartridgeFilter: "cartridgeFilter",
    distributionPump: "distributionPump",
    chemicalFeed: "chemicalFeed",
    uvLight: "uvLight",
    CIP: "CIP",
  };
  // Function to get recovery value for a given unitop ID
  const getRecoveryForUnitop = (unitopId, targetOutput, qty = 1) => {
    const extractUnitop = unitopId?.split("_")[0];
    const getData = mapping[extractUnitop];
    const filterData = unitopJSONData?.find((item) =>
      item.slug.includes(getData)
    );

    console.log(filterData, getData, extractUnitop);
    if (!filterData || !filterData.model || filterData.model.length === 0) {
      return {
        recovery: 1,
        model: null,
        hasAutoSize: false,
        noSuitableModel: false,
      };
    }

    const modelsWithAutoSize = filterData.model.filter(
      (m) =>
        m.auto_size !== null && m.auto_size !== undefined && m.auto_size !== ""
    );

    if (modelsWithAutoSize.length === 0) {
      return {
        recovery: 1,
        model: null,
        hasAutoSize: false,
        noSuitableModel: false,
      };
    }

    if (!targetOutput || targetOutput === 0) {
      const firstModel = modelsWithAutoSize[0];
      return {
        recovery: firstModel?.recovery || 1,
        model: firstModel,
        hasAutoSize: true,
        noSuitableModel: false,
      };
    }

    // Find the maximum auto_size value
    const maxAutoSize = Math.max(
      ...modelsWithAutoSize.map((m) => Number(m.auto_size))
    );

    // Check if targetOutput exceeds maximum available capacity
    if (targetOutput > maxAutoSize) {
      return {
        recovery: 1,
        model: null,
        hasAutoSize: true,
        noSuitableModel: true,
        maxCapacity: maxAutoSize,
      };
    }

    const selectedModel = modelsWithAutoSize.find(
      (m) => Number(m.auto_size) >= targetOutput
    );
    console.log(selectedModel, "selectedModel");

    return {
      recovery: selectedModel?.recovery || 1,
      model: selectedModel || null,
      hasAutoSize: !!selectedModel,
      noSuitableModel: !selectedModel,
    };
  };

  const handleAutoSizeBtn = () => {
     isCalculatingAutosize.current = true;
    const errors = [];
    const currentState = JSON.parse(localStorage.getItem("currentFlowState"));
    const connectedCount = currentState?.edges?.length ?? 0;
    const elementsCount = (currentState?.elements?.length ?? 0) - 1;

    if (currentState?.elements?.length > 1) {
      if (
        currentState?.elements.length !== 0 &&
        connectedCount !== elementsCount
      ) {
        const err = [
          "Unitops edges are not connected, Please connect before clicking auto size button",
        ];
        errors.push(...err);
      }
    }

    if (errors.length > 0) {
      setErrorModal(true);
      setErrorModalDetails(errors);
      return;
    }

    const targetOutputValue = Number(targetOutput) || 0;

    setAutoSizeValue(targetOutputValue);
    localStorage.setItem("target_output", JSON.stringify(targetOutputValue));
    localStorage.setItem("autoSizeUpdate", "true");

    const existingAutoSizeData = JSON.parse(
      localStorage.getItem("autoSizecalcultionValue") || "[]"
    );

    const calcArray = connectionOrderState.map((id, i) => {
      const getUnitpDataFromKeyLocalStorage = JSON.parse(
        localStorage.getItem(`unitop_${id}`) || "{}"
      );

      const existingItem = existingAutoSizeData.find((item) => item?.id === id);

      return {
        id: id,
        output: i === connectionOrderState.length - 1 ? targetOutputValue : 0,
        inflow: 0,
        waste: 0,
        recovery: getUnitpDataFromKeyLocalStorage?.recovery || 0,
        qtyValue: getUnitpDataFromKeyLocalStorage?.qty || 1,
        userSelectedModel: existingItem?.userSelectedModel || false,
      };
    });

    for (let i = connectionOrderState.length - 1; i >= 0; i--) {
      const unitopId = connectionOrderState[i];

      const existingUnitopData = JSON.parse(
        localStorage.getItem(`unitop_${unitopId}`) || "{}"
      );

      const transactionData = JSON.parse(
        localStorage.getItem("transactionCPQData") || "{}"
      );
      const transactionKeys = Object.keys(transactionData);
      const transactionKey =
        transactionKeys.length > 0 ? transactionKeys[0] : null;
      const transactionAllData = transactionKey
        ? transactionData[transactionKey]
        : [];

      const configuredInCPQ = transactionAllData.find(
        (item) => item?.type === unitopId
      );
      const hasPayloadData =
        configuredInCPQ?.payloadData &&
        Object.keys(configuredInCPQ.payloadData).length > 0;
      // Check if user manually changed recovery
      const userChangedRecovery =
        existingUnitopData?.manuallyChangedRecovery || false;

      const output = calcArray[i].output;
      const qtyValue = calcArray[i].qtyValue;
      const outputPerUnit = qtyValue > 0 ? output / qtyValue : output;

      const recoveryValue = getRecoveryForUnitop(
        connectionOrderState[i],
        outputPerUnit,
        qtyValue
      );

      // Use user's recovery if manually changed, otherwise use calculated
      let recovery;
      if (userChangedRecovery) {
        const userRecovery = parseFloat(existingUnitopData?.recovery);
        recovery =
          !Number.isNaN(userRecovery) && userRecovery > 0
            ? userRecovery / 100
            : 1;
      } else {
        recovery = recoveryValue?.recovery || 1;
      }
      // const recovery = recoveryValue?.recovery || 1;
      const inflow = output / recovery;
      const waste = inflow - output;

      const recoveryPercent = recovery * 100;
      console.log(recoveryValue, "recoveryValue");
      const hasRecommendedModel =
        recoveryValue?.hasAutoSize && recoveryValue?.model;
      const newRecommendedAge = recoveryValue?.model?.label;
      const previousRecommendedAge =
        existingUnitopData?.recommendedModel?.label;
      const configuredAge = hasPayloadData
        ? configuredInCPQ?.age
        : existingUnitopData?.age;

      const previousTargetOutput = Number(
        localStorage.getItem("target_output") || 0
      );
      const targetOutputChanged = targetOutputValue !== previousTargetOutput;
      const recommendationChanged =
        newRecommendedAge && newRecommendedAge !== previousRecommendedAge;

      let finalAge;
      let finalUserSelectedFlag;
      if (hasRecommendedModel) {
        finalAge = newRecommendedAge;

        const configuredMatchesRecommendation =
          configuredAge === newRecommendedAge;

        // Check if user has already configured this model in CPQ
        const userHasConfiguredInCPQ = hasPayloadData && configuredAge;

        if (userHasConfiguredInCPQ && configuredMatchesRecommendation) {
          // User configured and it matches recommendation - keep userSelected true
          finalUserSelectedFlag = true;
          console.log(
            `[${unitopId}] User already configured matching model, no warning`
          );
        } else if (userHasConfiguredInCPQ && !configuredMatchesRecommendation) {
          // User configured but recommendation changed - show warning
          finalUserSelectedFlag = false;
          console.log(
            `[${unitopId}] Recommendation changed after user config, show warning`
          );
        } else if (targetOutputChanged || recommendationChanged) {
          // Target output or recommendation changed - show warning
          finalUserSelectedFlag = false;
          console.log(`[${unitopId}] Parameters changed, show warning`);
        } else {
          // Preserve existing state
          finalUserSelectedFlag =
            existingUnitopData?.userSelectedModel || false;
          console.log(
            `[${unitopId}] No changes, preserve state: ${finalUserSelectedFlag}`
          );
        }
      } else {
        finalAge = existingUnitopData.age || null;
        finalUserSelectedFlag = existingUnitopData?.userSelectedModel || false;
      }

      calcArray[i] = {
        ...calcArray[i],
        inflow,
        waste,
        outputQtyCalculated: outputPerUnit,
        recovery: recoveryPercent,
        age: finalAge,
        userSelectedModel: finalUserSelectedFlag,
        hasAutoSize: recoveryValue?.hasAutoSize,
        configuredAge: configuredAge,
        noSuitableModel: recoveryValue?.noSuitableModel || false,
        maxCapacity: recoveryValue?.maxCapacity || null,
      };

      const updatedUnitopData = {
        ...existingUnitopData,
        age: finalAge,
        qty: qtyValue,
        recommendedModel: recoveryValue?.model,
        hasAutoSize: recoveryValue?.hasAutoSize,
        userSelectedModel: finalUserSelectedFlag,
        manuallyChanged: false,
        configuredAge: configuredAge,
        noSuitableModel: recoveryValue?.noSuitableModel || false,
        maxCapacity: recoveryValue?.maxCapacity || null,
        payloadData:
          existingUnitopData.payloadData || configuredInCPQ?.payloadData,
        ...(hasPayloadData && {
          ...configuredInCPQ,
          age: finalAge,
        }),
      };

      console.log(`[${unitopId}] Final update:`, {
        hasPayloadData,
        configuredAge,
        previousRecommendedAge,
        newRecommendedAge,
        finalAge,
        targetOutputChanged,
        recommendationChanged,
        userSelectedModel: finalUserSelectedFlag,
        noSuitableModel: recoveryValue?.noSuitableModel,
      });

      localStorage.setItem(
        `unitop_${unitopId}`,
        JSON.stringify(updatedUnitopData)
      );

      if (i > 0) {
        calcArray[i - 1].output = inflow;
      }
    }

  // Update all state and storage
  localStorage.setItem("autoSizecalcultionValue", JSON.stringify(calcArray));
  setAutoSizeCalculation(calcArray);

  calcArray.forEach((item) => {
    cacheRef.current[item.id] = JSON.parse(
      localStorage.getItem(`unitop_${item.id}`)
    );
  });

  autoSizeRef.current = calcArray;

  // ===== NOW update state and trigger re-render =====
  setAutoSizeUpdate(true);  
   // Use setTimeout to ensure all state updates are flushed
  setTimeout(() => {
    isCalculatingAutosize.current = false;
    setRefreshKey((prev) => prev + 1);
  }, 0);
  };
  const handleCloseErrorModal = () => {
    setErrorModal(false);
  };

  console.log(autoSizeCalculation);
  return (
    <>
      <div className="sidebar-wrapper">
        <Sidebar
          clroAccess={false}
          cpqData={JSON.parse(localStorage.getItem("cpq-data-key"))}
          // products={products}
        />
      </div>

      <div className="main-wrapper">
        <div className="canvas-wrapper">
          <div onClick={onElementClicksData} className="dndflow">
            <ReactFlowProvider>
              <div
                className="reactflow-wrapper"
                ref={reactFlowWrapper}
                style={{ minHeight: height_canvas, minWidth: width_canvas }}
              >
                <div
                  style={{
                    height: height_canvas,
                    minHeight: height_canvas,
                    minWidth: width_canvas,
                  }}
                >
                  <ReactFlow
                    nodes={elements} // changes to elements to nodes in version 11 @
                    edges={edges} // Added new property version 11 @
                    connectionRadius={100} // Added new Property version 11 @
                    onNodesChange={onNodesChange} // Added new property version 11 @
                    onEdgesChange={onEdgesChange} // Added new property version 11 @
                    onConnect={onConnect}
                    deleteKeyCode={null} // @ backkey removed for deleting
                    selectNodesOnDrag={false}
                    onInit={setRfInstance} // Added new property version 11
                    onEdgeContextMenu={onEdgeContextMenu}
                    onEdgeMouseEnter={onEdgeMouseEnter}
                    className="validationflow"
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    onConnectStart={onConnectStart}
                    onConnectStop={onConnectStop}
                    onConnectEnd={onConnectEnd}
                    onNodeClick={
                      // onClickElements &&
                      onElementClick
                    } // Added onNodeClick updated name as onElementClick @
                    connectionLineType="step"
                    onNodeDrag={onNodeDrag} // @ add for proximity connection
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onEdgeUpdate={onEdgeUpdate} // Added new property in version 11 @
                    snapToGrid // Added SnapTOGrid rin version @
                    snapGrid={[54, 54]} // @ changed values 54 and 54
                    style={{ position: "absolute" }}
                  >
                    <Background color="#aaa" gap={16} />
                    <DownloadFlowsheet
                      flowsheetImage={async (imageUrl) => {
                        const success = await callImageAPI(imageUrl);
                        console.log(success, imageUrl);
                        if (!success) {
                          setErrorModal(true);
                          setErrorModalDetails(["Image upload to CPQ failed"]);
                        }
                      }}
                      triggerDownload={triggerDownload}
                    />
                  </ReactFlow>
                </div>
              </div>
              <CustomControls />
            </ReactFlowProvider>
          </div>
          <NotificationModal
            options={modalOption}
            handleClose={() => closeModelOption()}
          />
        </div>
        <div
          style={{
            position: "absolute",
            right: "90px",
            top: "80px",
            backgroundColor: "#ccc",
            padding: "10px",
            zIndex: 1000,
          }}
        >
          <div>
            <h4
              style={{
                fontSize: "18px",
                display: "inline",
                paddingBottom: "8px",
              }}
            >
              Target Output
            </h4>
            <div>
              <input
                className="nodrag"
                type="text"
                id="auto-size"
                // key={localValue}
                style={{
                  marginTop: "10px",
                  // width: "100%",
                  height: "12px",
                  fontSize: "16px",
                  border: "none",
                  textAlign: "center",
                  marginBottom: "10px",
                  padding: "10px",
                }}
                autoComplete="off"
                placeholder="Target Output"
                onChange={(e) => {
                  setTargetOutput(e.target.value);
                }}
                value={targetOutput}
              />
            </div>
          </div>

          {/* <div
                          style={{
                            display: "flex",
                            margin: "10px 0",
                            border: "2px solid black",
                            borderRadius: "20px",
                          }}
                        >
                          <Button
                            className="add-data-to-cpq"
                            style={{
                              padding: "2px",
                              color: "red",
                              // border: "2px solid black",
                              width: "100%",
                              height: "25px",
                              borderRadius: "20px",
                              fontSize: "12px",
                              outline: "none",
                              border: "none",
                              backgroundColor: `${defaultCalculation === "GPM" ? "yellow" : ""}`,
                            }}
                            data-testid="auto-size"
                            aria-label="auto-size"
                            // open custom folder on save start save_btn
                            onClick={() => setDefaultCalculation("GPM")}
                            size="large"
                          >
                            GPM
                          </Button>
                          <Button
                            className="add-data-to-cpq"
                            style={{
                              padding: "2px",
                              color: "red",
                              // border: "2px solid black",
                              width: "100%",
                              height: "25px",
                              borderRadius: "20px",
                              fontSize: "12px",
                              outline: "none",
                              border: "none",
                              backgroundColor: `${defaultCalculation === "m3/h" ? "yellow" : ""}`,
                            }}
                            data-testid="auto-size"
                            aria-label="auto-size"
                            // open custom folder on save start save_btn
                            onClick={() => setDefaultCalculation("m3/h")}
                            size="large"
                          >
                            m3/h
                          </Button>
                        </div> */}
          {/* <Tooltip title="Auto Size" placement="bottom" arrow>
                          <Button
                            className="add-data-to-cpq"
                            style={{
                              padding: "2px",
                              color: "red",
                              border: "2px solid black",
                              width: "100px",
                              height: "25px",
                              borderRadius: "20px",
                              fontSize: "12px",
                            }}
                            data-testid="auto-size"
                            aria-label="auto-size"
                            // open custom folder on save start save_btn
                            onClick={() => handleAutoSize()}
                            size="large"
                            disabled={autoSizeLoader}
                          >
                            {autoSizeLoader ? "Loading..." : "Auto Size"}
                          </Button>
                        </Tooltip> */}
        </div>
        {unitopVisible && unitopDetails && (
          <UnitopModalComponent
            unitopVisible={unitopVisible}
            handleCloseStripper={handleCloseOption}
            unitopDetails={unitopDetails}
            // disabledStripperAndExplorerTab={disabledStripperAndExplorerTab}
            // translateObject={t}
            flowIndex={flowIndex}
            setFlowIndex={setFlowIndex}
            updateProductQty={updateProductQty}
            autoSizeValue={autoSizeValue}
            autoSizeConfiguredData={autoSizeConfiguredData}
            setAutoSizeConfiguredData={setAutoSizeConfiguredData}
            autoSizeUpdate={autoSizeUpdate}
            autoSizeCalculation={autoSizeCalculation}
            unitopJSONData={unitopJSONData}
          />
        )}
      </div>
      <MuiModal
        hideBackdrop
        open={cpqBtnLoader}
        onClose={handleCloseOption}
        aria-labelledby="child-modal-title"
        aria-describedby="child-modal-description"
        className="splitter-modal"
      >
        <Box>
          <Rnd
            default={{
              x: window.innerWidth / 2 - (40 * (window.innerWidth / 100)) / 2,
              y: window.innerHeight / 2 - (45 * (window.innerHeight / 100)) / 2,
              width: "40%",
            }}
            enableResizing={{
              bottom: false,
              bottomLeft: false,
              bottomRight: false,
              left: true,
              right: true,
              top: false,
              topLeft: false,
              topRight: false,
            }}
            allowAnyClick
            enableUserSelectHack={false}
            resizeHandleStyles={{ right: { width: "5px" } }} // reducing width of right handle to 5px ---> kranthi
            minWidth="25%"
            cancel=".stripper-header-text, .normal-font, .diameter, .cf-input-props, #cbox, .MuiButton-contained"
            className="stripper-box"
          >
            <Grid container className="stripper-grid-container">
              <Grid item xs={12} className="stripper-header-grid">
                <div className="stripper-header-text ft rufusBld no_drag S_heading">
                  Adding to Quote
                </div>
              </Grid>
            </Grid>
            <div style={{ padding: "20px", fontSize: "18px" }}>
              Your configuration is being processed by the Winflow canva
              application. This could take up to a minute for large
              configurations.
            </div>
            <h4 style={{ padding: "0 20px 10px" }}>
              {addDataCurrentModel?.length ? "Adding " : ""}
              {addDataCurrentModel}
            </h4>
            <div style={{ padding: "20px" }}>
              <Loader />
            </div>
          </Rnd>
        </Box>
      </MuiModal>
      {errorModal && (
        <ErrorModal
          errorModal={errorModal}
          handleCloseModal={handleCloseErrorModal}
          errorModalDetails={errorModalDetails}
        />
      )}
      <div className="right-sidebar-wrapper">
        <RightSidebar
          onClick={handleAutoSizeBtn}
          handleCPQIntegration={CPQIntegration}
          cpqBtnLoader={cpqBtnLoader}
        />
      </div>
    </>
  );
}

export default Flow;
