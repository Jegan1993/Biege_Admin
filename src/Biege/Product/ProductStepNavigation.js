
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const productTabs = [
  { id: "BASICS", label: "Basics", path: "basic" },
  { id: "PRICING", label: "Pricing", path: "pricing" },
  { id: "MEDIA", label: "Media", path: "media" },
  { id: "VARIANTS", label: "Variants", path: "variants" },
  { id: "INGREDIENTS", label: "Ingredients", path: "ingredients" },
  { id: "AI_TAGS", label: "AI Tags", path: "ai-tags" },
];

const standaloneRoutes = [
  "/product-basics",
  "/product-pricing",
  "/product-media",
  "/product-variants",
  "/product-ingredients",
  "/product-ai-tags",
];

function ProductStepNavigation({ position = "top", activeStep }) {
  const navigate = useNavigate();
  const location = useLocation();

  const pathname = location.pathname;
  const pathParts = pathname.split("/").filter(Boolean);

  const isEditWizard =
    pathParts[0] === "edit-product" && pathParts.length >= 3;

  const isAddWizard =
    pathParts[0] === "add-product" && pathParts.length >= 2;

  const productId = isEditWizard ? pathParts[1] : null;

  let detectedIndex = standaloneRoutes.indexOf(pathname);

  if (isEditWizard) {
    detectedIndex = productTabs.findIndex(
      (tab) => tab.path === pathParts[2]
    );
  } else if (isAddWizard) {
    detectedIndex = productTabs.findIndex(
      (tab) => tab.path === pathParts[1]
    );
  }

  const activeIndex = Number.isInteger(activeStep)
    ? activeStep
    : detectedIndex;


  const navigateToStep = (index) => {

    if (index < 0 && pathname === "/product-basics") {
      navigate("/view-product");
      return;
    }

    if (index < 0 || index >= productTabs.length) return;

    const selectedTab = productTabs[index];

    if (isEditWizard) {
      navigate(`/edit-product/${productId}/${selectedTab.path}`);
    } else if (isAddWizard) {
      navigate(`/add-product/${selectedTab.path}`);
    } else {
      navigate(standaloneRoutes[index]);
    }
  };
  // TOP NAVIGATION
  if (position === "top") {
    return (
      <div
        className="d-flex flex-nowrap align-items-center border-bottom"
        style={{
          padding: "0 12px",
          overflowX: "auto",
          whiteSpace: "nowrap",
          width: "100%",
        }}
      >
        {productTabs.map((tab, index) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => navigateToStep(index)}
            style={{
              flex: "1 0 auto",
              border: "none",
              borderBottom:
                activeIndex === index
                  ? "3px solid #7650b5"
                  : "3px solid transparent",
              background: "transparent",
              color:
                activeIndex === index ? "#7650b5" : "#64748b",
              padding: "16px 14px",
              fontSize: "13px",
              fontWeight: activeIndex === index ? 600 : 500,
              cursor: "pointer",
            }}
          >
            {index + 1}. {tab.label}
          </button>
        ))}
      </div>
    );
  }

  // BOTTOM NAVIGATION

  if (position === "bottom") {
    if (activeIndex < 0 || activeIndex >= productTabs.length) {
      return null;
    }

    const previousTab = productTabs[activeIndex - 1];
    const nextTab = productTabs[activeIndex + 1];

    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          minHeight: "60px",
          padding: "12px 16px",
          borderTop: "1px solid #dee2e6",
          boxSizing: "border-box",
        }}
      >
        {/* LEFT SIDE */}
        <span
          style={{
            fontSize: "13px",
            color: "#64748b",
            whiteSpace: "nowrap",
          }}
        >
          Step {activeIndex + 1} of {productTabs.length}
        </span>

        {/* RIGHT SIDE */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginLeft: "auto",
          }}
        >
          <button
            type="button"
            disabled={
              !previousTab && pathname !== "/product-basics"
            }

            onClick={() => navigateToStep(activeIndex - 1)}
            style={{
              padding: "8px 20px",
              border: "1px solid #ced4da",
              borderRadius: "5px",
              backgroundColor: "#ffffff",
              color: "#495057",
              cursor: previousTab ? "pointer" : "not-allowed",
              opacity: previousTab ? 1 : 0.5,
            }}
          >
            <i className="fa-solid fa-arrow-left me-2"></i>
            Previous
          </button>



          <button
            type="button"
            disabled={!nextTab}
            onClick={() => navigateToStep(activeIndex + 1)}
            style={{
              padding: "8px 20px",
              border: "1px solid #7650b5",
              borderRadius: "5px",
              backgroundColor: "#7650b5",
              color: "#ffffff",
              cursor: nextTab ? "pointer" : "not-allowed",
              opacity: nextTab ? 1 : 0.5,
            }}
          >
            Next
            <i className="fa-solid fa-arrow-right ms-2"></i>
          </button>
        </div>
      </div>
    );
  }


  return null;
}

export default ProductStepNavigation;
