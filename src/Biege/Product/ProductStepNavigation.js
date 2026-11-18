
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const productTabs = [
  { id: "CREATE", label: "Create Product", path: "product" },
  { id: "BASICS", label: "Basics", path: "basic" },
  { id: "PRICING", label: "Pricing", path: "pricing" },
  { id: "MEDIA", label: "Media", path: "media" },
  { id: "VARIANTS", label: "Variants", path: "variants" },
  { id: "INGREDIENTS", label: "Ingredients", path: "ingredients" },
  { id: "AI_TAGS", label: "AI Tags", path: "ai-tags" },
];

const standaloneRoutes = [
  "/create-product",
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

  const isEditWizard = pathParts[0] === "edit-product";
  const isAddWizard =
    pathParts[0] === "add-product" ||
    pathname === "/create-product";

  const productId =
    isEditWizard || (isAddWizard && pathParts.length >= 3)
      ? pathParts[1]
      : null;

  let detectedIndex = standaloneRoutes.indexOf(pathname);

  if (isEditWizard) {
    detectedIndex = productTabs.findIndex(
      (tab) => tab.path === pathParts[2]
    );
  } else if (pathname === "/create-product") {
    detectedIndex = 0;
  } else if (pathParts[0] === "add-product") {
    detectedIndex = productTabs.findIndex(
      (tab) => tab.path === pathParts[2]
    );
  }

  const activeIndex = Number.isInteger(activeStep)
    ? activeStep
    : detectedIndex;

  const navigateToStep = (index) => {
    if (index < 0 || index >= productTabs.length) return;

    const selectedTab = productTabs[index];

    if (isEditWizard) {
      navigate(`/edit-product/${productId}/${selectedTab.path}`);
      return;
    }

    if (isAddWizard) {
      if (index === 0) {
        navigate("/create-product");
        return;
      }

      if (!productId) return;

      navigate(`/add-product/${productId}/${selectedTab.path}`);
      return;
    }

    navigate(standaloneRoutes[index]);
  };

  const isStepDisabled = (index) =>
    isAddWizard && !productId && index > 0;

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
            disabled={isStepDisabled(index)}
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
              cursor: isStepDisabled(index) ? "not-allowed" : "pointer",
              opacity: isStepDisabled(index) ? 0.5 : 1,
            }}
          >
            {index + 1}. {tab.label}
          </button>
        ))}
      </div>
    );
  }

  if (position === "bottom") {
    const previousTab =
      activeIndex > 0 ? productTabs[activeIndex - 1] : null;

    const nextTab =
      activeIndex >= 0 && activeIndex < productTabs.length - 1
        ? productTabs[activeIndex + 1]
        : null;

    const nextDisabled =
      !nextTab || (isAddWizard && !productId);

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
        <span style={{ fontSize: "13px", color: "#64748b" }}>
          Step {activeIndex + 1} of {productTabs.length}
        </span>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            disabled={!previousTab}
            onClick={() => navigateToStep(activeIndex - 1)}
            className="btn btn-outline-secondary"
          >
            <i className="fa-solid fa-arrow-left me-2"></i>
            Previous
          </button>

          <button
            type="button"
            disabled={nextDisabled}
            onClick={() => navigateToStep(activeIndex + 1)}
            className="btn btn-primary"
            style={{
              backgroundColor: "#7650b5",
              borderColor: "#7650b5",
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
