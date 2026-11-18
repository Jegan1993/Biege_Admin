
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { makeApiRequest } from "../../../AxiosServices/apiCall.js";

import AiTagsForm from "./AiTagsForm.js";
import AIRecommendations from "./AIRecommendations.js";
import LookAIRecommendations from "./LookAIRecommendations.js";

import {
  normalizeEnum,
  getArrayValue,
  getEmptyAiTagForm,
} from "./aiTagHelpers.js";

const EditProductAiTags = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [form, setForm] = useState(getEmptyAiTagForm());

  const [aiMode, setAiMode] = useState("SKIN_CARE");
  const [activeAI, setActiveAI] = useState("");

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [showForm, setShowForm] = useState(true);

  const [showRecommendations, setShowRecommendations] =
    useState(false);

  // LOAD PRODUCT AND EXISTING AI TAGS
  useEffect(() => {
    if (id) {
      fetchEditData();
    }
  }, [id]);

  // FETCH EDIT DATA
  const fetchEditData = async () => {
    try {
      setPageLoading(true);
      setShowRecommendations(false);
      setActiveAI("");

      // FETCH PARTICULAR PRODUCT
      const productResponse = await makeApiRequest({
        url: `getproduct/${id}`,
        method: "GET",
      });

      if (!productResponse?.status || !productResponse.data) {
        toast.error(
          productResponse?.message || "Product not found"
        );
        setProduct(null);
        return;
      }

      const productData = productResponse.data;

      setProduct(productData);

      const productType = productData.type;

      setAiMode(productType);

      // FETCH ALL AI TAGS
      const tagResponse = await makeApiRequest({
        url: "getproduct-ai-tags",
        method: "GET",
      });

      if (!tagResponse?.status) {
        toast.error(
          tagResponse?.message || "Unable to fetch AI tags"
        );
        return;
      }

      const tags = Array.isArray(tagResponse.data)
        ? tagResponse.data
        : tagResponse.data?.data || [];

      // FIND AI TAGS FOR THIS PRODUCT ONLY
      const existingTag = tags.find((tag) => {
        const tagProductId =
          tag.product?._id ||
          tag.product ||
          tag.productId?._id ||
          tag.productId;

        return String(tagProductId) === String(id);
      });

      // NO EXISTING TAGS - CREATE MODE
      if (!existingTag) {
        setForm({
          ...getEmptyAiTagForm(),
          productId: id,
          productType,
        });

        setEditing(false);
        setShowForm(true);
        return;
      }

      // EXISTING AI TAGS - EDIT MODE
      setForm({
        ...getEmptyAiTagForm(),

        productId: id,
        productType,

        skinTypes: getArrayValue(
          existingTag.skinTypes
        ).map((item) => String(item).toLowerCase()),

        concerns: getArrayValue(
          existingTag.concerns
        ).map((item) => ({
          name: normalizeEnum(item.name),
          strength: Number(item.strength) || 2,
        })),

        routineStep: String(
          existingTag.routineStep || ""
        ).toLowerCase(),

        timeOfUse: normalizeEnum(
          existingTag.timeOfUse || "BOTH"
        ),

        contraindications: getArrayValue(
          existingTag.contraindications
        ).map((item) => String(item).toLowerCase()),

        beauty: {
          productRole: String(
            existingTag.beauty?.productRole || ""
          ).toLowerCase(),

          finish: String(
            existingTag.beauty?.finish || ""
          ).toLowerCase(),

          coverage: String(
            existingTag.beauty?.coverage || ""
          ).toLowerCase(),

          suitableLooks: getArrayValue(
            existingTag.beauty?.suitableLooks
          ).map((item) => String(item).toLowerCase()),
        },

        priceBand: String(
          existingTag.priceBand || ""
        ).toLowerCase(),

        includeInAIRecommendations:
          existingTag.includeInAIRecommendations !== false,
      });

      setEditing(true);
      setShowForm(true);
    } catch (error) {
      console.error("Fetch edit AI tags error:", error);

      toast.error(
        error?.response?.data?.message ||
        "Unable to load AI tags"
      );
    } finally {
      setPageLoading(false);
    }
  };

  // UPDATE NORMAL FIELD
  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // UPDATE BEAUTY FIELD
  const updateBeautyField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      beauty: {
        ...previous.beauty,
        [field]: value,
      },
    }));
  };

  // HANDLE MULTI SELECT
  const handleMultiSelect = (field, value, checked) => {
    setForm((previous) => {
      const currentValues = getArrayValue(previous[field]);

      return {
        ...previous,
        [field]: checked
          ? currentValues.includes(value)
            ? currentValues
            : [...currentValues, value]
          : currentValues.filter((item) => item !== value),
      };
    });
  };

  // HANDLE BEAUTY MULTI SELECT
  const handleBeautyMultiSelect = (
    field,
    value,
    checked
  ) => {
    setForm((previous) => {
      const currentValues = getArrayValue(
        previous.beauty?.[field]
      );

      return {
        ...previous,
        beauty: {
          ...previous.beauty,
          [field]: checked
            ? currentValues.includes(value)
              ? currentValues
              : [...currentValues, value]
            : currentValues.filter((item) => item !== value),
        },
      };
    });
  };

  // HANDLE CONCERN STRENGTH
  const handleConcernChange = (concernName, strength) => {
    setForm((previous) => {
      const currentConcerns = [...previous.concerns];

      const existingIndex = currentConcerns.findIndex(
        (item) => item.name === concernName
      );

      if (existingIndex >= 0) {
        currentConcerns[existingIndex] = {
          ...currentConcerns[existingIndex],
          strength,
        };
      } else {
        currentConcerns.push({
          name: concernName,
          strength,
        });
      }

      return {
        ...previous,
        concerns: currentConcerns,
      };
    });
  };

  // HANDLE CONCERN CHECKBOX
  const handleConcernCheckbox = (
    concernName,
    checked
  ) => {
    setForm((previous) => {
      const currentConcerns = [...previous.concerns];

      return {
        ...previous,
        concerns: checked
          ? [
            ...currentConcerns.filter(
              (item) => item.name !== concernName
            ),
            {
              name: concernName,
              strength: 2,
            },
          ]
          : currentConcerns.filter(
            (item) => item.name !== concernName
          ),
      };
    });
  };

  // BUILD PAYLOAD
  const buildPayload = () => {
    return {
      productId: id,

      productType: normalizeEnum(product?.type),

      skinTypes: getArrayValue(
        form.skinTypes
      ).map(normalizeEnum),

      concerns: getArrayValue(
        form.concerns
      ).map((item) => ({
        name: normalizeEnum(item.name),
        strength: Number(item.strength),
      })),

      routineStep: form.routineStep
        ? normalizeEnum(form.routineStep)
        : "",

      timeOfUse: normalizeEnum(form.timeOfUse),

      contraindications: getArrayValue(
        form.contraindications
      ).map(normalizeEnum),

      beauty: {
        productRole: form.beauty.productRole
          ? normalizeEnum(form.beauty.productRole)
          : "",

        finish: form.beauty.finish
          ? normalizeEnum(form.beauty.finish)
          : "",

        coverage: form.beauty.coverage
          ? normalizeEnum(form.beauty.coverage)
          : "",

        suitableLooks: getArrayValue(
          form.beauty.suitableLooks
        ).map(normalizeEnum),
      },

      priceBand: form.priceBand
        ? normalizeEnum(form.priceBand)
        : "",

      includeInAIRecommendations:
        form.includeInAIRecommendations,
    };
  };

  // CREATE OR UPDATE AI TAGS
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!id || !product) {
      toast.error("Product not found");
      return;
    }

    if (
      aiMode === "SKIN_CARE" &&
      form.skinTypes.length === 0
    ) {
      toast.error("Please select at least one skin type");
      return;
    }

    if (
      aiMode === "BEAUTY" &&
      !form.beauty.productRole
    ) {
      toast.error("Please select product role");
      return;
    }

    try {
      setLoading(true);

      const payload = buildPayload();

      const response = await makeApiRequest({
        url: editing
          ? `updateproduct-ai-tags/${id}`
          : "createproduct-ai-tags",
        method: editing ? "PUT" : "POST",
        data: payload,
      });

      if (response?.status) {
        toast.success(
          response.message ||
          (editing
            ? "AI tags updated successfully"
            : "AI tags created successfully")
        );

        await fetchEditData();
      } else {
        toast.error(
          response?.message || "Unable to save AI tags"
        );
      }
    } catch (error) {
      console.error("Save AI tags error:", error);

      toast.error(
        error?.response?.data?.message ||
        "Unable to save AI tags"
      );
    } finally {
      setLoading(false);
    }
  };

  // SELECT SKIN AI
  const handleSkinAI = () => {
    setActiveAI("SKIN_CARE");
    setShowRecommendations(true);
  };

  // SELECT LOOK AI
  const handleLookAI = () => {
    setActiveAI("BEAUTY");
    setShowRecommendations(true);
  };

  // CANCEL
  const handleCancel = () => {
    navigate(`/edit-product/${id}/ingredients`);
  };

  // LOADING
  if (pageLoading) {
    return (
      <div className="container-fluid text-center py-5">
        <div
          className="spinner-border text-primary"
          role="status"
        >
          <span className="visually-hidden">
            Loading...
          </span>
        </div>

        <p className="mt-2">
          Loading product AI tags...
        </p>
      </div>
    );
  }

  // PRODUCT NOT FOUND
  if (!product) {
    return (
      <div className="container-fluid">
        <div className="alert alert-danger">
          Product not found.
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate("/view-product")}
        >
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="container-fluid">

      {/* PAGE HEADING */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">
          Edit Product AI Tags
        </h4>
      </div>

      {/* PRODUCT DETAILS */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">

            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Product Name
              </label>

              <input
                type="text"
                className="form-control"
                value={product.name || ""}
                disabled
              />
            </div>

            <div className="col-md-3">
              <label className="form-label fw-semibold">
                SKU
              </label>

              <input
                type="text"
                className="form-control"
                value={product.sku || ""}
                disabled
              />
            </div>

            <div className="col-md-3">
              <label className="form-label fw-semibold">
                Product Type
              </label>

              <input
                type="text"
                className="form-control"
                value={product.type || ""}
                disabled
              />
            </div>

          </div>
        </div>
      </div>

      {/* COMMON AI TAG FORM */}
      <AiTagsForm
        showForm={showForm}
        isWizard={false}
        editing={editing}
        aiMode={aiMode}
        form={form}
        loading={loading}
        filteredProducts={product ? [product] : []}
        handleSubmit={handleSubmit}
        updateField={updateField}
        updateBeautyField={updateBeautyField}
        handleMultiSelect={handleMultiSelect}
        handleBeautyMultiSelect={handleBeautyMultiSelect}
        handleConcernChange={handleConcernChange}
        handleConcernCheckbox={handleConcernCheckbox}
        handleCancel={handleCancel}
      />

      {/* SKIN AI AND LOOK AI BUTTONS */}


      {/* AI RECOMMENDATION BUTTON - PRODUCT TYPE BASED */}
      <div className="card mb-4">
        <div className="card-body d-flex justify-content-between align-items-center">

          <div>
            <h5 className="mb-1">
              {product.type === "SKIN_CARE"
                ? "Skin AI Recommendations"
                : "Look AI Recommendations"}
            </h5>

            <p className="text-muted mb-0">
              Get AI recommendations for {product.name}.
            </p>
          </div>

          {product.type === "SKIN_CARE" && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setActiveAI("SKIN_CARE");
                setShowRecommendations(true);
              }}
            >
              Skin AI
            </button>
          )}

          {product.type === "BEAUTY" && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setActiveAI("BEAUTY");
                setShowRecommendations(true);
              }}
            >
              Look AI
            </button>
          )}

        </div>
      </div>

      {/* AI RECOMMENDATIONS */}
      {showRecommendations && (
        <div className="card mb-4">

          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              {activeAI === "SKIN_CARE"
                ? "Skin AI Recommendations"
                : "Look AI Recommendations"}
              {" - "}
              {product.name}
            </h5>

            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={() => {
                setShowRecommendations(false);
                setActiveAI("");
              }}
            >
              Hide AI
            </button>
          </div>

          <div className="card-body">

            {activeAI === "SKIN_CARE" && (
              <AIRecommendations
                productId={product._id}
              />
            )}

            {activeAI === "BEAUTY" && (
              <LookAIRecommendations
                productId={product._id}
              />
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default EditProductAiTags;
