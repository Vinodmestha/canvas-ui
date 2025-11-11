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
import { checkExitsLocalStorageValue, defaultModalOptions } from "../../utils";
import { CustomEdge } from "../CustomEdge";
import {
  // settings,
  // Feed,
  // ProductOut,
  // WasteOut,
  // MixSplit,
  // Pump,
  // RO,
  // Chemical_Dosing,
  CF_new,
  // uv,
  // EDI,
  // stripperImage,
  // optionsIcon,
  // openIconColor,
  // newIconColor,
} from "../../assets/images";
import NotificationModal from "../../components/common/modal";
import UnitopComponent from "../../components/common/unitop/UnitopComponent";
// import { useTranslation } from "react-i18next";
const unitopsNames = {
  CF: "Cartridge Filter",
  STR: "Clean in Place (CIP)",
  Dose: "Chemical Feed",
  DPUMP: "Distribution Pump",
  UV: "UV Light",
  PROFLEX: "PROflex",
};
const unitopsErrorLabel = {
  cartridgefilter: "Cartridge Filter",
  stripper: "CIP",
  chemicaldosing: "Chemical Feed",
  dpump: "Distribution Pump",
  uvlight: "uVLight",
  proflex: "PROflex",
};
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

let id_anuj = 1;
let del_element_check = 0;

let handleClickStr = "";
let updateconnectionInfoDelete = false;

