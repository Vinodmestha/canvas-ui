
/* eslint-disable no-console */
/* eslint-disable no-trailing-spaces */
/* eslint-disable no-lonely-if */
import $ from "jquery";

export const getBorderColor = (id, str = "remove") => {
  console.log(id);
  if (document.querySelector(`.Node_${id}`)) {
    const styleProp = document
      .querySelector(`.Node_${id}`)
      .closest(".react-flow__node");
    styleProp.style.setProperty(
      "border",
      str && str === "add" ? "" : "1px solid #ddd",
      str && str === "add" ? "" : "important"
    );
  }
};

export const removeCrossIcon = (item) => {
  if (item.id.indexOf("mixsplit_") >= 0) {
    getBorderColor(item.id);
    if (document.querySelector(`.Node_${item.id}`)) {
      document
        .querySelector(`.Node_${item.id}`)
        .closest(".custom-node-element")
        .querySelector(".unitop-close-icon-div")
        .classList.add("hide");
      document
        .querySelector(`.Node_${item.id}`)
        .closest(".react-flow__node")
        .classList.add("disabled");
    }
  }
};

export const defaultModalOptions = {
  visible: false,
  message: "Something went wrong",
  title: "Warning",
  onNo: null,
  onYes: null,
  yesOrNo: true,
  type: "warning",
};


export const decimalFormatter = (value, decimal) => {
  const number = value ? Number(value).toFixed(decimal) : 0;
  return number;
};

export const floatFormat = (value) => {
  const floatNumber = value ? parseFloat(value) : 0;
  return floatNumber;
};

export const isObjectEmpty = (obj) => {
  // retun true if key value presnet & return false if obj is empty {}
  if (!obj) return false;
  return Object.getOwnPropertyNames(obj).length >= 1;
};
export const checkLocalStorageValue = (key) => {
  const value = localStorage.getItem(key);
  if (value !== null && value !== undefined && value !== "") {
    return true; // Key has a value
  }
  return false; // Key does not have a value
};

export const getStyles = (name, personName, theme) => {
  return {
    fontWeight:
      personName === name
        ? theme.typography.fontWeightBold
        : theme.typography.fontWeightMedium,
  };
};

export const toFixedNumber = (value, fixedValue) => {
  if (!value) return 0;
  return Number(value).toFixed(fixedValue);
};

export const getMassAndCharge = (obj) => {
  if (!isObjectEmpty(obj)) return {};
  const data = [...cationsProp, ...anionsProp].find(
    (val) => val.Ion === obj.Ion
  );
  return data;
};

export const getCellStyle = (params) => {
  let styleObj = {
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    overflow: "hidden",
    display: "block",
  };
  if (
    !canCellBeEditable(params) &&
    !["Total Anions", "Total Cations"].includes(params.data.Ion)
  ) {
    styleObj = { ...styleObj, cursor: "not-allowed", color: "#00000061" };
  }
  return styleObj;
};

// drag drop unitop value get unique by shekhar 16-02-2023
export const checkExitsLocalStorageValue = (unitopCurrentId) => {
  const storeKey = Object.keys(localStorage).filter((data) => {
    return data.indexOf(unitopCurrentId) === 0;
  });
  let count = 1;
  if (storeKey.length) {
    const dataArr = [];
    storeKey.forEach((data) => {
      let val = localStorage.getItem(data);
      val = val.split("_");
      if (val.length > 1) {
        val = val[val.length - 1];
      }
      dataArr.push(val);
    });
    for (let i = 0; i < dataArr.length; i += 1) {
      const val = count.toString();
      if (dataArr.indexOf(val) < 0) {
        break;
      }
      count += 1;
    }
    return count;
  }
  return count;
};

// remove unwanted localstorage data and blank storage
export const removeLocalStorageValue = (str) => {
  const localStorageData = Object.keys(localStorage);
  if (localStorageData.length) {
    localStorageData.forEach((data) => {
      const value = localStorage.getItem(data).trim();
      const dataVal = ["", "null", "undefined", "{}"];
      if (str === "removeValue") {
        if (dataVal.indexOf(value) >= 0) {
          localStorage.removeItem(data);
        }
      } else {
        /**
         * check localstorage value is '', null, undefined, {}
         * remove the value in localstorage
         */
        if (dataVal.indexOf(value) >= 0) {
          localStorage.removeItem(data);
        } else {
          /**
           * check localstorage if any key contains `_`
           * exits only one _ in the key
           * second value is number then value is deleted
           * like Feed_1, cls_2, Feed_2
           */
          const val = data.split("_");
          if (val.length === 2 && Number(val[1])) {
            const splitData = `${val[0]}_`;
            if (localstorageVal.indexOf(splitData) >= 0) {
              localStorage.removeItem(data);
            }
          }
        }
      }
    });
  }
  return false;
};
// unitop duplicate value not accepted.
export const checkDuplicateValue = (currentValue, id) => {
  const localStorageData = Object.keys(localStorage);
  let dataFlag = false;
  if (localStorageData.length) {
    localStorageData.forEach((data) => {
      if (data !== id) {
        const splitData = data.slice(0, data.lastIndexOf("_") + 1);
        // const splitData = `${data.split('_')[0]}_`;
        if (localstorageVal.indexOf(splitData) >= 0) {
          if (localStorage.getItem(data).trim() === currentValue) {
            dataFlag = true;
          }
        }
      }
    });
  }
  return dataFlag;
};

