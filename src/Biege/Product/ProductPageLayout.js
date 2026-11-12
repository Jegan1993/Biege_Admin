
import React from "react";
import ProductStepNavigation from "./ProductStepNavigation";

function ProductPageLayout({ children, activeStep }) {
  return (
    <div className="container-fluid py-3">

      <div
        className="card border shadow-sm"
        style={{
          borderRadius: "10px",
          overflow: "hidden",
          borderColor: "#e5e7eb",
        }}
      >

        {/* TOP: Basics, Pricing, Media, Variants, Ingredients, AI Tags */}
        <ProductStepNavigation
          position="top"
          activeStep={activeStep}
        />

        {/* MIDDLE: Actual component */}
        <div className="p-3 p-md-4">
          {children}
        </div>

        {/* BOTTOM: Previous / Next */}
        <ProductStepNavigation
          position="bottom"
          activeStep={activeStep}
        />

      </div>

    </div>
  );
}

export default ProductPageLayout;
