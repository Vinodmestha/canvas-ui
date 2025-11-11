/* eslint-disable react/no-danger */
/* eslint-disable no-console */
import React, {useRef}from "react";
import { useTranslation } from "react-i18next";
import { Button, Tooltip } from "@mui/material";
import Draggable from "react-draggable";
import { warningRedIcon, closeIconBlack } from "../../../assets/images";
import "./notification-modal.scss";

const WarningModal = (props) => {
  const { options, handleClose } = props;
  const {
    visible,
    message,
    title,
    onYes,
    onNo,
    onOkay = false,
    yesOrNo,
    closeText = "Close",
  } = options;
  const  nodeRef= useRef(null)
  const { t } = useTranslation();
  const translateObject = t;
  return (
    <div
      className={
        visible ? "init_notification" : "notification-modal display-none"
      }
    >
      <Draggable
       nodeRef={nodeRef}
        handle=".notification-modal-container"
        cancel=".notification-modal-footer, .notification-modal-content-item, .no-drag"
        onStart={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <div
         ref={nodeRef}
          className={
            visible ? "notification-modal" : "notification-modal display-none"
          }
        >
          <div className="notification-modal-container no-drag">
            <div className="notification-modal-header">
              <div className="rufusReg S_heading">
                {title === "Warning"
                  ? translateObject("Warnings")
                  : translateObject("Reminder")}
              </div>
              {closeText !== "Sign In" && (
                <div className="notification-close-text no-drag">
                  <Tooltip title="Close" className="no-drag">
                    <img
                      src={closeIconBlack}
                      alt="close"
                      onClick={handleClose}
                      style={{ width: "14px", padding: "5px" }}
                      className="pointer no_drag"
                    />
                  </Tooltip>
                </div>
              )}
            </div>
            <div
              className={`notification-modal-content warning ${
                yesOrNo ? "border-bottom" : ""
              }`}
            >
              <div className="notification-modal-content-item">
                <img src={warningRedIcon} alt="warning-icon" />
              </div>
              <div
                className="notification-modal-content-item"
                dangerouslySetInnerHTML={{ __html: translateObject(message) }}
              />
            </div>
            <div className="notification-modal-footer">
              {yesOrNo ? (
                <>
                  <Button
                    className="cancel-btn M_Bold Secondary-Default_button"
                    onClick={onNo}
                  >
                    {translateObject("No")}
                  </Button>
                  <Button
                    className="ok-btn M_Bold Primary_Default_Button"
                    onClick={onYes}
                  >
                    {translateObject("Yes")}
                  </Button>
                </>
              ) : (
                ""
              )}
              {onOkay ? (
                <Button
                  className="ok-btn M_Bold Primary_Default_Button"
                  onClick={onYes}
                >
                  {translateObject("Ok")}
                </Button>
              ) : (
                ""
              )}
            </div>
          </div>
        </div>
      </Draggable>
    </div>
  );
};

export default WarningModal;
