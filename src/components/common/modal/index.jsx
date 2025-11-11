import React from "react";
import Warning from "./warning";
import Error from "./error";
import Success from "./success";
import "./notification-modal.scss";

const NotificationModal = (props) => {
  const { options, handleClose } = props;
  const { type } = options;

  const renderModal = () => {
    if (type === "success") {
      return <Success options={options} handleClose={handleClose} />;
    }
    if (type === "error") {
      return <Error options={options} handleClose={handleClose} />;
    }
    return <Warning options={options} handleClose={handleClose} />;
  };

  return <>{renderModal()}</>;
};

export default NotificationModal;
