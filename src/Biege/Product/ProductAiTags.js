
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { makeApiRequest } from "../../AxiosServices/apiCall";

const skinTypeOptions = [
  "oily",
  "dry",
  "combination",
  "normal",
  "sensitive",
];

const concernOptions = [
  "acne",
  "darkSpots",
  "pigmentation",
  "redness",
  "pores",
  "fineLines",
  "darkCircles",
  "dullness",
  "dehydration",
];

const routineOptions = [
  "cleanser",
  "toner",
  "serum",
  "moisturiser",
  "sunscreen",
  "mask",
  "treatment",
];

const contraindicationOptions = [
  "pregnancy-unsafe",
  "not-with-retinoids",
  "not-for-sensitive-skin",
  "patch-test-needed",
];

const roleOptions = [
  "foundation",
  "concealer",
  "blush",
  "lipstick",
  "lip-gloss",
  "mascara",
  "eyeliner",
  "eyeshadow",
  "highlighter",
  "bronzer",
  "primer",
  "setting-powder",
];

const lookOptions = [
  "natural",
  "bridal",
  "party",
  "office",
  "glam",
  "smokey",
  "everyday",
  "minimal",
];

const createInitialForm = () => ({
  productId: "",
  productType: "SKIN_CARE",
  skinTypes: [],
  concerns: [],
  routineStep: "",
  timeOfUse: "BOTH",
  contraindications: [],
  beauty: {
    productRole: "",
    finish: "",
    coverage: "",
    suitableLooks: [],
  },
  priceBand: "",
  includeInAI: true,
});

