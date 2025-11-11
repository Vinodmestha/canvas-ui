import { useEffect } from "react";
import "./App.css";
import Footer from "./components/layout/Footer";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/sidebar/Sidebar";
import Home from "./pages/Home";

function App() {
  const data = {
    cpqDomain: "watertechnologiesdev",
    currency: "USD",
    frequency: "60Hz",
    products:
      '{"configuredProducts":[{"id":"BOM_CartridgeFilterConfigurator_Model","documentNumber":"22","conditionIndex":0,"configAttributes":{"overrideFrequency_family":false,"region_allFamilies":{"value":"NAM"},"productFamily_allFamilies":"proGen","canvasQty_allFamilies":1,"productLine_allFamilies":"filtration","transactionId_allFamilies":"78921978","optional":false,"cDSProductIndex_allFamilies":"1","triggerUpdate_family":0,"baseModelMap_allFamilies":"HX0730-3.0F-316-A Non Code Stamped","cDSConfigId_allFamilies":"78921978","cDSURL_allFamilies":"https://qa.product-config.net/cfg/suez/","frequency_family":{"value":"60Hz"},"cartridgeFilter_model":{"value":"HX0730-3.0F-316-A Non Code Stamped"},"nONASMEBase_line":false,"currency_allFamilies":{"value":"USD"},"isCatalogItemAdded":false,"salesOrg_allFamilies":{"value":"B701"},"errorTest":false,"productModel_allFamilies":"cartridgeFilter"},"children":[{"id":"BOM_WPCTFB00001_CartridgeFilterConfigurator","documentNumber":-1,"conditionIndex":0,"actualSequenceNumber":2}],"configuredViaCanvas":true,"frequency":"60Hz","region":"NAM","remoteSkid_model":{"value":""},"plant":""},{"id":"BOM_DistributionPumpConfigurator_Model","documentNumber":"24","conditionIndex":0,"configAttributes":{"overrideFrequency_family":false,"region_allFamilies":{"value":"NAM"},"productFamily_allFamilies":"proGen","canvasQty_allFamilies":1,"productLine_allFamilies":"ancillary","transactionId_allFamilies":"78921978","optional":false,"cDSProductIndex_allFamilies":"1","triggerUpdate_family":0,"baseModelMap_allFamilies":"Flowserve (50 gpm @ 65psi)","cDSConfigId_allFamilies":"78921978","cDSURL_allFamilies":"https://qa.product-config.net/cfg/suez/","frequency_family":{"value":"60Hz"},"distributionPump_model":{"value":"Flowserve (50 gpm @ 65psi)"},"currency_allFamilies":{"value":"USD"},"isCatalogItemAdded":false,"salesOrg_allFamilies":{"value":"B701"},"errorTest":false,"productModel_allFamilies":"distributionPump"},"children":[{"id":"BOM_WPDSPB000001_DistributionPumpConfigurator","documentNumber":-1,"conditionIndex":0,"actualSequenceNumber":2}],"configuredViaCanvas":true,"frequency":"60Hz","region":"NAM","remoteSkid_model":{"value":""},"plant":""},{"id":"BOM_CartridgeFilterConfigurator_Model","documentNumber":"26","conditionIndex":0,"configAttributes":{"overrideFrequency_family":false,"region_allFamilies":{"value":"NAM"},"productFamily_allFamilies":"proGen","canvasQty_allFamilies":1,"productLine_allFamilies":"filtration","transactionId_allFamilies":"78921978","optional":false,"cDSProductIndex_allFamilies":"1","triggerUpdate_family":0,"baseModelMap_allFamilies":"S6GL12-012-3-3F-IP Code Stamped","cDSConfigId_allFamilies":"78921978","cDSURL_allFamilies":"https://qa.product-config.net/cfg/suez/","frequency_family":{"value":"60Hz"},"cartridgeFilter_model":{"value":"S6GL12-012-3-3F-IP Code Stamped"},"nONASMEBase_line":false,"currency_allFamilies":{"value":"USD"},"isCatalogItemAdded":false,"salesOrg_allFamilies":{"value":"B701"},"errorTest":false,"productModel_allFamilies":"cartridgeFilter"},"children":[{"id":"BOM_WPCTFB00004_CartridgeFilterConfigurator","documentNumber":-1,"conditionIndex":0,"actualSequenceNumber":2}],"configuredViaCanvas":true,"frequency":"60Hz","region":"NAM","remoteSkid_model":{"value":""},"plant":""},{"id":"BOM_CartridgeFilterConfigurator_Model","documentNumber":"28","conditionIndex":0,"configAttributes":{"overrideFrequency_family":false,"region_allFamilies":{"value":"NAM"},"productFamily_allFamilies":"proGen","canvasQty_allFamilies":1,"productLine_allFamilies":"filtration","transactionId_allFamilies":"78921978","optional":false,"cDSProductIndex_allFamilies":"1","triggerUpdate_family":0,"baseModelMap_allFamilies":"HX0730-3.0F-316-A Non Code Stamped","cDSConfigId_allFamilies":"78921978","cDSURL_allFamilies":"https://qa.product-config.net/cfg/suez/","frequency_family":{"value":"60Hz"},"cartridgeFilter_model":{"value":"HX0730-3.0F-316-A Non Code Stamped"},"nONASMEBase_line":false,"currency_allFamilies":{"value":"USD"},"isCatalogItemAdded":false,"salesOrg_allFamilies":{"value":"B701"},"errorTest":false,"productModel_allFamilies":"cartridgeFilter"},"children":[{"id":"BOM_WPCTFB00001_CartridgeFilterConfigurator","documentNumber":-1,"conditionIndex":0,"actualSequenceNumber":2}],"configuredViaCanvas":true,"frequency":"60Hz","region":"NAM","remoteSkid_model":{"value":""},"plant":""}]}',
    proposalType: "packagedSystemFirmProposal",
    region: "NAM",
    salesOrg: "B701",
    source: "transaction",
    transactionId: "78921978",
    uom: "Imperial",
  };
  useEffect(()=>{
    localStorage.setItem("cpq-data-key", JSON.stringify(data))
  },[])
  return (
    <div>
      <Header />
      <div className="container">
        <div className="sidebar-wrapper">
          <Sidebar    clroAccess={false}
              cpqData={JSON.parse(localStorage.getItem("cpq-data-key"))}/>
        </div>
        <div className="main-wrapper">
          <Home />
        </div>
      </div>
      {/* <Footer /> */}
    </div>
  );
}

export default App;
