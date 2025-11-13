import { useEffect, useState, useRef,useCallback } from "react";
import "./App.css";
import Footer from "./components/layout/Footer";
import Header from "./components/layout/Header";
import {
  staticProducts,
  transformToUnitopConfig,
} from "./utils/staticProducts";
import Flow from "./pages/Home";

function App() {
  
  const [products, setProducts] = useState(staticProducts);
  const [unitopConfig, setUnitopConfig] = useState(
    transformToUnitopConfig(staticProducts)
  );
  const [loading, setLoading] = useState(false);
  
  // Single API call on mount
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        // TODO: Replace with your actual API endpoint
        // const response = await fetch('/api/products');
        // const data = await response.json();
        // Update both products and config
        // setProducts(data);
        // setUnitopConfig(transformToUnitopConfig(data));
      } catch (error) {
        console.error("Error loading products:", error);
        // Fallback to static data
        setProducts(staticProducts);
        setUnitopConfig(transformToUnitopConfig(staticProducts));
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  if (loading) {
    return <div>Loading products...</div>;
  }

  return (
    <div style={{width:"max-content"}}>
      <Header />
      <div className="container">
        <Flow UNITOP_CONFIG={unitopConfig}/>
      </div>
      {/* <Footer /> */}
    </div>
  );
}

export default App;