function Home() {
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

  // const { t } = useTranslation();
  // const flowKey = 'example-flow';
  const reactFlowWrapper = useRef(null);
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
  useEffect(() => {
    // Don't save empty state
    // if (elements.length === 0 && edges.length === 0) {
    //   return;
    // }

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
    console.log("Saved flow state:", flowState); // Debug log
  }, [elements, edges]); // Remove connectionOrderState dependency

  // 3. Keep your auto-edge creation effect as-is
  const firstRender = useRef(true);

  useEffect(() => {
    if (
      firstRender.current &&
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
    }
  }, [elements]);

  // restoreFlowFromCPQ
  const restoreFlowFromCPQ = () => {
    c_anuj = [];
    node1 = [];
    edge_id_details.length = 0;
    // edge_details_SaveFiles.length = 0;

    const cpqData = JSON.parse(localStorage.getItem("cpqCanvasData"));
    if (!cpqData || !Array.isArray(cpqData) || cpqData.length === 0) {
      setElements([]);
      setEdges([]);
      return;
    }

    const allElements = [];
    allElements.push(
      ...createNodesFromCanvas(cpqData, "customnode_anuj", c_anuj, "STR")
    );

    const edgeElements = cpqData
      .filter((item) => item.source && item.target)
      .map((edgeItem, index) => createEdge(edgeItem, index));

    setElements(
      allElements.map((n) => ({ ...n, position: n.position || { x: 0, y: 0 } }))
    );
    setEdges(edgeElements);

    disabledStripperAndExplorerTab();
  };

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
  const onConnect = (params) => {
    console.log(params);
    setEdges((eds) => {
      const exists = eds.some(
        (e) => e.source === params.source && e.target === params.target
      );
      if (exists) return eds; // prevent duplicates
      return [...eds, createEdge(params, eds.length)]; // always custom type
    });
    // @sudarsana (08/28/2024) when user deleting edge or unitops this logic is used to re-filling the entire connectionInfo dictionary
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
      checked_newButton == 0 &&
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
          // @sudarsana invalidConnection in flexible edges in version 11
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
          // @sudarsana mixsplit validation condition  in flexiable edges in version 11
          if (newConnection.target.replace(/[\d_]+/g, "") !== "mixsplit") {
            connectionInfo[newConnection.target + newConnection.targetHandle] =
              newConnection.targetHandle;
          }
          // @sudarsana added here for connection not working in update edge
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
  // Added useCallback hook in version 11
  const onDrop = useCallback(
    (event) => {
      console.log(rfInstance);
      // when user deleting edge or unitops this logic is used to re-filling the entire connectionInfo dictionary
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
      setAutoSizeUpdate(false);
      // setChecked(false);
      // convasEmptyFun();
      localStorage.setItem("globalExitBtn", "true");
      event.preventDefault();
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData("application/reactflow");
      const position = rfInstance.project({
        // @Sudarsana Fix the origin of nodes so that it will stay at the place where it is left while dropping on canvas
        x: event.clientX - reactFlowBounds.left - 30,
        y: event.clientY - reactFlowBounds.top - 20,
      });
      console.log(type);
    //  if (type === "customnode_cartridgefilter") {
        console.log(type);
        if (c_anuj.length > 0) {
          c_anuj.sort((a, b) => a - b);
          id_anuj = 1;
          for (let i = 0; i < c_anuj.length; i++) {
            if (id_anuj === c_anuj[i]) {
              id_anuj++;
            } else {
              break;
            }
          }
        } else {
          id_anuj = 1;
        }

        while (localStorage.getItem(`cartridgefilter_${id_anuj}`)) {
          id_anuj++;
        }

        localStorage.setItem(`cartridgefilter_${id_anuj}`, `CF_${id_anuj}`);
        c_anuj.push(id_anuj);

        const newNode0 = {
          id: `cartridgefilter_${id_anuj}`,
          type,
          position,
          style: { width: "auto", height: "auto", zIndex: 5 },
          data: { label: "node 2" },
        };
        console.log(c_anuj, newNode0);
        node1.push(newNode0);
        setElements((es) => es.concat(newNode0));
      // }else if (type === "customnode_dpump") {
      //   if (c_dpump.length > 0) {
      //     c_dpump.sort((a, b) => a - b);
      //     id_dpump = 1;
      //     for (let i = 0; i < c_dpump.length; i++) {
      //       if (id_dpump === c_dpump[i]) {
      //         id_dpump++;
      //       } else {
      //         break;
      //       }
      //     }
      //   } else {
      //     id_dpump = 1;
      //   }

      //   while (localStorage.getItem(`dpump_${id_dpump}`)) {
      //     id_dpump++;
      //   }

      //   localStorage.setItem(`dpump_${id_dpump}`, `DPUMP_${id_dpump}`);
      //   c_dpump.push(id_dpump);

      //   const newNode0 = {
      //     id: `dpump_${id_dpump}`,
      //     type,
      //     position,
      //     style: { width: "auto", height: "auto", zIndex: 5 },
      //     data: { label: "node 2" },
      //   };

      //   node1.push(newNode0);
      //   setElements((es) => es.concat(newNode0));
      // }
      // disabledStripperAndExplorerTab();
    },
    [rfInstance]
  );
  // Added useCallback hook in version 11 @sudarsana
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    // setChecked(false);
    // convasEmptyFun();
  }, []);
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
  // #### function for deletion of unitop ########
  const handleConfirm = (isClose = false, elem) => {
    const { type } = elem;
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
      // @sudarsana here exiting code commented because issue is happing on connection between in hppump and pump
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
          // @sudarsana commeted this "item.includes(elem.id)" added in this if condtion  "item.slice(0, -1) === (elem.id)"
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
      // @sudarsana added here to solve the update edge issue connection after deleting
      if (updateconnectionInfoDelete) {
        delete connectionInfo[updateconnectionsource];
        updateconnectionInfoDelete = false;
      }
      // deleting the element and edge in version 11 code @sudarsana
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
    // @sudarsana this logic is main important for after deleting the unitops make sure stremNum_dict is empty
    if (!elem.id.includes("reactflow__edge")) {
      setTimeout(() => {
        localStorage.setItem("streamNum_dict", JSON.stringify({}));
        // @sudarsana (08/28/2024) here added connectionInfo empty for logic after deletion make it as a empty
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
    disabledStripperAndExplorerTab();
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
  const CustomNode = useCallback((node) => {
    const { id, type } = node;
    console.log(id, type);

    // Determine warning type and message
    let warningType = null;
    let warningMessage = "";
    let shouldShowWarning = false;

    // if (noSuitableModel) {
    //   warningType = "error";
    //   warningMessage = "There are no models that are rated for this flow rate";
    //   shouldShowWarning = true;
    // } else if (
    //   hasAutoSizeModel &&
    //   recommendedModel &&
    //   currentModel &&
    //   (!userHasConfigured || manuallyChanged)
    // ) {
    //   warningType = "warning";
    //   warningMessage = "Configure recommended model";
    //   shouldShowWarning = true;
    // }

    console.log(`[${id}] Should show warning:`, shouldShowWarning, {
      warningType,
      warningMessage,
    });
    console.log("  shouldShowWarning:", shouldShowWarning);

    const unitopCurrentId = id.replace(/[\d_]+/g, "");
    const checkUnitopExitsId = checkExitsLocalStorageValue(unitopCurrentId);
    $(`.Node_${id}`).css({
      width: "50px",
      display: "flex",
      // "flex-flow": "column",
      // "align-items": "center",
    });

    if (unitopCurrentId == "cartridgefilter") {
      let isShowError = false; // Setting Errors and Warning icons to hidden
      const unitop_name = localStorage.getItem(id)
        ? localStorage.getItem(id)
        : `CF_${checkUnitopExitsId}`; // Gettign UnitopName
      // const unitop_errors =
      //   error_details_info.length >= 1
      //     ? error_details_info.filter((d) => d.name === unitop_name)
      //     : []; // Getting No. of. specific Unitop Errors
      // const unitop_index =
      //   error_details_info.length >= 1
      //     ? error_details_info.findIndex((d) => d.name === unitop_name)
      //     : 0; // Getting Index of specific Unitop Errors
      // if (error_details_info.length >= 1 && unitop_errors.length >= 1) {
      //   // Setting Errors and Warning icons to show when Errors are avaliable only.
      //   isShowError = true;
      // }
      // const report_visibility = (event, val) => {
      //   setVisibleAnuj(!val); // Hidding Stripper Model Popup
      //   event.stopPropagation();
      //   event.preventDefault();
      //   setActiveIndexVal(unitop_index); // updating index values in Errors window
      //   setVisiableError(val); // show Errors Window
      // };
      // Fixing the bug issue GB-2518 @sudarsana
      const displayValue = localStorage.getItem(id)
        ? localStorage.getItem(id)
        : `CF_${checkUnitopExitsId}`;
      const unitopKey = displayValue.replace(/[\d_]+/g, "");
      const unitopName = unitopsNames[unitopKey];
      return (
        <UnitopComponent
          id={"id"}
          checkUnitopExitsId={checkUnitopExitsId}
          unitopName={unitopName}
          node={node}
          handleEnter={handleEnter}
          deleteUnitTop={(e, node) => deleteUnitTop(e, node)}
          warningType={warningType}
          image={CF_new}
        />
      );
    }
    // updateControlsButtonTitle();
    // Return null or other node types
    return null;
  }, []);

  // Added useMemo hook to avoid the re-render in version 11
  const nodeTypes = useMemo(
    () => ({
      // vinod added ancillary inline
      // customnode_stripper: CustomNode,
      customnode_cartridgefilter: CustomNode,
      // customnode_chemical_dosing: CustomNode,
      // customnode_uvlight: CustomNode,
      // customnode_dpump: CustomNode,

      // membrane filtartion
      // customnode_proflex: CustomNode,
      // customnode_zpak: CustomNode,
    }),
    [CustomNode]
  );

  console.log(c_anuj, id_anuj, node1, elements);
  return (
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
                nodes={elements} // changes to elements to nodes in version 11 @sudarsana
                edges={edges} // Added new property version 11 @sudarsana
                connectionRadius={100} // Added new Property version 11 @sudarsana
                onNodesChange={onNodesChange} // Added new property version 11 @sudarsana
                onEdgesChange={onEdgesChange} // Added new property version 11 @sudarsana
                onConnect={onConnect}
                // onConnect_new_PW={onConnect_new_PW}
                // onConnect_new_TC={onConnect_new_TC}
                deleteKeyCode={null} // @sudarsana backkey removed for deleting
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
                // onNodeClick={onClickElements && onElementClick} // Added onNodeClick updated name as onElementClick @sudarsana
                connectionLineType="step"
                onNodeDrag={onNodeDrag} // @sudarsana add for proximity connection
                onDrop={onDrop}
                onDragOver={onDragOver}
                onEdgeUpdate={onEdgeUpdate} // Added new property in version 11 @sudarsana
                snapToGrid // Added SnapTOGrid rin version @sudarsana
                snapGrid={[54, 54]} // @sudarsana changed values 54 and 54
                style={{ position: "absolute" }}
              >
                <Background color="#aaa" gap={16} />
                {/* <DownloadFlowsheet
                flowsheetImage={async (imageUrl) => {
                  const success = await callImageAPI(imageUrl);
                  if (!success) {
                    setErrorModal(true);
                    setErrorModalDetails(["Image upload to CPQ failed"]);
                  }
                }}
                triggerDownload={triggerDownload}
              /> */}
                {/* @sudarsana add for proximity connection */}
                {/* <Proximity /> */}
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
  );
}

export default Home;
