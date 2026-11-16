
import React from "react";

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
} from "./aiTagHelpers.js";

const AiTagsForm = ({
  showForm,
  isWizard,
  editing,
  aiMode,
  form,
  loading,
  filteredProducts = [],
  handleSubmit,
  updateField,
  updateBeautyField,
  handleMultiSelect,
  handleBeautyMultiSelect,
  handleConcernChange,
  handleConcernCheckbox,
  handleCancel,
}) => {
  // Render common checkbox options
  const renderCheckboxOptions = (
    options,
    selectedValues = [],
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

  if (!showForm) {
    return null;
  }

  return (
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
            {/* PRODUCT SELECTION */}
            {!isWizard && (
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Product <span className="text-danger">*</span>
                </label>

                <select
                  className="form-select"
                  value={form.productId || ""}
                  disabled={editing || filteredProducts.length === 0}
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

            {/* PRICE BAND */}
            <div className="col-md-6 mb-3">
              <label className="form-label">
                Price Band
              </label>

              <select
                className="form-select"
                value={form.priceBand || ""}
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

              {/* SKIN TYPES */}
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

              {/* SKIN CONCERNS */}
              <div className="mb-3">
                <label className="form-label">
                  Skin Concerns and Strength
                </label>

                {concernOptions.map((concern) => {
                  const selectedConcern = form.concerns.find(
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

              {/* ROUTINE STEP AND TIME OF USE */}
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    Routine Step
                  </label>

                  <select
                    className="form-select"
                    value={form.routineStep || ""}
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
                    value={form.timeOfUse || ""}
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

              {/* CONTRAINDICATIONS */}
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
                {/* PRODUCT ROLE */}
                <div className="col-md-4 mb-3">
                  <label className="form-label">
                    Product Role
                  </label>

                  <select
                    className="form-select"
                    value={form.beauty.productRole || ""}
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

                {/* FINISH */}
                <div className="col-md-4 mb-3">
                  <label className="form-label">
                    Finish
                  </label>

                  <select
                    className="form-select"
                    value={form.beauty.finish || ""}
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

                {/* COVERAGE */}
                <div className="col-md-4 mb-3">
                  <label className="form-label">
                    Coverage
                  </label>

                  <select
                    className="form-select"
                    value={form.beauty.coverage || ""}
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

              {/* SUITABLE LOOKS */}
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

          {/* AI RECOMMENDATION STATUS */}
          <div className="form-check mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="includeInAIRecommendations"
              checked={!!form.includeInAIRecommendations}
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

          {/* ACTION BUTTONS */}
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
  );
};

export default AiTagsForm;
