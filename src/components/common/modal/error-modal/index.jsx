/* eslint-disable no-console */
/* eslint-disable no-unneeded-ternary */
/* eslint-disable max-len */
/* eslint-disable no-useless-escape */
/* eslint-disable react/no-danger */
import React from "react";
import { Rnd } from "react-rnd";
import {
  Box,
  Grid,
  Tooltip,
  Modal,
} from "@mui/material";
import { closeIconBlack } from "../../../../assets/images";
import "./stripper.scss";

const ErrorModal = (props) => {
  const {errorModal, handleCloseModal, errorModalDetails} =props;
  return (
    <Modal
      hideBackdrop
      open={errorModal}
      onClose={handleCloseModal}
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
          {/* <Notification
            options={modalOption}
            handleClose={() => setModalOption(defaultModalOptions)}
          /> */}
          <Grid container className="stripper-grid-container">
            <Grid item xs={12} className="stripper-header-grid" style={{background:"#eee",padding:"10px 10px 5px", borderBottom:"1px solid"}}>
              <div className="stripper-header-text ft rufusBld no_drag S_heading" style={{fontSize:"18px", fontWeight:"bold"}}>
                Failed to Add Data to CPQ
              </div>
              <div className="stripper-close-icon no_drag">
                <Tooltip title="Close">
                  <img
                    src={closeIconBlack}
                    alt="close"
                    onClick={handleCloseModal}
                    style={{ display: "block", cursor:"pointer" }}
                    className="pointer"
                  />
                </Tooltip>
              </div>
            </Grid>
          </Grid>
          <Grid item xs={12} >
            <div style={{height:"200px"}}>
              <ul>
                {errorModalDetails?.map((item, i)=>{
                  return (
                    <li key={i} style={{color:"red", height:"unset !important", paddingBottom:"5px"}}>
                      {item}
                    </li>
                  );
                })}
              </ul>
              {/* {errorModalDetails} */}
            </div>
          </Grid>
        </Rnd>
      </Box>
    </Modal>
  );
};
export default ErrorModal;
