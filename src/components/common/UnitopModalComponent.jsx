/* eslint-disable no-console */
/* eslint-disable no-unneeded-ternary */
/* eslint-disable max-len */
/* eslint-disable no-useless-escape */
/* eslint-disable react/no-danger */
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { Rnd } from "react-rnd";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Grid,
  Button,
  Tooltip,
  Modal,
} from "@mui/material";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { closeIconBlack } from "../../assets/images";
import "./styles.scss";

const UnitopModalComponent = (props) => {
  console.log(props);
  /*
  const dataToPunchinUrlJSON = {
    10: 'https://watertechnologiesdev.bigmachines.com/config/proGen/filtration/cartridgeFilter?_from_punchin=true&_has_jet_access=true&_variable_name_punchin=true&',
    20: 'https://watertechnologiesdev.bigmachines.com/config/proGen/ancillary/chemicalFeed?_from_punchin=true&_has_jet_access=true&_variable_name_punchin=true&'
  };
  */
  const dataToPunchinUrlJSON =
    "https://watertechnologiesdev.bigmachines.com/config/proGen/filtration/cartridgeFilter?_from_punchin=true&_has_jet_access=true&_variable_name_punchin=true&";
  const storageKey = `unitop_${props?.unitopDetails.id}`;
  const unitopType = props?.unitopDetails.id;
  const {
    unitopDetails,
    flowIndex,
    setFlowIndex,
    autoSizeValue,
    autoSizeConfiguredData,
    setAutoSizeConfiguredData,
    updateProductQty,
    autoSizeUpdate,
    unitopVisible,
    unitopJSONData,
    autoSizeCalculation,
  } = props;
  const filterUnitopData = unitopJSONData?.filter((item) =>
    item?.slug?.includes(unitopDetails?.type)
  );
  const autoSizeUpdatedData = autoSizeCalculation?.find((item) =>
    unitopType?.includes(item?.id)
  );
  const outflow =
    autoSizeUpdatedData?.output != null &&
    !Number.isNaN(parseFloat(autoSizeUpdatedData.output))
      ? parseFloat(autoSizeUpdatedData.output).toFixed(1)
      : 0;

  const inflow =
    autoSizeUpdatedData?.inflow != null &&
    !Number.isNaN(parseFloat(autoSizeUpdatedData.inflow))
      ? parseFloat(autoSizeUpdatedData.inflow).toFixed(1)
      : 0;

  const recoveryValue =
    autoSizeUpdatedData?.recovery != null &&
    !Number.isNaN(parseFloat(autoSizeUpdatedData.recovery))
      ? parseFloat(autoSizeUpdatedData.recovery).toFixed(1)
      : 0;

  const waste =
    autoSizeUpdatedData?.waste != null &&
    !Number.isNaN(parseFloat(autoSizeUpdatedData.waste))
      ? parseFloat(autoSizeUpdatedData.waste).toFixed(1)
      : 0;

  console.log(filterUnitopData[0], unitopJSONData);
  const [age, setAge] = useState(autoSizeConfiguredData?.age);
  const [qty, setQty] = useState(() => {
    try {
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          return parsedData.qty || 1; // Default to 1 if not found
        } catch (e) {
          return 1;
        }
      }
      return 1; // Default value
    } catch (e) {
      console.error("Error retrieving qty from localStorage:", e);
      return 1;
    }
  });
  const [error, setError] = useState({});
  const [model, setModel] = useState(filterUnitopData[0]?.model || []);
  // Add state to track warning updates
  const [warningUpdateTrigger, setWarningUpdateTrigger] = useState(0);

  const [recoveryvalue, setRecoveryvalue] = useState(recoveryValue);

  // Add these functions to handle increment and decrement
  const changeQty = (delta) => {
    const newQty = qty + delta;
    if (newQty < 1) return; // prevent going below 1

    setQty(newQty);

    // Save to localStorage for this product
    localStorage.setItem(
      storageKey,
      JSON.stringify({ age, qty: newQty, id: storageKey, type: unitopType })
    );

    // Update parent data structures
    const selectedTransactionData = localStorage.getItem("cpq-data-key");
    const savedData = JSON.parse(localStorage.getItem(storageKey));

    if (age != null && selectedTransactionData) {
      const convertedStrToJsonData = JSON.parse(selectedTransactionData);
      const transactionID = convertedStrToJsonData.transactionId;
      updateProductQty(transactionID, savedData?.id, newQty);
    }
  };

  // Usage:
  const incrementQty = () => changeQty(1);
  const decrementQty = () => changeQty(-1);

  // Add this useEffect after your existing useEffect
  useEffect(() => {
    // Listen for autosize updates
    const unitopData = JSON.parse(
      localStorage.getItem(`unitop_${unitopType}`) || "{}"
    );

    const autoSizeData = autoSizeCalculation?.find(
      (item) => item?.id === unitopType
    );

    // Update age if autosize has set a new recommended model
    if (autoSizeData?.age && autoSizeData.age !== age) {
      setAge(autoSizeData.age);
    }

    // Also check unitop localStorage
    if (unitopData?.age && unitopData.age !== age) {
      setAge(unitopData.age);
    }

    // Update qty if changed
    if (unitopData?.qty && unitopData.qty !== qty) {
      setQty(unitopData.qty);
    }
  }, [autoSizeCalculation, autoSizeUpdate, unitopType]);
  useEffect(() => {
    const savedData = localStorage.getItem(storageKey);
    console.log(`Retrieved from ${storageKey}:`, savedData);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        console.log("Parsed data:", parsedData);
        setAge(parsedData.age || "");
        setQty(parsedData.qty || 1);
      } catch (e) {
        console.error("Error parsing data:", e);
        setAge("");
        setQty(1);
      }
    }

    // Also check autoSizeCalculation for this unitop
    const autoSizeData = autoSizeCalculation?.find(
      (item) => item?.id === unitopType
    );
    if (autoSizeData?.age) {
      setAge(autoSizeData.age);
    }
  }, [storageKey, autoSizeCalculation, unitopType]);

  const handleChange = (event) => {
    const newAge = event.target.value;
    setAge(newAge);

    // Save to localStorage
    localStorage.setItem(
      storageKey,
      JSON.stringify({ age: newAge, qty, id: storageKey, type: unitopType })
    );

    // Mark as manually changed (not from autosize)
    const unitopData = JSON.parse(
      localStorage.getItem(`unitop_${unitopType}`) || "{}"
    );

    const updatedUnitopData = {
      ...unitopData,
      age: newAge,
      qty,
      type: unitopType,
      manuallyChanged: true, // NEW FLAG: User changed the dropdown
    };

    localStorage.setItem(
      `unitop_${unitopType}`,
      JSON.stringify(updatedUnitopData)
    );

    console.log(`[${unitopType}] User manually changed model to: ${newAge}`);
    // Trigger warning recalculation
    setWarningUpdateTrigger((prev) => prev + 1);
  };
  const handleRecoverChange = (e) => {
    const { value } = e.target;
    // Remove all non-numeric characters
    const numericValue = value.replace(/[^0-9]/g, "");
    if (numericValue <= 100) {
      setRecoveryvalue(numericValue);
      // Save to localStorage
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          age,
          qty,
          id: storageKey,
          type: unitopType,
          recovery: parseFloat(numericValue),
        })
      );

      // Mark as manually changed (not from autosize)
      const unitopData = JSON.parse(
        localStorage.getItem(`unitop_${unitopType}`) || "{}"
      );

      const updatedUnitopData = {
        ...unitopData,
        age,
        qty,
        type: unitopType,
        recovery: parseFloat(numericValue),
        manuallyChanged: true, // NEW FLAG: User changed the dropdown
        manuallyChangedRecovery: true,
      };

      localStorage.setItem(
        `unitop_${unitopType}`,
        JSON.stringify(updatedUnitopData)
      );
    }
  };

  const handleSubmit = () => {
    // Save individual item
    localStorage.setItem(
      storageKey,
      JSON.stringify({ age, qty, id: storageKey, type: unitopType })
    );

    // Get existing data
    const autosizeValue = JSON.parse(
      localStorage.getItem("autoSizecalcultionValue") || "[]"
    );

    // Check if item exists
    const itemExists = autosizeValue.some((item) => item?.id === unitopType);

    let updatedData;

    if (itemExists) {
      // Update existing item
      updatedData = autosizeValue.map((item) => {
        if (item?.id === unitopType) {
          return {
            ...item,
            age,
            qty,
            userSelectedModel: true, // Mark as configured
            manuallyChanged: false, // Reset after submit
          };
        }
        return item;
      });
    } else {
      // Add new item if it doesn't exist
      updatedData = [
        ...autosizeValue,
        {
          id: unitopType,
          userSelectedModel: true,
          age,
          qty,
          manuallyChanged: false,
        },
      ];
    }

    // Save updated data
    localStorage.setItem(
      "autoSizecalcultionValue",
      JSON.stringify(updatedData)
    );

    // Update individual unitop data
    const unitopData = JSON.parse(
      localStorage.getItem(`unitop_${unitopType}`) || "{}"
    );

    const updatedUnitopData = {
      ...unitopData,
      age,
      qty,
      type: unitopType,
      userSelectedModel: true, // Mark as configured
      manuallyChanged: false, // Reset after submit
    };

    localStorage.setItem(
      `unitop_${unitopType}`,
      JSON.stringify(updatedUnitopData)
    );

    console.log("User submitted configuration:", updatedUnitopData);

    // console.log(storageKey);
    // console.log(age);
    const storeNodesData = localStorage.getItem("storeNodes");
    if (storeNodesData != null && storeNodesData !== "[]") {
      localStorage.setItem("cpqCanvasData", storeNodesData);
    }
    const selectedTransactionData = localStorage.getItem("cpq-data-key");
    if (age != null && selectedTransactionData !== null) {
      const convertedStrToJsonData = JSON.parse(selectedTransactionData);
      const transactionID = convertedStrToJsonData.transactionId;
      const regionSelected = convertedStrToJsonData.region;
      const salesOrgSelected = convertedStrToJsonData.salesOrg;
      const currencySelected = convertedStrToJsonData.currency;
      const frequencySelected = convertedStrToJsonData.frequency;
      const unitOfMeasureSelected = convertedStrToJsonData.uom;
      const generatedConfigId = transactionID;
      const quantitySelected = qty;
      // for duplicate we can avoid
      localStorage.setItem("lastUnitop", storageKey);
      localStorage.setItem("lastUnitopType", unitopType);
      // Get all keys from localStorage
      const allKeys = Object.keys(localStorage);
      // Filter keys that contain the transactionID
      const anujKeys = allKeys.filter((key) => key.includes(transactionID));
      // Extract all existing indices using array methods instead of for...of loop
      console.log(allKeys, anujKeys);
      const existingIndices = anujKeys
        .map((key) => {
          const match = key.match(new RegExp(`${transactionID}-(\\d+)$`));
          return match ? parseInt(match[1], 10) : -1;
        })
        .filter((index) => index !== -1);
      // Find the maximum index and add 1, or use 0 if no indices exist
      console.log(
        props?.anujDetails?.id,
        props?.anujDetails?.id?.split("_")[1]
      );
      const idNumber = props?.anujDetails?.id
        ? Number(props.anujDetails.id.split("_")[1])
        : null;
      // let transactionData= JSON.parse(localStorage.getItem(transactionID));
      // console.log(transactionData)
      // if(!!transactionData?.length){
      //   for(let i=1; i<indexValue; i++){
      //     const filteredData= transactionData.filter((item,i)=>{
      //           return item?.productIndex!==String(i);
      //     })
      //     myArray.splice(indexToModify, 0, newObject);
      //     console.log(filteredData, props.transactionCPQData);
      //   }
      // }

      if (!existingIndices || existingIndices.length === 0) {
        setFlowIndex(1);
      } else if (
        existingIndices[0] === idNumber - 1 &&
        props?.anujDetails?.id
      ) {
        setFlowIndex(Math.max(...existingIndices));
      } else {
        setFlowIndex(Math.max(...existingIndices) + 1);
      }
      console.log(
        `Next available index: ${flowIndex}`,
        existingIndices[0],
        idNumber
      );
      // Create the new key for localStorage
      const newKey = `${transactionID}-${flowIndex}`;
      // You can store your data with this new key if needed
      // localStorage.setItem(newKey, yourData);
      // Build the punch-in URL with the correct flowIndex
      const prepareFinalPunchinUrl = `${dataToPunchinUrlJSON}cDSConfigId_allFamilies=${generatedConfigId}&cDSProductIndex_allFamilies=${flowIndex}&canvasQty_allFamilies=${quantitySelected}&transactionId_allFamilies=${transactionID}&region_allFamilies=${regionSelected}&salesOrg_allFamilies=${salesOrgSelected}&currency_allFamilies=${currencySelected}&frequency_family=${frequencySelected}&unitOfMeasure_Family=${unitOfMeasureSelected}&cartridgeFilter_model=${age}`;
      console.log(prepareFinalPunchinUrl);
      // Uncomment to navigate to the URL
      window.location.href = prepareFinalPunchinUrl;
    }
    // console.log(age);
    // console.log("Chal Gya Bhai");
  };

  const {
    handleCloseStripper,
    anujDetails,
    disabledStripperAndExplorerTab,
    translateObject,
  } = props;

  const handleCloseSplitModal = () => {
    handleCloseStripper();
  };
    const getWarningMessage = useCallback((unitopId) => {
    const unitopData = JSON.parse(
      localStorage.getItem(`unitop_${unitopId}`) || "{}"
    );

    const autoSizeData = (() => {
      const data = localStorage.getItem("autoSizecalcultionValue");
      return data ? JSON.parse(data) : [];
    })();

    const matchingItem = autoSizeData?.find((item) => item?.id === unitopId);

    // Check if no suitable model exists
    const noSuitableModel =
      matchingItem?.noSuitableModel === true ||
      unitopData?.noSuitableModel === true;
    const maxCapacity = matchingItem?.maxCapacity || unitopData?.maxCapacity;
    const requiredOutput = matchingItem?.outputQtyCalculated;

    if (noSuitableModel) {
      return {
        type: "error",
        message: `There are no models that are rated for this flow rate. Required: ${requiredOutput?.toFixed(2)}, Max Available: ${maxCapacity?.toFixed(2)}`,
      };
    }

    // Check for recommendation warning
    const currentModel = unitopData?.age;
    const recommendedModel = matchingItem?.age;
    const hasAutoSizeModel =
      matchingItem?.age !== null && matchingItem?.age !== undefined;
    const manuallyChanged = unitopData?.manuallyChanged === true;
    const userSelectedModel = unitopData?.userSelectedModel === true;

    if (
      hasAutoSizeModel &&
      recommendedModel &&
      currentModel &&
      currentModel !== recommendedModel &&
      (!userSelectedModel || manuallyChanged)
    ) {
      return {
        type: "warning",
        message: `Recommended model: ${recommendedModel}. Current selection: ${currentModel}`,
      };
    }

    return null;
  }, []);

  // Use useMemo with warningUpdateTrigger as dependency
  const warningInfo = useMemo(
    () => getWarningMessage(unitopType),
    [unitopType, warningUpdateTrigger, getWarningMessage]
  );
  console.log(warningInfo);
  return (
    <Modal
      hideBackdrop
      open={unitopVisible}
      onClose={handleCloseSplitModal}
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
            <Grid item xs={12} className="stripper-header-grid" style={{margin:"10px"}}>
              <div className="stripper-header-text ft rufusBld no_drag S_heading" style={{fontSize:'18px',fontWeight:'bold'}}>
                {/* Cartridge  */}
                Filter
              </div>
              <div className="stripper-close-icon no_drag">
                <Tooltip title="Close">
                  <img
                    src={closeIconBlack}
                    alt="close"
                    onClick={handleCloseSplitModal}
                    style={{ display: "block" }}
                    className="pointer"
                  />
                </Tooltip>
              </div>
            </Grid>
                        {warningInfo && (
                          <div
                            style={{
                              padding: "10px 25px",
                              backgroundColor:
                                warningInfo.type === "error"
                                  ? "#fee"
                                  : "#fff3cd",
                              border: `1px solid ${
                                warningInfo.type === "error"
                                  ? "#f00"
                                  : "#ffc107"
                              }`,
                              borderRadius: "4px",
                              margin: "10px 20px",
                            }}
                          >
                            <p
                              style={{
                                color:
                                  warningInfo.type === "error"
                                    ? "red"
                                    : "#856404",
                                margin: 0,
                                fontWeight:
                                  warningInfo.type === "error"
                                    ? "bold"
                                    : "normal",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <span>
                                {warningInfo.type === "error" ? "" : ""}
                              </span>
                              <span>{warningInfo.message}</span>
                            </p>
                          </div>
                        )}
                        <Grid style={{width:"-webkit-fill-available", padding:"10px 20px 10px"}}>
                          <FormControl style={{width:"-webkit-fill-available"}}>
                            <InputLabel id="demo-simple-select-helper-label">
                              {/* Cartridge */}
                               Filter Base Model
                            </InputLabel>
                            <Select
                              labelId="demo-simple-select-helper-label"
                              id="demo-simple-select-helper"
                              value={age}
                              label="Cartridge Filter Base Model"
                              onChange={handleChange}
                              // disabled={disableData}
                            >
                              <MenuItem value="">
                                <em>None</em>
                              </MenuItem>
                              {model?.map((item) => {
                                return (
                                  <MenuItem value={item?.value}>
                                    {item?.label}
                                  </MenuItem>
                                );
                              })}
                            </Select>
                            <ListItem
                              className="list-item no_drag"
                              sx={{ mt: 1, mb: 1 }}
                              style={{
                                padding: "5px",
                                justifyContent: "left",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  width: "100%",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={decrementQty}
                                    disabled={qty <= 1}
                                    style={{
                                      minWidth: "30px",
                                      height: "30px",
                                      padding: "0px",
                                      background:
                                        "linear-gradient(90deg, #B91372 0%, #6B0F1A 100%)",
                                      fontWeight: "bold",
                                      fontSize: "20px",
                                      color: "black",
                                    }}
                                  >
                                    -
                                  </Button>
                                  <input
                                    type="number"
                                    value={qty}
                                    readOnly
                                    variant="outlined"
                                    style={{
                                      width: "50px",
                                      textAlign: "center",
                                      margin: "0 8px",
                                      padding: "5px",
                                      height: "20px",
                                    }}
                                  />
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={incrementQty}
                                    style={{
                                      minWidth: "30px",
                                      height: "30px",
                                      padding: "0px",
                                      background:
                                        "linear-gradient(90deg, #2E8B57 0%, #006400 100%)",
                                      fontWeight: "bold",
                                      fontSize: "20px",
                                      color: "black",
                                    }}
                                  >
                                    +
                                  </Button>
                                </div>
                              </div>
                            </ListItem>
                            <div style={{ width: "100%" }}>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  width: "100%",
                                }}
                              >
                                <p
                                  style={{
                                    marginTop: "5px",
                                    width: "100%",
                                    fontSize: "14px",
                                    borderRadius: "5px",
                                    padding: "5px 0",
                                    display: "inline",
                                  }}
                                >
                                  <span style={{ fontWeight: 600 }}>
                                    Inflow:
                                  </span>{" "}
                                  <span
                                    style={{
                                      backgroundColor: "#0679cc",
                                      color: "white",
                                      padding: "6px 10px",
                                      borderRadius: "5px",
                                    }}
                                  >
                                    {inflow}
                                  </span>
                                </p>
                                <p
                                  style={{
                                    marginTop: "5px",
                                    width: "100%",
                                    fontSize: "14px",
                                    borderRadius: "5px",
                                    textAlign: "center",
                                    padding: "5px 0",
                                    display: "inline",
                                  }}
                                >
                                  <span style={{ fontWeight: 600 }}>
                                    Waste:{" "}
                                  </span>{" "}
                                  <span
                                    style={{
                                      backgroundColor: "#0679cc",
                                      color: "white",
                                      padding: "6px 10px",
                                      borderRadius: "5px",
                                    }}
                                  >
                                    {waste}
                                  </span>
                                </p>
                                <p
                                  style={{
                                    marginTop: "5px",
                                    width: "100%",
                                    fontSize: "14px",
                                    borderRadius: "5px",
                                    padding: "5px 0",
                                    display: "inline",
                                    textAlign: "end",
                                  }}
                                >
                                  <span style={{ fontWeight: 600 }}>
                                    Outflow:
                                  </span>{" "}
                                  <span
                                    style={{
                                      backgroundColor: "#0679cc",
                                      color: "white",
                                      padding: "6px 10px",
                                      borderRadius: "5px",
                                    }}
                                  >
                                    {outflow}
                                  </span>
                                </p>
                              </div>
                            </div>
                            <p
                              style={{
                                marginTop: "5px",
                                width: "100%",
                                fontSize: "14px",
                                // textAlign: "center",
                                borderRadius: "5px",
                                padding: "5px 0",
                                display: "inline",
                              }}
                            >
                              <span style={{ fontWeight: 600 }}>
                                Recovery flow:
                              </span>{" "}
                              <input
                                style={{
                                  width: "38px",
                                  borderBottom: "1px solid",
                                  outline: "none",
                                  border: "none",
                                  paddingLeft: "15px",
                                }}
                                value={recoveryvalue}
                                onChange={handleRecoverChange}
                              />
                              {/* {recoveryValue} */}%
                            </p>
                            <ListItem
                              className="list-item no_drag"
                              sx={{ mt: 1, mb: 1 }}
                              style={{
                                padding: "5px",
                                justifyContent: "left",
                              }}
                            >
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={handleSubmit}
                                disabled={!age}
                                className="btn-auto-width stripper-btn sansW4SeLig M_Bold Primary_Default_Button"
                              >
                                Submit
                              </Button>
                            </ListItem>
                          </FormControl>
                        </Grid>
                      </Grid>
        </Rnd>
      </Box>
    </Modal>
  );
};
export default UnitopModalComponent;