// find duplicate value in unitop
export const findDuplicate = (arry) => {
  const toFindDuplicates = (arry) =>
    arry.filter((item, index) => arry.indexOf(item) !== index);
  const duplicateElementa = toFindDuplicates(arry);
  return duplicateElementa;
};
export const findDuplicateData = () => {
  const localStorageData = Object.keys(localStorage);
  if (localStorageData.length) {
    const duplicateUnitopName = [];
    localStorageData.forEach((data) => {
      const splitData = data.slice(0, data.lastIndexOf("_") + 1);
      // const splitData = `${data.split('_')[0]}_`;
      if (localstorageVal.indexOf(splitData) >= 0) {
        const val = localStorage.getItem(data);
        duplicateUnitopName.push(val);
      }
    });
    return findDuplicate(duplicateUnitopName);
  }
};

/* ######################### Error Data for Unitop ######################### */
export const getErrorHelperData = (obj) => {
  const errorListData = [];
  let errorFlag = false;
  let warningFlag = false;
  let flagError = "no-error";
  const data = Object.keys(obj);
  data.forEach((ele) => {
    const k = { ...obj[ele].output_user };
    if (Object.keys(k).length && k.err_list && k.err_list.length > 0) {
      errorListData.push({
        name: ele,
        data: k.err_list,
      });
      k.err_list.map((errlist) => {
        if (errlist.toLowerCase().indexOf("warning") === 0) {
          warningFlag = true;
        } else if (errlist.toLowerCase().indexOf("fatal error") === 0) {
          errorFlag = true;
        }
      });
    }
  });
  if ((warningFlag && errorFlag) || (!warningFlag && errorFlag)) {
    flagError = "errorwarning";
  } else if (warningFlag && !errorFlag) {
    flagError = "warning";
  }
  return { str: flagError, data: errorListData };
};

export const updateControlsButtonTitle = () => {
  const intevalControls = setInterval(() => {
    const element = document.querySelectorAll(".react-flow__controls-button");
    if (element && element.length) {
      clearInterval(intevalControls);
      element.forEach((ele, ind) => {
        ele.setAttribute("data-title", controlsButtonTitle[ind]);
      });
    }
  }, 1);
};

export const streamDataInformation = (stream_no) => {
  let stream_ouput_data = localStorage.getItem("stream_ouput_data");
  let system_units = localStorage.getItem("system-units");
  let unit_set_dict = localStorage.getItem("unit_set_dict");
  let arr = [];
  if (stream_ouput_data && (system_units || unit_set_dict)) {
    stream_ouput_data = JSON.parse(stream_ouput_data)[stream_no];
    system_units = JSON.parse(system_units);
    unit_set_dict = JSON.parse(unit_set_dict);
    const flow =
      (system_units && system_units.flow) ||
      (unit_set_dict && unit_set_dict["Volume Flow"]);
    const pressure =
      (system_units && system_units.pressure) ||
      (unit_set_dict && unit_set_dict.Pressure);
    arr = [
      { str: "Stream No", value: Number(stream_no), unitType: "" },
      {
        str: "Flow",
        value: Number(stream_ouput_data.prop_dict.flow).toFixed(2),
        unitType: flow,
      },
      {
        str: "Pressure",
        value: Number(stream_ouput_data.prop_dict.press).toFixed(2),
        unitType: pressure,
      },
      {
        str: "TDS",
        value: Number(stream_ouput_data.prop_dict.tds).toFixed(2),
        unitType: "mg/l",
      },
      {
        str: "pH",
        value: Number(stream_ouput_data.prop_dict.ph).toFixed(2),
        unitType: "",
      },
      {
        str: "Alkalinity",
        value: Number(stream_ouput_data.prop_dict.malk).toFixed(2),
        unitType: "ppm CaCO3",
      },
    ];
  }
  return arr;
};

const streamHighlitedStart = (str, buttonElement) => {
  if (str === "empty") {
    buttonElement.current.forEach((ele) => {
      if (ele) {
        ele.style.border = "2px dotted #4b93f4";
        ele.style.borderRadius = "22%";
      }
    });
  } else {
    if (str === "less") {
      buttonElement.current.forEach((ele, ind) => {
        if (ind < 1 && ele) {
          ele.style.border = "2px dotted #4b93f4";
          ele.style.borderRadius = "50%";
        }
      });
    } else {
      buttonElement.current.forEach((ele, ind) => {
        if (ind > 1 && ele) {
          ele.style.border = "2px dotted #4b93f4";
          ele.style.borderRadius = "50%";
        }
      });
    }
  }
};
const streamHighlitedEnd = (buttonElement) => {
  buttonElement.current.forEach((ele) => {
    if (ele) {
      ele.style.border = "";
      ele.style.borderRadius = "";
    }
  });
};
export const streamDataHighlited = (buttonElement, str) => {
  let count = 0;
  streamHighlitedStart(str, buttonElement);
  const highlitedInterval = setInterval(() => {
    if (count > 5) {
      clearInterval(highlitedInterval);
      streamHighlitedEnd(buttonElement);
      return;
    }
    streamHighlitedEnd(buttonElement);
    setTimeout(() => {
      streamHighlitedStart(str, buttonElement);
    }, 500);
    count += 1;
  }, 1000);
};


