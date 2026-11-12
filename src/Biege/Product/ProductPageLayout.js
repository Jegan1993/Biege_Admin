
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

        {/* TOP: Step Navigation */}
        <ProductStepNavigation
          position="top"
          activeStep={activeStep}
        />

        {/* MIDDLE: Page Content */}
        <div className="p-3 p-md-4">
          {children}
        </div>

        {/* BOTTOM: Step Count + Previous / Next */}
        <ProductStepNavigation
          position="bottom"
          activeStep={activeStep}
        />

      </div>

    </div>
  );
}

export default ProductPageLayout;