function ProductAiTags() {
  const [products, setProducts] = useState([]);
  const [aiTags, setAiTags] = useState([]);
  const [form, setForm] = useState(createInitialForm);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchAiTags();
  }, []);

  // Fetch products
  const fetchProducts = async () => {
    try {
      const response = await makeApiRequest({
        url: "getproduct",
        method: "GET",
      });

      if (response?.status) {
        setProducts(response.data || []);
      } else {
        toast.error(response?.message || "Unable to fetch products");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Unable to fetch products"
      );
    }
  };

  // Fetch AI tags
  const fetchAiTags = async () => {
    try {
      setLoading(true);

      const response = await makeApiRequest({
        url: "getproduct-ai-tags",
        method: "GET",
      });
      console.log("AI TAG API RESPONSE:", response);
      console.log("AI TAG DATA:", response?.data);
      if (response?.status) {
        setAiTags(response.data || []);
      } else {
        toast.error(response?.message || "Unable to fetch AI tags");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Unable to fetch AI tags"
      );
    } finally {
      setLoading(false);
    }
  };

  // Product selection
  const handleProductChange = (productId) => {
    const selectedProduct = products.find(
      (item) => item._id === productId
    );

    setForm((prev) => ({
      ...prev,
      productId,
      productType: selectedProduct?.type || "SKIN_CARE",
    }));
  };

  // Generic checkbox array handler
  const toggleArrayValue = (field, value) => {
    setForm((prev) => {
      const currentValues = Array.isArray(prev[field])
        ? prev[field]
        : [];

      const exists = currentValues.includes(value);

      return {
        ...prev,
        [field]: exists
          ? currentValues.filter((item) => item !== value)
          : [...currentValues, value],
      };
    });
  };

  // Concern checkbox handler
  const toggleConcern = (name) => {
    setForm((prev) => {
      const currentConcerns = Array.isArray(prev.concerns)
        ? prev.concerns
        : [];

      const exists = currentConcerns.some(
        (item) => item.name === name
      );

      return {
        ...prev,
        concerns: exists
          ? currentConcerns.filter((item) => item.name !== name)
          : [...currentConcerns, { name, strength: 1 }],
      };
    });
  };

  // Update concern strength
  const updateConcernStrength = (name, strength) => {
    setForm((prev) => ({
      ...prev,
      concerns: prev.concerns.map((item) =>
        item.name === name
          ? { ...item, strength: Number(strength) }
          : item
      ),
    }));
  };

  // Beauty suitable looks checkbox
  const toggleSuitableLook = (value) => {
    setForm((prev) => {
      const currentLooks = Array.isArray(
        prev.beauty?.suitableLooks
      )
        ? prev.beauty.suitableLooks
        : [];

      const exists = currentLooks.includes(value);

      return {
        ...prev,
        beauty: {
          ...prev.beauty,
          suitableLooks: exists
            ? currentLooks.filter((item) => item !== value)
            : [...currentLooks, value],
        },
      };
    });
  };

  // Beauty field update
  const updateBeautyField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      beauty: {
        ...prev.beauty,
        [field]: value,
      },
    }));
  };

  // General field update
  const updateFormField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Reset form
  const resetForm = () => {
    setForm(createInitialForm());
    setEditing(false);
  };

  // Edit AI tags
  const handleEdit = (item) => {
    const productId =
      typeof item.product === "object"
        ? item.product?._id
        : item.product;

    setForm({
      productId: productId || "",
      productType: item.product?.type || "SKIN_CARE",

      skinTypes: Array.isArray(item.skinTypes)
        ? [...item.skinTypes]
        : [],

      concerns: Array.isArray(item.concerns)
        ? item.concerns.map((concern) => ({
          name: concern.name,
          strength: Number(concern.strength) || 1,
        }))
        : [],

      routineStep: item.routineStep || "",
      timeOfUse: item.timeOfUse || "BOTH",

      contraindications: Array.isArray(item.contraindications)
        ? [...item.contraindications]
        : [],

      beauty: {
        productRole: item.beauty?.productRole || "",
        finish: item.beauty?.finish || "",
        coverage: item.beauty?.coverage || "",
        suitableLooks: Array.isArray(item.beauty?.suitableLooks)
          ? [...item.beauty.suitableLooks]
          : [],
      },

      priceBand: item.priceBand || "",
      includeInAI: item.includeInAIRecommendations ?? true,
    });

    setEditing(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };



  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) return;

    if (!form.productId) {
      return toast.error("Please select a product");
    }

    if (form.productType === "SKIN_CARE" && form.skinTypes.length === 0) {
      return toast.error("Select at least one skin type");
    }

    if (form.productType === "BEAUTY" && !form.beauty.productRole) {
      return toast.error("Select a beauty product role");
    }

    if (!form.priceBand) {
      return toast.error("Please select a price band");
    }

    const payload = {
      productId: form.productId,

      skinTypes:
        form.productType === "SKIN_CARE"
          ? form.skinTypes.map((item) => item.toUpperCase())
          : [],

      concerns:
        form.productType === "SKIN_CARE"
          ? form.concerns.map((item) => ({
            name: item.name.replace(/([A-Z])/g, "_$1").toUpperCase(),
            strength: Number(item.strength),
          }))
          : [],

      routineStep:
        form.productType === "SKIN_CARE" && form.routineStep
          ? form.routineStep.toUpperCase()
          : null,

      timeOfUse:
        form.productType === "SKIN_CARE"
          ? form.timeOfUse.toUpperCase()
          : "BOTH",

      contraindications:
        form.productType === "SKIN_CARE"
          ? form.contraindications.map((item) =>
            item.toUpperCase().replace(/-/g, "_")
          )
          : [],

      beauty: {
        productRole:
          form.productType === "BEAUTY"
            ? form.beauty.productRole.toUpperCase().replace(/-/g, "_")
            : "",
        finish:
          form.productType === "BEAUTY"
            ? form.beauty.finish.toUpperCase()
            : "",
        coverage:
          form.productType === "BEAUTY"
            ? form.beauty.coverage.toUpperCase()
            : "",
        suitableLooks:
          form.productType === "BEAUTY"
            ? form.beauty.suitableLooks.map((item) => item.toUpperCase())
            : [],
      },

      priceBand: form.priceBand.toUpperCase(),

      includeInAIRecommendations: Boolean(form.includeInAI),
    };

    try {
      setSaving(true);

      const response = await makeApiRequest({
        url: editing
          ? `updateproduct-ai-tags/${form.productId}`
          : "createproduct-ai-tags",
        method: editing ? "PUT" : "POST",
        data: payload,
      });

      if (!response?.status) {
        toast.error(response?.message || "Unable to save AI tags");
        return;
      }

      toast.success(response.message || "AI tags saved successfully");

      resetForm();
      await fetchAiTags();
    } catch (error) {
      console.error("AI Tags Submit Error:", error?.response?.data || error);

      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  };



  // Delete AI tags
  const handleDelete = async (productId) => {
    if (!productId) {
      return toast.error("Product ID not found");
    }

    if (
      !window.confirm(
        "Are you sure you want to delete these AI tags?"
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

        if (form.productId === productId) {
          resetForm();
        }

        await fetchAiTags();
      } else {
        toast.error(
          response?.message || "Unable to delete AI tags"
        );
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Delete failed"
      );
    }
  };

  // Product name
  const getProductName = (item) => {
    if (item.product && typeof item.product === "object") {
      return item.product.name || "Unknown product";
    }

    return "Product unavailable";
  };


  // const renderActions = (item) => {
  //   const productId =
  //     typeof item.product === "object"
  //       ? item.product?._id
  //       : item.product;

  //   return (
  //     <div className="d-flex align-items-center gap-2">
  //       <button
  //         type="button"
  //         className="btn btn-sm btn-primary"
  //         onClick={() => handleEdit(item)}
  //       >
  //         Edit
  //       </button>

  //       <button
  //         type="button"
  //         className="btn btn-sm btn-danger"
  //         onClick={() => handleDelete(productId)}
  //         disabled={!productId}
  //       >
  //         Delete
  //       </button>
  //     </div>
  //   );
  // };

  return (
    <div className="container-fluid py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Product AI Tags</h4>

        {editing && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={resetForm}
          >
            Cancel Edit
          </button>
        )}
      </div>

      {/* CREATE / EDIT FORM */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">
            {editing
              ? "Edit Product AI Tags"
              : "Create Product AI Tags"}
          </h5>
        </div>

        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Product</label>

                <select
                  className="form-select"
                  value={form.productId}
                  onChange={(e) =>
                    handleProductChange(e.target.value)
                  }
                  disabled={editing}
                  required
                >
                  <option value="">Select Product</option>

                  {products.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.name}
                      {product.sku ? ` (${product.sku})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Product Type</label>

                <input
                  className="form-control"
                  value={form.productType}
                  readOnly
                />
              </div>
            </div>

            {/* SKIN CARE FIELDS */}
            {form.productType === "SKIN_CARE" && (
              <>
                <hr />

                <h6 className="mb-3">Skin Types Suited</h6>

                <div className="row mb-3">
                  {skinTypeOptions.map((value) => (
                    <div className="col-md-3 col-6 mb-2" key={value}>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`skin-${value}`}
                          checked={form.skinTypes.includes(value)}
                          onChange={(e) =>
                            toggleArrayValue(
                              "skinTypes",
                              value
                            )
                          }
                        />

                        <label
                          className="form-check-label text-capitalize"
                          htmlFor={`skin-${value}`}
                        >
                          {value}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                <hr />

                <h6 className="mb-3">Concerns and Strength</h6>

                {concernOptions.map((value) => {
                  const selected = form.concerns.find(
                    (item) => item.name === value
                  );

                  return (
                    <div
                      className="row align-items-center mb-2"
                      key={value}
                    >
                      <div className="col-md-4">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`concern-${value}`}
                            checked={Boolean(selected)}
                            onChange={() =>
                              toggleConcern(value)
                            }
                          />

                          <label
                            className="form-check-label"
                            htmlFor={`concern-${value}`}
                          >
                            {value}
                          </label>
                        </div>
                      </div>

                      {selected && (
                        <div className="col-md-4">
                          <select
                            className="form-select"
                            value={selected.strength}
                            onChange={(e) =>
                              updateConcernStrength(
                                value,
                                e.target.value
                              )
                            }
                          >
                            <option value={1}>Strength 1</option>
                            <option value={2}>Strength 2</option>
                            <option value={3}>Strength 3</option>
                          </select>
                        </div>
                      )}
                    </div>
                  );
                })}

                <hr />

                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">
                      Routine Step
                    </label>

                    <select
                      className="form-select"
                      value={form.routineStep}
                      onChange={(e) =>
                        updateFormField(
                          "routineStep",
                          e.target.value
                        )
                      }
                    >
                      <option value="">
                        Select Routine Step
                      </option>

                      {routineOptions.map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="form-label">
                      Time of Use
                    </label>

                    <select
                      className="form-select"
                      value={form.timeOfUse}
                      onChange={(e) =>
                        updateFormField(
                          "timeOfUse",
                          e.target.value
                        )
                      }
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                      <option value="BOTH">Both</option>
                    </select>
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="form-label">
                      Price Band
                    </label>

                    <select
                      className="form-select"
                      value={form.priceBand}
                      onChange={(e) =>
                        updateFormField(
                          "priceBand",
                          e.target.value
                        )
                      }
                    >
                      <option value="">
                        Select Price Band
                      </option>
                      <option value="budget">Budget</option>
                      <option value="mid">Mid</option>
                      <option value="premium">Premium</option>
                    </select>
                  </div>
                </div>

                <hr />

                <h6 className="mb-3">Contraindications</h6>

                <div className="row mb-3">
                  {contraindicationOptions.map((value) => (
                    <div
                      className="col-md-6 col-12 mb-2"
                      key={value}
                    >
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`contra-${value}`}
                          checked={form.contraindications.includes(
                            value
                          )}
                          onChange={() =>
                            toggleArrayValue(
                              "contraindications",
                              value
                            )
                          }
                        />

                        <label
                          className="form-check-label"
                          htmlFor={`contra-${value}`}
                        >
                          {value}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* BEAUTY FIELDS */}
            {form.productType === "BEAUTY" && (
              <>
                <hr />

                <h6 className="mb-3">Beauty Product Tags</h6>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Product Role
                    </label>

                    <select
                      className="form-select"
                      value={form.beauty.productRole}
                      onChange={(e) =>
                        updateBeautyField(
                          "productRole",
                          e.target.value
                        )
                      }
                    >
                      <option value="">Select Role</option>

                      {roleOptions.map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Finish</label>

                    <select
                      className="form-select"
                      value={form.beauty.finish}
                      onChange={(e) =>
                        updateBeautyField(
                          "finish",
                          e.target.value
                        )
                      }
                    >
                      <option value="">Select Finish</option>

                      {["matte", "dewy", "satin", "shimmer"].map(
                        (value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Coverage</label>

                    <select
                      className="form-select"
                      value={form.beauty.coverage}
                      onChange={(e) =>
                        updateBeautyField(
                          "coverage",
                          e.target.value
                        )
                      }
                    >
                      <option value="">Select Coverage</option>

                      {["sheer", "medium", "full"].map(
                        (value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Price Band
                    </label>

                    <select
                      className="form-select"
                      value={form.priceBand}
                      onChange={(e) =>
                        updateFormField(
                          "priceBand",
                          e.target.value
                        )
                      }
                    >
                      <option value="">
                        Select Price Band
                      </option>
                      <option value="budget">Budget</option>
                      <option value="mid">Mid</option>
                      <option value="premium">Premium</option>
                    </select>
                  </div>
                </div>

                <hr />

                <h6 className="mb-3">Suitable Looks</h6>

                <div className="row mb-3">
                  {lookOptions.map((value) => (
                    <div className="col-md-3 col-6 mb-2" key={value}>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`look-${value}`}
                          checked={form.beauty.suitableLooks.includes(
                            value
                          )}
                          onChange={() =>
                            toggleSuitableLook(value)
                          }
                        />

                        <label
                          className="form-check-label text-capitalize"
                          htmlFor={`look-${value}`}
                        >
                          {value}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <hr />

            {/* INCLUDE IN AI */}
            <div className="form-check form-switch mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="includeInAI"
                checked={form.includeInAI}
                onChange={(e) =>
                  updateFormField(
                    "includeInAI",
                    e.target.checked
                  )
                }
              />

              <label
                className="form-check-label"
                htmlFor="includeInAI"
              >
                Include in AI recommendations
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editing
                  ? "Update AI Tags"
                  : "Create AI Tags"}
            </button>
          </form>
        </div>
      </div>

      {/* AI TAGS LIST */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Product AI Tags List</h5>
        </div>

        <div className="card-body table-responsive">
          {loading ? (
            <p>Loading AI tags...</p>
          ) : (
            <table className="table table-bordered table-hover align-middle">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Product</th>
                  <th>Type</th>
                  <th>AI Status</th>
                  <th>Price Band</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {aiTags.length > 0 ? (
                  aiTags.map((item, index) => {

                    const productId =
                      typeof item.product === "object"
                        ? item.product?._id
                        : item.product;

                    console.log("ROW ITEM:", item);
                    return (
                      <tr key={item._id}>
                        <td>{index + 1}</td>

                        <td>{getProductName(item)}</td>

                        <td>{item.product?.type || "-"}</td>

                        <td>
                          <span
                            className={`badge ${item.includeInAIRecommendations
                              ? "bg-success"
                              : "bg-secondary"
                              }`}
                          >
                            {item.includeInAIRecommendations ? "Included" : "Excluded"}
                          </span>
                        </td>

                        <td>{item.priceBand || "-"}</td>

                        <td
                          style={{
                            minWidth: "180px",
                            display: "table-cell",
                            visibility: "visible",
                            opacity: 1,
                            overflow: "visible",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              visibility: "visible",
                              opacity: 1,
                            }}
                          >
                            <button
                              type="button"
                              style={{
                                display: "inline-block",
                                backgroundColor: "#0d6efd",
                                color: "#ffffff",
                                border: "none",
                                padding: "6px 12px",
                                borderRadius: "4px",
                                cursor: "pointer",
                              }}
                              onClick={() => handleEdit(item)}
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              style={{
                                display: "inline-block",
                                backgroundColor: "#dc3545",
                                color: "#ffffff",
                                border: "none",
                                padding: "6px 12px",
                                borderRadius: "4px",
                                cursor: "pointer",
                              }}
                              onClick={() => handleDelete(item.product?._id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">
                      No AI tags found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductAiTags;
