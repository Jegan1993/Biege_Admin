
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

// Routes used when navigating from Product Details modules
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

  // Detect active step
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

  // -1 means no active step, such as the ViewProduct landing page
  const activeIndex = Number.isInteger(activeStep)
    ? activeStep
    : detectedIndex;

  // Navigate to selected module
  const navigateToStep = (index) => {
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

  // =================================
  // TOP: SIX TABS ONLY
  // =================================
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

  // ViewProduct is a landing page, not a wizard step.
  // Therefore do not show Previous/Next there.
  if (activeIndex < 0) {
    return null;
  }

  // =================================
  // BOTTOM: PREVIOUS / NEXT
  // =================================
  const previousTab = productTabs[activeIndex - 1];
  const nextTab = productTabs[activeIndex + 1];

  return (
    <div
      className="d-flex justify-content-between align-items-center border-top flex-wrap gap-3"
      style={{
        padding: "16px 20px",
        width: "100%",
      }}
    >
      <span className="text-muted small">
        Step {activeIndex + 1} of {productTabs.length}
      </span>

      <div className="d-flex gap-2 ms-auto">
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm px-4"
          disabled={!previousTab}
          onClick={() => navigateToStep(activeIndex - 1)}
        >
          <i className="fa-solid fa-arrow-left me-2"></i>
          {previousTab?.label || "Previous"}
        </button>

        <button
          type="button"
          className="btn btn-sm px-4 text-white"
          style={{
            backgroundColor: "#7650b5",
            borderColor: "#7650b5",
          }}
          disabled={!nextTab}
          onClick={() => navigateToStep(activeIndex + 1)}
        >
          {nextTab?.label || "Next"}
          <i className="fa-solid fa-arrow-right ms-2"></i>
        </button>
      </div>
    </div>
  );
}

export default ProductStepNavigation;
