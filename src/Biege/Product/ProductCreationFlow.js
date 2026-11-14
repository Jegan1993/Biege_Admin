
import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

import ProductStepNavigation from "./ProductStepNavigation";

import CreateProduct from "./CreateProduct";
import AddEditBasic from "./AddEditBasic";
import ProductPricing from "./ProductPricing";
import CreateProductmedia from "./CreateProductmedia";
import CreateProductVariant from "./CreateProductVariant";
import CreateProductIngredients from "./CreateProductIngredients";
import ProductAiTags from "./ProductAiTags";

const steps = [
  "Create Product",
  "Basics",
  "Pricing",
  "Media",
  "Variants",
  "Ingredients",
  "AI Tags",
];

function ProductCreationFlow() {
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(0);
  const [productId, setProductId] = useState("");
  const [productType, setProductType] = useState("");
  const [saveCurrentStep, setSaveCurrentStep] = useState(null);
  const [saving, setSaving] = useState(false);

  // Register the active step's save function.
  const registerSave = useCallback((saveFunction) => {
    setSaveCurrentStep(() => saveFunction);
  }, []);

  // Save the current step and move to the next step.
  const handleNext = async () => {
    if (!saveCurrentStep || saving) {
      return;
    }

    try {
      setSaving(true);

      const result = await saveCurrentStep();

      if (!result) {
        return;
      }

      // First step returns the newly created product.
      if (activeStep === 0) {
        const newProductId = result.productId || result.product?._id;

        if (!newProductId) {
          return;
        }

        setProductId(newProductId);
        setProductType(result.product?.type || "");
      }

      // Last step completed.
      if (activeStep === steps.length - 1) {
        navigate("/view-product", { replace: true });
        return;
      }

      setActiveStep((previous) => previous + 1);
      setSaveCurrentStep(null);
    } catch (error) {
      console.error("Product step save error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handlePrevious = () => {
    if (activeStep > 0 && !saving) {
      setActiveStep((previous) => previous - 1);
      setSaveCurrentStep(null);
    }
  };

  const handleStepChange = (stepIndex) => {
    if (
      stepIndex <= activeStep &&
      stepIndex >= 0 &&
      !saving
    ) {
      setActiveStep(stepIndex);
      setSaveCurrentStep(null);
    }
  };

  const renderCurrentStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <CreateProduct
            onRegisterSave={registerSave}
          />
        );

      case 1:
        return (
          <AddEditBasic
            productId={productId}
            onRegisterSave={registerSave}
          />
        );

      case 2:
        return (
          <ProductPricing
            productId={productId}
            onRegisterSave={registerSave}
          />
        );

      case 3:
        return (
          <CreateProductmedia
            productId={productId}
            onRegisterSave={registerSave}
          />
        );

      case 4:
        return (
          <CreateProductVariant
            productId={productId}
            onRegisterSave={registerSave}
          />
        );

      case 5:
        return (
          <CreateProductIngredients
            productId={productId}
            onRegisterSave={registerSave}
          />
        );

      case 6:
        return (
          <ProductAiTags
            productId={productId}
            productType={productType}
            onRegisterSave={registerSave}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="container-fluid py-3">
      <ProductStepNavigation
        position="top"
        activeStep={activeStep}
        productId={productId}
        maxAccessibleStep={activeStep}
        onStepChange={handleStepChange}
        isSaving={saving}
      />

      <div className="card shadow-sm mt-3">
        <div className="card-body p-4">
          <h4 className="mb-4">{steps[activeStep]}</h4>

          {renderCurrentStep()}
        </div>
      </div>

      <ProductStepNavigation
        position="bottom"
        activeStep={activeStep}
        productId={productId}
        maxAccessibleStep={activeStep}
        onStepChange={handleStepChange}
        onPrevious={handlePrevious}
        onNext={handleNext}
        canGoNext={Boolean(saveCurrentStep)}
        isSaving={saving}
        isLastStep={activeStep === steps.length - 1}
      />
    </div>
  );
}

export default ProductCreationFlow;
