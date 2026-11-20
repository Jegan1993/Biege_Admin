import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { makeApiRequest } from "../../AxiosServices/apiCall";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSave } from "@fortawesome/free-solid-svg-icons";

// ================= TAILWIND CLASS HELPERS =================

const btnPrimary =
  "rounded-md bg-[#e98d9d] px-[18px] py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#d97589] disabled:cursor-not-allowed disabled:opacity-60";

const btnGhost =
  "rounded-md border border-[#e3c8cc] bg-white px-[18px] py-2.5 text-[13px] font-semibold text-[#8c3d4e] transition hover:border-[#e98d9d] hover:bg-[#faf2f3] disabled:cursor-not-allowed disabled:opacity-60";

const fieldClass =
  "w-full rounded-md border border-[#e3c8cc] bg-white px-3 py-2.5 text-[13px] text-[#26334a] outline-none transition focus:border-[#e98d9d] focus:ring-4 focus:ring-[#e98d9d]/30";

const labelClass = "text-xs font-semibold text-[#8c3d4e]";

const initialValues = {
  productId: "",
  variantType: "",
  variantName: "",
  sku: "",
  price: "",
  stock: 0,
  barcode: "",
};

function CreateProductVariant() {
  const navigate = useNavigate();

  const { productId: wizardProductId, id } = useParams();

  // Create wizard
  const isWizard = Boolean(wizardProductId);

  // Edit wizard
  const isEditWizard = Boolean(id);

  const activeProductId = wizardProductId || id;

  const [formData, setFormData] = useState({
    ...initialValues,
    productId: activeProductId || "",
  });

  const [products, setProducts] = useState([]);
  const [variantId, setVariantId] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  // =====================================
  // GET PRODUCTS
  // =====================================

  const getProducts = async () => {
    try {
      const result = await makeApiRequest({
        url: "getproduct",
        method: "GET",
      });

      if (result?.status && Array.isArray(result.data)) {
        setProducts(result.data);
      } else {
        setProducts([]);
        toast.error(result?.message || "Failed to fetch products");
      }
    } catch (error) {
      console.log("Get products error:", error);
      toast.error("Failed to fetch products");
    }
  };

  // =====================================
  // GET EXISTING VARIANT FOR PRODUCT
  // =====================================

  const getProductVariant = async (selectedProductId) => {
    if (!selectedProductId) return;

    try {
      setLoading(true);

      const result = await makeApiRequest({
        url: "getproduct-variant",
        method: "GET",
      });

      console.log("PRODUCT VARIANTS RESULT:", result);

      if (result?.status && Array.isArray(result.data)) {
        const existingVariant = result.data.find((item) => {
          const existingProductId =
            item.product?._id ||
            item.productId?._id ||
            item.productId ||
            item.product;

          return String(existingProductId) === String(selectedProductId);
        });

        if (existingVariant) {
          setVariantId(existingVariant._id);

          setFormData({
            productId: selectedProductId,
            variantType: existingVariant.variantType || "",
            variantName: existingVariant.variantName || "",
            sku: existingVariant.sku || "",
            price: existingVariant.price ?? "",
            stock: existingVariant.stock ?? 0,
            barcode: existingVariant.barcode || "",
          });
        } else {
          setVariantId(null);
          setFormData({
            ...initialValues,
            productId: selectedProductId,
          });

          toast.info("No existing variant found for this product");
        }
      } else {
        toast.error(result?.message || "Failed to fetch variants");
      }
    } catch (error) {
      console.log("Get variant error:", error);

      toast.error(
        error?.response?.data?.message || "Failed to fetch product variant"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // INITIAL LOAD
  // =====================================

  useEffect(() => {
    getProducts();

    if (activeProductId) {
      setFormData((prev) => ({
        ...prev,
        productId: activeProductId,
      }));

      if (isEditWizard) {
        getProductVariant(activeProductId);
      }
    }
  }, [wizardProductId, id]);

  // =====================================
  // HANDLE INPUT CHANGE
  // =====================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================
  // BACK
  // =====================================

  const handleBack = () => {
    if (isEditWizard) {
      navigate(`/edit-product/${id}/media`);
      return;
    }

    if (isWizard) {
      navigate(`/add-product/${wizardProductId}/media`);
      return;
    }

    navigate("/add-product/variants");
  };

  // =====================================
  // CANCEL
  // =====================================

  const handleCancel = () => {
    if (isEditWizard) {
      navigate("/view-product");
      return;
    }

    if (isWizard) {
      navigate(`/add-product/${wizardProductId}/media`);
      return;
    }

    navigate("/product-variants");
  };

  // =====================================
  // VALIDATION
  // =====================================

  const validateForm = () => {
    if (
      !formData.productId ||
      !formData.variantType ||
      !formData.variantName.trim() ||
      !formData.sku.trim() ||
      formData.price === ""
    ) {
      toast.error("Please fill all required fields");
      return false;
    }

    if (Number(formData.price) < 0 || Number(formData.stock) < 0) {
      toast.error("Price and stock cannot be negative");
      return false;
    }

    return true;
  };

  // =====================================
  // CREATE / UPDATE VARIANT
  // =====================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const payload = {
        productId: formData.productId,
        variantType: formData.variantType,
        variantName: formData.variantName.trim(),
        sku: formData.sku.trim().toUpperCase(),
        price: Number(formData.price),
        stock: Number(formData.stock || 0),
        barcode: formData.barcode.trim(),
      };

      const result = await makeApiRequest({
        url: isEditWizard
          ? `updateproduct-variant/${variantId}`
          : "createproduct-variant",

        method: isEditWizard ? "PUT" : "POST",

        data: payload,
      });

      if (result?.status) {
        toast.success(
          result.message ||
            (isEditWizard
              ? "Variant updated successfully"
              : "Variant created successfully")
        );

        // EDIT: Return to product list
        if (isEditWizard) {
          navigate("/view-product");
          return;
        }

        // CREATE: Move to ingredients
        if (isWizard) {
          navigate(`/add-product/${wizardProductId}/ingredients`);
          return;
        }

        navigate("/product-variants");
      } else {
        toast.error(result?.message || "Failed to save variant");
      }
    } catch (error) {
      console.log("Save variant error:", error);

      toast.error(
        error?.response?.data?.message || "Failed to save product variant"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================
  // UI
  // =====================================

  return (
    <div className="min-h-screen bg-[#f6f7fb] p-4 sm:p-7">
      {/* HEADER */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="mb-1.5 text-[28px] font-bold text-[#e9899d]">
            {isEditWizard ? "Update Product Variant" : "Create Product Variant"}
          </h3>
          <p className="text-sm text-[#8791a5]">
            Add size, volume or shade options with price and stock.
          </p>
        </div>

        <button type="button" className={btnGhost} onClick={handleBack}>
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Back
        </button>
      </div>

      {/* CARD */}
      <div className="rounded-[13px] border border-[#edf0f5] bg-white p-5 shadow-[0_3px_12px_rgba(30,40,70,0.035)] sm:p-6">
        {loading ? (
          <div className="py-10 text-center text-[#8791a5]">
            <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-[3px] border-[#e3c8cc] border-t-[#e98d9d]" />
            <p className="text-sm">Loading product variant...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-x-5 gap-y-[18px] md:grid-cols-2">
              {/* PRODUCT */}

              {!isWizard && !isEditWizard && (
                <div className="flex flex-col gap-[7px]">
                  <label className={labelClass}>
                    Product <span className="text-red-600">*</span>
                  </label>

                  <select
                    name="productId"
                    className={fieldClass}
                    value={formData.productId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Product</option>

                    {products.map((product) => (
                      <option key={product._id} value={product._id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* VARIANT TYPE */}

              <div className="flex flex-col gap-[7px]">
                <label className={labelClass}>
                  Variant Type <span className="text-red-600">*</span>
                </label>

                <select
                  name="variantType"
                  className={fieldClass}
                  value={formData.variantType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Variant Type</option>
                  <option value="SIZE">Size</option>
                  <option value="VOLUME">Volume</option>
                  <option value="SHADE">Shade</option>
                </select>
              </div>

              {/* VARIANT NAME */}

              <div className="flex flex-col gap-[7px]">
                <label className={labelClass}>
                  Variant Name <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  name="variantName"
                  className={fieldClass}
                  placeholder="Example: 50ml, Large, Rose Pink"
                  value={formData.variantName}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* SKU */}

              <div className="flex flex-col gap-[7px]">
                <label className={labelClass}>
                  SKU <span className="text-red-600">*</span>
                </label>

                <input
                  type="text"
                  name="sku"
                  className={fieldClass}
                  placeholder="Enter SKU"
                  value={formData.sku}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* PRICE */}

              <div className="flex flex-col gap-[7px]">
                <label className={labelClass}>
                  Price <span className="text-red-600">*</span>
                </label>

                <input
                  type="number"
                  name="price"
                  className={fieldClass}
                  placeholder="Enter price"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* STOCK */}

              <div className="flex flex-col gap-[7px]">
                <label className={labelClass}>Stock</label>

                <input
                  type="number"
                  name="stock"
                  className={fieldClass}
                  placeholder="Enter stock"
                  min="0"
                  value={formData.stock}
                  onChange={handleChange}
                />
              </div>

              {/* BARCODE */}

              <div className="flex flex-col gap-[7px]">
                <label className={labelClass}>Barcode</label>

                <input
                  type="text"
                  name="barcode"
                  className={fieldClass}
                  placeholder="Enter barcode"
                  value={formData.barcode}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* BUTTONS */}

            <div className="mt-6 flex flex-wrap items-center justify-end gap-2.5 border-t border-[#edf0f5] pt-5">
              <button
                type="button"
                className={btnGhost}
                onClick={handleCancel}
                disabled={submitting}
              >
                Cancel
              </button>

              <button
                type="submit"
                className={btnPrimary}
                disabled={submitting || (isEditWizard && !variantId)}
              >
                <FontAwesomeIcon icon={faSave} className="mr-2" />

                {submitting
                  ? "Saving..."
                  : isEditWizard
                  ? "Update Variant"
                  : "Create Variant"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default CreateProductVariant;