
import React, { useEffect, useMemo, useState } from "react";
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
  const [analysisId, setAnalysisId] = useState("");
  const [recommendationProductId, setRecommendationProductId] =
    useState("");
  const [showRecommendations, setShowRecommendations] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchAiTags();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await makeApiRequest({
        url: "getproduct",
        method: "GET",
      });

      if (response?.status) {
        setProducts(response.data || []);
      }
    } catch (error) {
      console.error("Fetch products error:", error);
      toast.error("Unable to fetch products");
    }
  };

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

  const filteredProducts = useMemo(() => {
    return products.filter(
      (product) => product.type === aiMode
    );
  }, [products, aiMode]);

  const filteredTags = useMemo(() => {
    return aiTags.filter(
      (tag) => tag.product?.type === aiMode
    );
  }, [aiTags, aiMode]);
  const resetForm = () => {
    setForm({
      ...getEmptyAiTagForm(),
      productType: aiMode,
    });

    setEditing(false);
    setShowForm(false);
  };

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const updateBeautyField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      beauty: {
        ...previous.beauty,
        [field]: value,
      },
    }));
  };

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

  const handleConcernCheckbox = (concernName, checked) => {
    setForm((previous) => {
      const currentConcerns = [...previous.concerns];

      return {
        ...previous,
        concerns: checked
          ? [
            ...currentConcerns,
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

  const handleAdd = () => {
    resetForm();

    setForm({
      ...getEmptyAiTagForm(),
      productType: aiMode,
    });

    setShowForm(true);
  };

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

      const response = await makeApiRequest({
        url: editing
          ? `updateproduct-ai-tags/${form.productId}`
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

  const handleView = (tag) => {
    setSelectedTag(tag);
    setShowView(true);
  };

  const getProductName = (tag) => {
    return tag.product?.name || "Product";
  };

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

  // AI Recommendation Handler
  const handleGetRecommendations = () => {
    if (!analysisId.trim()) {
      toast.error("Please enter Analysis ID");
      return;
    }

    if (!recommendationProductId) {
      toast.error("Please select a product");
      return;
    }

    setShowRecommendations(true);
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Product AI Tags</h4>

        {!showForm && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleAdd}
          >
            Add AI Tags
          </button>
        )}
      </div>

      {/* Skin AI / Look AI */}
      <div className="d-flex gap-2 mb-4">
        <button
          type="button"
          className={`btn ${aiMode === "SKIN_CARE"
            ? "btn-primary"
            : "btn-outline-primary"
            }`}
          onClick={() => {
            setAiMode("SKIN_CARE");
            resetForm();
            setShowRecommendations(false);
            setRecommendationProductId("");
          }}
        >
          Skin AI
        </button>

        <button
          type="button"
          className={`btn ${aiMode === "BEAUTY"
            ? "btn-primary"
            : "btn-outline-primary"
            }`}
          onClick={() => {
            setAiMode("BEAUTY");
            resetForm();
            setShowRecommendations(false);
            setRecommendationProductId("");
          }}
        >
          Look AI
        </button>
      </div>

      {/* AI Recommendations - Skin AI Only */}
      {aiMode === "SKIN_CARE" && (
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">
              AI Product Recommendations
            </h5>
          </div>

          <div className="card-body">
            <div className="row align-items-end">
              <div className="col-md-5 mb-3">
                <label className="form-label">
                  Analysis ID
                </label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter Analysis ID"
                  value={analysisId}
                  onChange={(event) => {
                    setAnalysisId(event.target.value);
                    setShowRecommendations(false);
                  }}
                />
              </div>

              <div className="col-md-5 mb-3">
                <label className="form-label">
                  Product
                </label>

                <select
                  className="form-select"
                  value={recommendationProductId}
                  onChange={(event) => {
                    setRecommendationProductId(event.target.value);
                    setShowRecommendations(false);
                  }}
                >
                  <option value="">
                    Select Product
                  </option>

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

            {showRecommendations && (
              <div className="mt-3">
                <AIRecommendations
                  analysisId={analysisId.trim()}
                  productId={recommendationProductId}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create / Edit Form */}
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
                  onClick={resetForm}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Tags Table */}
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
                        {/* View */}
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
                            visibility: "visible",
                            opacity: 1,
                          }}
                        >
                          View
                        </button>

                        {/* Edit */}
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
                            visibility: "visible",
                            opacity: 1,
                          }}
                        >
                          Edit
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => handleDelete(tag.product?._id)}
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
                            visibility: "visible",
                            opacity: 1,
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

      {/* View Modal */}
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
                    selectedTag.productType ||
                    selectedTag.type ||
                    ""
                  )}
                </p>

                {aiMode === "SKIN_CARE" ? (
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
