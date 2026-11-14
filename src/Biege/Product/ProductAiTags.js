
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { makeApiRequest } from "../../AxiosServices/apiCall";

import AIRecommendations from "./AIRecommendations";

import {
  skinTypeOptions,
  concernOptions,
  contraindicationOptions,
  routineStepOptions,
  timeOfUseOptions,
  beautyRoleOptions,
  finishOptions,
  coverageOptions,
  suitableLookOptions,
  priceBandOptions,
  formatLabel,
  normalizeEnum,
  getArrayValue,
  getEmptyAiTagForm,
} from "./aiTagHelpers.js";

const ProductAiTags = () => {
  const navigate = useNavigate();
  const { productId: wizardProductId } = useParams();

  const isWizard = Boolean(wizardProductId);

  const [aiMode, setAiMode] = useState("SKIN_CARE");

  const [products, setProducts] = useState([]);
  const [aiTags, setAiTags] = useState([]);

  const [form, setForm] = useState(getEmptyAiTagForm());
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [selectedTag, setSelectedTag] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);

  // AI Recommendation States
  const [recommendationProductId, setRecommendationProductId] =
    useState("");
  const [showRecommendations, setShowRecommendations] = useState(false);

  // INITIAL LOAD
  useEffect(() => {
    fetchProducts();
    fetchAiTags();

    if (isWizard) {
      setForm({
        ...getEmptyAiTagForm(),
        productId: wizardProductId,
      });

      setShowForm(true);
    }
  }, [wizardProductId]);

  // FETCH PRODUCTS
  const fetchProducts = async () => {
    try {
      const response = await makeApiRequest({
        url: "getproduct",
        method: "GET",
      });

      if (response?.status) {
        const productList = response.data || [];

        setProducts(productList);

        if (isWizard) {
          const selectedProduct = productList.find(
            (product) => product._id === wizardProductId
          );

          if (!selectedProduct) {
            toast.error("Product not found");
            return;
          }

          setAiMode(selectedProduct.type);

          setForm((previous) => ({
            ...previous,
            productId: wizardProductId,
            productType: selectedProduct.type,
          }));
        }
      }
    } catch (error) {
      console.error("Fetch products error:", error);
      toast.error("Unable to fetch products");
    }
  };

  // FETCH AI TAGS
  const fetchAiTags = async () => {
    try {
      const response = await makeApiRequest({
        url: "getproduct-ai-tags",
        method: "GET",
      });

      if (response?.status) {
        setAiTags(response.data || []);
      }
    } catch (error) {
      console.error("Fetch AI tags error:", error);
      toast.error("Unable to fetch AI tags");
    }
  };

  // FILTER PRODUCTS BASED ON SKIN AI / LOOK AI
  const filteredProducts = useMemo(() => {
    return products.filter(
      (product) => product.type === aiMode
    );
  }, [products, aiMode]);

  // FILTER AI TAGS BASED ON SKIN AI / LOOK AI
  const filteredTags = useMemo(() => {
    return aiTags.filter(
      (tag) => tag.product?.type === aiMode
    );
  }, [aiTags, aiMode]);

  // RESET FORM
  const resetForm = () => {
    setForm({
      ...getEmptyAiTagForm(),
      productType: aiMode,
      productId: isWizard ? wizardProductId : "",
    });

    setEditing(false);
    setShowForm(false);
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
          ? [...currentValues, value]
          : currentValues.filter((item) => item !== value),
      };
    });
  };

  // HANDLE BEAUTY MULTI SELECT
  const handleBeautyMultiSelect = (field, value, checked) => {
    setForm((previous) => {
      const currentValues = getArrayValue(
        previous.beauty?.[field]
      );

      return {
        ...previous,
        beauty: {
          ...previous.beauty,
          [field]: checked
            ? [...currentValues, value]
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
  const handleConcernCheckbox = (concernName, checked) => {
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

  // ADD AI TAGS
  const handleAdd = () => {
    setForm({
      ...getEmptyAiTagForm(),
      productType: aiMode,
      productId: isWizard ? wizardProductId : "",
    });

    setEditing(false);
    setShowForm(true);
  };

  // EDIT AI TAGS
  const handleEdit = (tag) => {
    setForm({
      ...getEmptyAiTagForm(),

      productId: tag.product?._id || "",

      productType: tag.product?.type || aiMode,

      skinTypes: getArrayValue(tag.skinTypes).map((item) =>
        String(item).toLowerCase()
      ),

      concerns: getArrayValue(tag.concerns).map((item) => ({
        name: normalizeEnum(item.name),
        strength: Number(item.strength) || 2,
      })),

      routineStep: String(tag.routineStep || "").toLowerCase(),

      timeOfUse: normalizeEnum(tag.timeOfUse || "BOTH"),

      contraindications: getArrayValue(
        tag.contraindications
      ).map((item) => String(item).toLowerCase()),

      beauty: {
        productRole: String(
          tag.beauty?.productRole || ""
        ).toLowerCase(),

        finish: String(
          tag.beauty?.finish || ""
        ).toLowerCase(),

        coverage: String(
          tag.beauty?.coverage || ""
        ).toLowerCase(),

        suitableLooks: getArrayValue(
          tag.beauty?.suitableLooks
        ).map((item) => String(item).toLowerCase()),
      },

      priceBand: String(tag.priceBand || "").toLowerCase(),

      includeInAIRecommendations:
        tag.includeInAIRecommendations !== false,
    });

    setEditing(true);
    setShowForm(true);
  };

  // BUILD PAYLOAD
  const buildPayload = () => {
    return {
      productId: form.productId,
      productType: normalizeEnum(form.productType),

      skinTypes: form.skinTypes.map(normalizeEnum),

      concerns: form.concerns.map((item) => ({
        name: normalizeEnum(item.name),
        strength: Number(item.strength),
      })),

      routineStep: form.routineStep
        ? normalizeEnum(form.routineStep)
        : "",

      timeOfUse: normalizeEnum(form.timeOfUse),

      contraindications: form.contraindications.map(
        normalizeEnum
      ),

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

        suitableLooks: form.beauty.suitableLooks.map(
          normalizeEnum
        ),
      },

      priceBand: form.priceBand
        ? normalizeEnum(form.priceBand)
        : "",

      includeInAIRecommendations:
        form.includeInAIRecommendations,
    };
  };

  // CREATE / UPDATE AI TAGS
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.productId) {
      toast.error("Please select a product");
      return;
    }

    if (aiMode === "SKIN_CARE" && form.skinTypes.length === 0) {
      toast.error("Please select at least one skin type");
      return;
    }

    if (aiMode === "BEAUTY" && !form.beauty.productRole) {
      toast.error("Please select product role");
      return;
    }

    try {
      setLoading(true);

      const payload = buildPayload();

      // Check whether AI tags already exist for this product
      const existingTag = aiTags.find(
        (tag) => tag.product?._id === form.productId
      );

      const shouldUpdate = editing || Boolean(existingTag);

      const response = await makeApiRequest({
        url: shouldUpdate
          ? `updateproduct-ai-tags/${form.productId}`
          : "createproduct-ai-tags",
        method: shouldUpdate ? "PUT" : "POST",
        data: payload,
      });

      if (response?.status) {
        toast.success(
          response.message ||
          (shouldUpdate
            ? "AI tags updated successfully"
            : "AI tags created successfully")
        );

        if (isWizard) {
          navigate("/view-product");
          return;
        }

        resetForm();
        fetchAiTags();
      } else {
        toast.error(response?.message || "Something went wrong");
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

  // DELETE AI TAGS
  const handleDelete = async (productId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this AI tag?"
      )
    ) {
      return;
    }

    try {
      const response = await makeApiRequest({
        url: `deleteproduct-ai-tags/${productId}`,
        method: "DELETE",
      });

      if (response?.status) {
        toast.success(
          response.message || "AI tags deleted successfully"
        );

        fetchAiTags();
      } else {
        toast.error(
          response?.message || "Unable to delete AI tags"
        );
      }
    } catch (error) {
      console.error("Delete AI tags error:", error);

      toast.error(
        error?.response?.data?.message ||
        "Unable to delete AI tags"
      );
    }
  };

  // VIEW AI TAGS
  const handleView = (tag) => {
    setSelectedTag(tag);
    setShowView(true);
  };

  // GET PRODUCT NAME
  const getProductName = (tag) => {
    return tag.product?.name || "Product";
  };

  // RENDER CHECKBOX OPTIONS
  const renderCheckboxOptions = (
    options,
    selectedValues,
    onChange
  ) => {
    return (
      <div className="d-flex flex-wrap gap-3">
        {options.map((option) => (
          <div className="form-check" key={option}>
            <input
              className="form-check-input"
              type="checkbox"
              id={`${option}-${onChange.name}`}
              checked={selectedValues.includes(option)}
              onChange={(event) =>
                onChange(option, event.target.checked)
              }
            />

            <label
              className="form-check-label"
              htmlFor={`${option}-${onChange.name}`}
            >
              {formatLabel(option)}
            </label>
          </div>
        ))}
      </div>
    );
  };

  // AI RECOMMENDATION HANDLER
  const handleGetRecommendations = () => {
    if (!recommendationProductId) {
      toast.error("Please select a product");
      return;
    }

    setShowRecommendations(true);
  };

  // CHANGE AI MODE
  const handleModeChange = (mode) => {
    setAiMode(mode);

    setForm({
      ...getEmptyAiTagForm(),
      productType: mode,
    });

    setSelectedTag(null);
    setShowForm(false);
    setShowView(false);

    setShowRecommendations(false);
    setRecommendationProductId("");
  };

  // CANCEL FORM
  const handleCancel = () => {
    if (isWizard) {
      navigate(`/add-product/${wizardProductId}/ingredients`);
      return;
    }

    resetForm();
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Product AI Tags</h4>

        {!showForm && !isWizard && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleAdd}
          >
            Add AI Tags
          </button>
        )}
      </div>

      {/* SKIN AI / LOOK AI */}
      {!isWizard && (
        <div className="d-flex gap-2 mb-4">
          <button
            type="button"
            className={`btn ${aiMode === "SKIN_CARE"
              ? "btn-primary"
              : "btn-outline-primary"
              }`}
            onClick={() => handleModeChange("SKIN_CARE")}
          >
            Skin AI
          </button>

          <button
            type="button"
            className={`btn ${aiMode === "BEAUTY"
              ? "btn-primary"
              : "btn-outline-primary"
              }`}
            onClick={() => handleModeChange("BEAUTY")}
          >
            Look AI
          </button>
        </div>
      )}

      {/* AI RECOMMENDATIONS - SKIN AI ONLY */}
      {!isWizard && aiMode === "SKIN_CARE" && (
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">
              AI Product Recommendations
            </h5>
          </div>

          <div className="card-body">
            <div className="row align-items-end">
              <div className="col-md-5 mb-3">
                <label className="form-label fw-semibold">
                  Select Skin Care Product{" "}
                  <span className="text-danger">*</span>
                </label>

                <select
                  className="form-select"
                  value={recommendationProductId}
                  onChange={(event) => {
                    setRecommendationProductId(event.target.value);
                    setShowRecommendations(false);
                  }}
                >
                  <option value="">Select Product</option>

                  {products
                    .filter(
                      (product) => product.type === "SKIN_CARE"
                    )
                    .map((product) => (
                      <option
                        key={product._id}
                        value={product._id}
                      >
                        {product.name} ({product.sku})
                      </option>
                    ))}
                </select>
              </div>

              <div className="col-md-2 mb-3">
                <button
                  type="button"
                  className="btn btn-primary w-100"
                  onClick={handleGetRecommendations}
                >
                  Get AI
                </button>
              </div>
            </div>

            {showRecommendations && recommendationProductId && (
              <div className="mt-3">
                <AIRecommendations
                  productId={recommendationProductId}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE / EDIT FORM */}
      {showForm && (
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">
              {editing ? "Edit AI Tags" : "Add AI Tags"} -{" "}
              {aiMode === "SKIN_CARE" ? "Skin AI" : "Look AI"}
            </h5>
          </div>

          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                {!isWizard && (
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Product <span className="text-danger">*</span>
                    </label>

                    <select
                      className="form-select"
                      value={form.productId}
                      disabled={editing}
                      onChange={(event) =>
                        updateField("productId", event.target.value)
                      }
                      required
                    >
                      <option value="">Select Product</option>

                      {filteredProducts.map((product) => (
                        <option
                          key={product._id}
                          value={product._id}
                        >
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    Price Band
                  </label>

                  <select
                    className="form-select"
                    value={form.priceBand}
                    onChange={(event) =>
                      updateField("priceBand", event.target.value)
                    }
                  >
                    <option value="">Select Price Band</option>

                    {priceBandOptions.map((item) => (
                      <option key={item} value={item}>
                        {formatLabel(item)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SKIN AI CONFIGURATION */}
              {aiMode === "SKIN_CARE" && (
                <>
                  <hr />

                  <h6 className="mb-3">
                    Skin AI Configuration
                  </h6>

                  <div className="mb-3">
                    <label className="form-label">
                      Suitable Skin Types
                    </label>

                    {renderCheckboxOptions(
                      skinTypeOptions,
                      form.skinTypes,
                      (value, checked) =>
                        handleMultiSelect(
                          "skinTypes",
                          value,
                          checked
                        )
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Skin Concerns and Strength
                    </label>

                    {concernOptions.map((concern) => {
                      const selectedConcern =
                        form.concerns.find(
                          (item) => item.name === concern
                        );

                      return (
                        <div
                          className="row align-items-center mb-2"
                          key={concern}
                        >
                          <div className="col-md-4">
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={!!selectedConcern}
                                id={`concern-${concern}`}
                                onChange={(event) =>
                                  handleConcernCheckbox(
                                    concern,
                                    event.target.checked
                                  )
                                }
                              />

                              <label
                                className="form-check-label"
                                htmlFor={`concern-${concern}`}
                              >
                                {formatLabel(concern)}
                              </label>
                            </div>
                          </div>

                          <div className="col-md-4">
                            <select
                              className="form-select"
                              disabled={!selectedConcern}
                              value={selectedConcern?.strength ?? 2}
                              onChange={(event) =>
                                handleConcernChange(
                                  concern,
                                  Number(event.target.value)
                                )
                              }
                            >
                              <option value={1}>Low</option>
                              <option value={2}>Medium</option>
                              <option value={3}>High</option>
                            </select>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Routine Step
                      </label>

                      <select
                        className="form-select"
                        value={form.routineStep}
                        onChange={(event) =>
                          updateField(
                            "routineStep",
                            event.target.value
                          )
                        }
                      >
                        <option value="">
                          Select Routine Step
                        </option>

                        {routineStepOptions.map((item) => (
                          <option key={item} value={item}>
                            {formatLabel(item)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Time of Use
                      </label>

                      <select
                        className="form-select"
                        value={form.timeOfUse}
                        onChange={(event) =>
                          updateField(
                            "timeOfUse",
                            event.target.value
                          )
                        }
                      >
                        {timeOfUseOptions.map((item) => (
                          <option key={item} value={item}>
                            {formatLabel(item)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Contraindications
                    </label>

                    {renderCheckboxOptions(
                      contraindicationOptions,
                      form.contraindications,
                      (value, checked) =>
                        handleMultiSelect(
                          "contraindications",
                          value,
                          checked
                        )
                    )}
                  </div>
                </>
              )}

              {/* LOOK AI CONFIGURATION */}
              {aiMode === "BEAUTY" && (
                <>
                  <hr />

                  <h6 className="mb-3">
                    Look AI Configuration
                  </h6>

                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label">
                        Product Role
                      </label>

                      <select
                        className="form-select"
                        value={form.beauty.productRole}
                        onChange={(event) =>
                          updateBeautyField(
                            "productRole",
                            event.target.value
                          )
                        }
                      >
                        <option value="">
                          Select Product Role
                        </option>

                        {beautyRoleOptions.map((item) => (
                          <option key={item} value={item}>
                            {formatLabel(item)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-4 mb-3">
                      <label className="form-label">
                        Finish
                      </label>

                      <select
                        className="form-select"
                        value={form.beauty.finish}
                        onChange={(event) =>
                          updateBeautyField(
                            "finish",
                            event.target.value
                          )
                        }
                      >
                        <option value="">Select Finish</option>

                        {finishOptions.map((item) => (
                          <option key={item} value={item}>
                            {formatLabel(item)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-4 mb-3">
                      <label className="form-label">
                        Coverage
                      </label>

                      <select
                        className="form-select"
                        value={form.beauty.coverage}
                        onChange={(event) =>
                          updateBeautyField(
                            "coverage",
                            event.target.value
                          )
                        }
                      >
                        <option value="">Select Coverage</option>

                        {coverageOptions.map((item) => (
                          <option key={item} value={item}>
                            {formatLabel(item)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Suitable Looks
                    </label>

                    {renderCheckboxOptions(
                      suitableLookOptions,
                      form.beauty.suitableLooks,
                      (value, checked) =>
                        handleBeautyMultiSelect(
                          "suitableLooks",
                          value,
                          checked
                        )
                    )}
                  </div>
                </>
              )}

              <hr />

              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="includeInAIRecommendations"
                  checked={form.includeInAIRecommendations}
                  onChange={(event) =>
                    updateField(
                      "includeInAIRecommendations",
                      event.target.checked
                    )
                  }
                />

                <label
                  className="form-check-label"
                  htmlFor="includeInAIRecommendations"
                >
                  Include in AI Recommendations
                </label>
              </div>

              <div className="d-flex gap-2">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading
                    ? "Please wait..."
                    : editing
                      ? "Update"
                      : "Save"}
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI TAGS TABLE - HIDE IN WIZARD */}
      {!isWizard && (
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">
              {aiMode === "SKIN_CARE"
                ? "Skin AI Tags"
                : "Look AI Tags"}
            </h5>
          </div>

          <div className="card-body table-responsive">
            <table className="table table-bordered table-hover align-middle">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Product</th>

                  {aiMode === "SKIN_CARE" ? (
                    <>
                      <th>Skin Types</th>
                      <th>Concerns</th>
                      <th>Routine Step</th>
                    </>
                  ) : (
                    <>
                      <th>Product Role</th>
                      <th>Finish</th>
                      <th>Suitable Looks</th>
                    </>
                  )}

                  <th>AI Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredTags.length > 0 ? (
                  filteredTags.map((tag, index) => (
                    <tr key={tag._id}>
                      <td>{index + 1}</td>

                      <td>{getProductName(tag)}</td>

                      {aiMode === "SKIN_CARE" ? (
                        <>
                          <td>
                            {getArrayValue(tag.skinTypes)
                              .map(formatLabel)
                              .join(", ") || "-"}
                          </td>

                          <td>
                            {getArrayValue(tag.concerns)
                              .map((item) =>
                                formatLabel(item.name)
                              )
                              .join(", ") || "-"}
                          </td>

                          <td>
                            {formatLabel(tag.routineStep || "-")}
                          </td>
                        </>
                      ) : (
                        <>
                          <td>
                            {formatLabel(
                              tag.beauty?.productRole || "-"
                            )}
                          </td>

                          <td>
                            {formatLabel(
                              tag.beauty?.finish || "-"
                            )}
                          </td>

                          <td>
                            {getArrayValue(
                              tag.beauty?.suitableLooks
                            )
                              .map(formatLabel)
                              .join(", ") || "-"}
                          </td>
                        </>
                      )}

                      <td>
                        <span
                          className={`badge ${tag.includeInAIRecommendations
                            ? "bg-success"
                            : "bg-secondary"
                            }`}
                        >
                          {tag.includeInAIRecommendations
                            ? "Enabled"
                            : "Disabled"}
                        </span>
                      </td>

                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            flexWrap: "nowrap",
                            minWidth: "210px",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => handleView(tag)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "6px 13px",
                              minWidth: "58px",
                              backgroundColor: "#0dcaf0",
                              color: "#ffffff",
                              border: "1px solid #0dcaf0",
                              borderRadius: "5px",
                              fontSize: "13px",
                              fontWeight: "600",
                              cursor: "pointer",
                            }}
                          >
                            View
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEdit(tag)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "6px 13px",
                              minWidth: "58px",
                              backgroundColor: "#0d6efd",
                              color: "#ffffff",
                              border: "1px solid #0d6efd",
                              borderRadius: "5px",
                              fontSize: "13px",
                              fontWeight: "600",
                              cursor: "pointer",
                            }}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(tag.product?._id)
                            }
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "6px 13px",
                              minWidth: "65px",
                              backgroundColor: "#dc3545",
                              color: "#ffffff",
                              border: "1px solid #dc3545",
                              borderRadius: "5px",
                              fontSize: "13px",
                              fontWeight: "600",
                              cursor: "pointer",
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      className="text-center py-4"
                    >
                      No AI tags found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {showView && selectedTag && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  AI Tag Details
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowView(false)}
                />
              </div>

              <div className="modal-body">
                <p>
                  <strong>Product:</strong>{" "}
                  {getProductName(selectedTag)}
                </p>

                <p>
                  <strong>Product Type:</strong>{" "}
                  {formatLabel(
                    selectedTag.product?.type ||
                    selectedTag.productType ||
                    selectedTag.type ||
                    ""
                  )}
                </p>

                {selectedTag.product?.type === "SKIN_CARE" ||
                  (!selectedTag.product?.type &&
                    aiMode === "SKIN_CARE") ? (
                  <>
                    <p>
                      <strong>Skin Types:</strong>{" "}
                      {getArrayValue(selectedTag.skinTypes)
                        .map(formatLabel)
                        .join(", ")}
                    </p>

                    <p>
                      <strong>Concerns:</strong>
                    </p>

                    <ul>
                      {getArrayValue(
                        selectedTag.concerns
                      ).map((item, index) => (
                        <li key={index}>
                          {formatLabel(item.name)} -{" "}
                          {formatLabel(item.strength)}
                        </li>
                      ))}
                    </ul>

                    <p>
                      <strong>Routine Step:</strong>{" "}
                      {formatLabel(
                        selectedTag.routineStep || "-"
                      )}
                    </p>

                    <p>
                      <strong>Time of Use:</strong>{" "}
                      {formatLabel(
                        selectedTag.timeOfUse || "-"
                      )}
                    </p>

                    <p>
                      <strong>Contraindications:</strong>{" "}
                      {getArrayValue(
                        selectedTag.contraindications
                      )
                        .map(formatLabel)
                        .join(", ")}
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      <strong>Product Role:</strong>{" "}
                      {formatLabel(
                        selectedTag.beauty?.productRole || "-"
                      )}
                    </p>

                    <p>
                      <strong>Finish:</strong>{" "}
                      {formatLabel(
                        selectedTag.beauty?.finish || "-"
                      )}
                    </p>

                    <p>
                      <strong>Coverage:</strong>{" "}
                      {formatLabel(
                        selectedTag.beauty?.coverage || "-"
                      )}
                    </p>

                    <p>
                      <strong>Suitable Looks:</strong>{" "}
                      {getArrayValue(
                        selectedTag.beauty?.suitableLooks
                      )
                        .map(formatLabel)
                        .join(", ")}
                    </p>
                  </>
                )}

                <p>
                  <strong>Price Band:</strong>{" "}
                  {formatLabel(selectedTag.priceBand || "-")}
                </p>

                <p>
                  <strong>AI Recommendations:</strong>{" "}
                  {selectedTag.includeInAIRecommendations
                    ? "Enabled"
                    : "Disabled"}
                </p>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowView(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductAiTags;
