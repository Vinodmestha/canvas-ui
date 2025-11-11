import React from "react";
import { useTranslation } from "react-i18next";
import Tooltip from "@mui/material/Tooltip";
import Draggable from "react-draggable";
import { successIconNew, closeIconBlack } from "../../../assets/images";
import "./notification-modal.scss";

const SuccessModal = (props) => {
  const { options, handleClose } = props;
  const { visible, message, title } = options;
  const { t } = useTranslation();
  const translateObject = t;
  return (
    <div
      className={
        visible ? "init_notification" : "notification-modal display-none"
      }
    >
      <Draggable
        handle=".notification-modal-container"
        cancel=".notification-modal-footer, .notification-modal-content-item, .no-drag"
        onStart={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <div
          className={
            visible ? "notification-modal" : "notification-modal display-none"
          }
        >
          <div className="notification-modal-container no-drag">
            <div className="notification-modal-header">
              <div className="rufusReg S_heading">{translateObject(title)}</div>
              <div className="notification-close-text no-drag">
                <Tooltip title="Close">
                  <img
                    src={closeIconBlack}
                    alt="close"
                    onClick={handleClose}
                    style={{ width: "14px", padding: "5px" }}
                    className="pointer"
                  />
                </Tooltip>
              </div>
            </div>
            <div className="notification-modal-content">
              <div className="notification-modal-content-item">
                <img
                  src={successIconNew}
                  alt="warning-icon"
                  className="success-icon"
                />
              </div>
              <div className="notification-modal-content-item">
                {translateObject(message)}
              </div>
            </div>
          </div>
        </div>
      </Draggable>
    </div>
  );
};

export default SuccessModal;
