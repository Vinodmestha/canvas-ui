/* eslint-disable max-len */
/* eslint-disable no-console */
/* eslint-disable no-cond-assign */
/* eslint-disable no-plusplus */
/* eslint-disable indent */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-prototype-builtins */

import React, { useState, useEffect, useRef } from "react";
// import { useTranslation } from 'react-i18next';
import { getSmoothStepPath, EdgeLabelRenderer, BaseEdge } from "reactflow"; // Added version 11 import statement

// import { defaultModalOptions } from "./shared/constantVariable";
import { getBorderColor, defaultModalOptions } from "../utils/index";

let previousNum = 0;
let streamNum_dict_temp = {};
let valueforCustomEdge = 0;
// let path = '';
let defaultvalueCustomEdge = 0;
const wex_coordinate_num = 265;
const tc_pw_coordinate_num = 105;
export const CustomEdge = (props) => {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    markerEnd,
    data,
  } = props;
  // const { t } = useTranslation();
  // Added version 11
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const [text, setText] = useState("");
  const [, setModalOption] = useState(defaultModalOptions);
  // here using useRef hook for update the DOM of input file we using this because of input file using defaultValue
  // when using default value that input file is not updating the value so that we are using useRef hook
  const inputRef = useRef(null);
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = text; // Update the input field's value when `text` changes
    }
  }, [text]);
  useEffect(() => {
    if (data) {
      if (localStorage.getItem("loadCheck")) {
        setText(Number(data.text));
        streamNum_dict_temp[Number(data.text)] = Number(data.text);
      } else if (data.connection_number === false) {
        if (data.streamNum_dict[Number(data.text)])
          setText(data.streamNum_dict[Number(data.text)]);
        else setText(Number(data.text));
        localStorage.setItem(
          "streamNum_dict",
          JSON.stringify(data.streamNum_dict)
        );
      } else if (data.update_connection_number === false) {
        setText(Number(data.text));
        data.text = Number(data.text);
        data.streamNum_dict[Number(data.text)] = Number(data.text);
        localStorage.setItem(
          "streamNum_dict",
          JSON.stringify(data.streamNum_dict)
        );
        streamNum_dict_temp = data.streamNum_dict;
      } else {
        setText(Number(data.text));
        data.text = Number(data.text);
        data.streamNum_dict[Number(data.text)] = Number(data.text);
        localStorage.setItem(
          "streamNum_dict",
          JSON.stringify(data.streamNum_dict)
        );
        streamNum_dict_temp = data.streamNum_dict;
      }
    }
  }, [data]);
  const edgeTextValidation = (e) => {
    // disable duplicate message when we are deleting any streams
    if (e.relatedTarget) {
      if (e.relatedTarget.classList.length >= 8) {
        return;
      }
    }
    // added logic for when in rara cases if stream number is empty value then use able to add the number and automatically added in streamdict
    const streamNumDict = JSON.parse(localStorage.getItem("streamNum_dict"));
    if (!streamNumDict.hasOwnProperty(data.text)) {
      delete data.text;
    }
    // disable populate duplicate message when user clicked on same textbox
    if (data.text === Number(e.target.value)) {
      return;
    }
    data.streamNum_dict = JSON.parse(localStorage.getItem("streamNum_dict"));
    const num = Object.keys(data.streamNum_dict).find(
      (key) => data.streamNum_dict[key] === Number(e.target.value)
    );

    if (num) {
      if (data.setModalOption) {
        data.setModalOption({
          ...defaultModalOptions,
          visible: true,
          title: "Error",
          message: "Entered stream number is duplicated!",
          yesOrNo: false,
          onNo: () => setModalOption(defaultModalOptions),
          type: "error",
        });
      } else {
        localStorage.setItem("modelOpenDuplicate", true);
        // setTimeout(() => {
        //   alert(t('Entered stream number is duplicated!')); // eslint-disable-line no-alert
        // }, 500);
      }
      setText(Number(data.text));
      return;
    }
    previousNum = data.text; // e.target[Object.keys(e.target)[1]].value;
    data.streamNum_dict[Number(e.target.value)] = Number(e.target.value);
    streamNum_dict_temp[Number(e.target.value)] = Number(e.target.value);
    data.text = Number(e.target.value);
    const updatedNum = Object.keys(data.streamNum_dict).find(
      (key) => data.streamNum_dict[key] === Number(previousNum)
    );
    if (updatedNum) {
      delete data.streamNum_dict[updatedNum];
      delete streamNum_dict_temp[updatedNum];
    }
    localStorage.setItem("streamNum_dict", JSON.stringify(data.streamNum_dict));
    // to-do here
    localStorage.setItem("autoStremId", "true");
    document.querySelectorAll(".menu-item").forEach((ele, ind) => {
      if (ind > 1) ele.classList.add("disabled");
    });
    localStorage.setItem("edgeChange", true);
    localStorage.setItem("globalExitBtn", "true");

    // If you need to update the input field's value after validation
    if (inputRef.current) {
      inputRef.current.value = data.text; // Update the input field's value based on validation logic
    }
  };
  const edgeTextFn = (e) => {
    const value = e.target.value;
    const currentState = JSON.parse(localStorage.getItem("currentStateFlow"));
    console.log(value, currentState);
    if (/\D/.test(value)) {
      // Show an alert message
      document.querySelector("#toatster-msg span").innerHTML =
        "Stream number should accept only integers";
      document.querySelector("#toatster-msg").style.display = "block";
      setTimeout(() => {
        document.querySelector("#toatster-msg").style.display = "none";
        document.querySelector("#toatster-msg span").innerHTML = "";
      }, 3000);
    }
    // Use a regular expression to remove any non-digit characters
    const filteredValue = value.replace(/\D/g, "");
    // Set the text using the filtered value
    setText(Number(filteredValue));

    // If you need to update the input field's value after validation
    if (inputRef.current) {
      inputRef.current.value = Number(filteredValue); // Update the input field's value based on validation logic
    }
  };
  const handleFocus = () => {
    if (!localStorage.getItem("streamNum_dict")) {
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
      }
    }
    // Add any additional logic you want to execute when the input is focused
  };
  const iff = (condition, then, otherwise) => (condition ? then : otherwise);
  // creating edge connection for down to bottom in wex unitop by sudarsana
  const datatext = id;
  const searchString = "wex";
  const startIndex = datatext.indexOf(searchString);
  const endIndex = startIndex + searchString.length;
  const getwexID = datatext.slice(startIndex, endIndex);
  // creating edge connection for down to bottom in peltonwheel unitop by sudarsana
  const serachString_peltonwheel = "peltonwheel";
  const startIndex_peltonwheel = datatext.indexOf(serachString_peltonwheel);
  const endIndex_peltonwheel =
    startIndex_peltonwheel + serachString_peltonwheel.length;
  const getIDpeltonwheel = datatext.slice(
    startIndex_peltonwheel,
    endIndex_peltonwheel
  );
  // creating edge connection for down to bottom in TurboCharger unitop by sudarsana
  const serachString_turbocharger = "TC";
  const startIndex_turbocharger = datatext.indexOf(serachString_turbocharger);
  const endIndex_turbocharger =
    startIndex_turbocharger + serachString_turbocharger.length;
  const getIDturbocharger = datatext.slice(
    startIndex_turbocharger,
    endIndex_turbocharger
  );
  let sourcePostions;
  if (sourcePosition === "right") {
    sourcePostions =
      sourceX > targetX
        ? `M${sourceX},${sourceY} L${sourceX + 30} ${sourceY} L${
            sourceX + 30
          } ${sourceY + 65} L${targetX - 100},${sourceY + 65} L${
            targetX - 100
          },${targetY} L${targetX},${targetY}`
        : edgePath;
  }
  if (sourcePosition === "left") {
    sourcePostions =
      sourceX > targetX
        ? `M${sourceX},${sourceY} L${sourceX + 30} ${sourceY} L${
            sourceX + 30
          } ${sourceY + 65} L${targetX - 100},${sourceY + 65} L${
            targetX - 100
          },${targetY} L${targetX},${targetY}`
        : edgePath;
  }
  // function addPath(sourceX, sourceY, targetX, targetY) {
  //   path = `M${sourceX},${sourceY} L${sourceX + 30} ${sourceY} L${sourceX + 30} ${sourceY + data.sourceYIncrement} L${targetX - 100},${sourceY + data.sourceYIncrement} L${targetX - 100},${targetY} L${targetX},${targetY}`;
  // }
  // if (sourcePosition === 'right' && sourceX > targetX) {
  //   addPath(sourceX, sourceY, targetX, targetY);
  // }
  // @Sudarsana Reduce the size of subnetwork fixing the lenght of the stream decreases -- start
  let number = 0;
  if (getwexID === "wex") {
    number = wex_coordinate_num;
  } else {
    number = tc_pw_coordinate_num;
  }
  // end
  // @sudarsana Bug fixing for recycle of concentrate streams overlapping mixsplit --> start
  // the below expression for recycle of only two mixsplit to get numbers[0] as source and numbers[1] as target
  const regex = /_(\d+)[ca]/g;
  const regex1 = /_(\d+)[da]/g;
  const numbers = [];
  let match;
  while ((match = regex.exec(id))) {
    numbers.push(parseInt(match[1], 10));
  }
  while ((match = regex1.exec(id))) {
    numbers.push(parseInt(match[1], 10));
  }
  let maxNum = numbers[0];
  for (let i = 1; i < numbers.length; i++) {
    if (numbers[i] > maxNum) {
      maxNum = numbers[i];
    }
  }
  let mixSplitPostions = "";
  if (
    id === `reactflow__edge-mixsplit_${numbers[0]}c-mixsplit_${numbers[1]}a` &&
    sourcePosition === "right" &&
    sourceX > targetX
  ) {
    // sourceYIncrement recycle for mixsplit to mixsplit
    valueforCustomEdge = data.sourceYIncrement;
    mixSplitPostions = `M${sourceX},${sourceY} L${sourceX + 30} ${sourceY} L${
      sourceX + 30
    } ${sourceY + valueforCustomEdge} L${targetX - 100},${
      sourceY + valueforCustomEdge
    } L${targetX - 100},${targetY} L${targetX},${targetY}`;
    data.sourcePostion = sourcePosition;
    defaultvalueCustomEdge = 0;
  } else if (sourcePosition === "right" && sourceX > targetX) {
    //  sourceYIncrement  recycle for two normal unitops different from each other
    valueforCustomEdge = data.sourceYIncrement;
    mixSplitPostions = `M${sourceX},${sourceY} L${sourceX + 30} ${sourceY} L${
      sourceX + 30
    } ${sourceY + valueforCustomEdge} L${targetX - 100},${
      sourceY + valueforCustomEdge
    } L${targetX - 100},${targetY} L${targetX},${targetY}`;
    defaultvalueCustomEdge = 0;
  } else if (sourcePosition === "bottom" && sourceX > targetX) {
    //  sourceYIncrement  recycle from bottom node unitops
    valueforCustomEdge = data.sourceYIncrement - 30;
    mixSplitPostions = `M${sourceX},${sourceY} L${sourceX + 30} ${sourceY} L${
      sourceX + 30
    } ${sourceY + valueforCustomEdge} L${targetX - 100},${
      sourceY + valueforCustomEdge
    } L${targetX - 100},${targetY} L${targetX},${targetY}`;
    defaultvalueCustomEdge = 0;
  }
  // console.log(text);
  return (
    <>
      <BaseEdge
        id={id}
        path={iff(
          sourcePosition === "bottom" || sourcePosition === "top",
          sourceX > targetX
            ? `M${sourceX},${sourceY} L${sourceX} ${sourceY} L${sourceX} ${
                sourceY + valueforCustomEdge
              } L${targetX - 100},${sourceY + valueforCustomEdge} L${
                targetX - 100
              },${targetY} L${targetX},${targetY}`
            : edgePath,
          sourceX > targetX ? mixSplitPostions : edgePath
        )}
        className="edgeColor"
        markerEnd={markerEnd}
      />
      <EdgeLabelRenderer>
        <input
          id={text}
          ref={inputRef} // Attach the ref here
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${
              sourceX > targetX ? (sourceX + targetX - 100) / 2 : labelX
            }px ,${
              sourceX > targetX
                ? sourceY + (defaultvalueCustomEdge + valueforCustomEdge)
                : labelY
            }px)`,
            pointerEvents: "all",
            border: "1px solid lightgrey",
            width: 30,
            textAlign: "center",
            fontSize: 10,
            zIndex: 5,
            background: "white",
          }}
          className="nodrag nopan"
          defaultValue={text}
          onChange={edgeTextFn}
          onBlur={edgeTextValidation}
          onFocus={handleFocus}
          disabled
        />
      </EdgeLabelRenderer>
    </>
  );
};
