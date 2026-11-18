
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { makeApiRequest } from "../../AxiosServices/apiCall";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faSave,
} from "@fortawesome/free-solid-svg-icons";

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
        toast.error(
          result?.message || "Failed to fetch products"
        );
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

          return (
            String(existingProductId) ===
            String(selectedProductId)
          );
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

          toast.info(
            "No existing variant found for this product"
          );
        }
      } else {
        toast.error(
          result?.message || "Failed to fetch variants"
        );
      }
    } catch (error) {
      console.log("Get variant error:", error);

      toast.error(
        error?.response?.data?.message ||
        "Failed to fetch product variant"
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

    if (
      Number(formData.price) < 0 ||
      Number(formData.stock) < 0
    ) {
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
          navigate(
            `/add-product/${wizardProductId}/ingredients`
          );
          return;
        }

        navigate("/product-variants");
      } else {
        toast.error(
          result?.message || "Failed to save variant"
        );
      }
    } catch (error) {
      console.log("Save variant error:", error);

      toast.error(
        error?.response?.data?.message ||
        "Failed to save product variant"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================
  // UI
  // =====================================

  return (
    <div className="container-fluid py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">
          {isEditWizard
            ? "Update Product Variant"
            : "Create Product Variant"}
        </h4>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleBack}
        >
          <FontAwesomeIcon
            icon={faArrowLeft}
            className="me-2"
          />
          Back
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              Loading product variant...
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="row">
                {/* PRODUCT */}

                {!isWizard && !isEditWizard && (
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      Product{" "}
                      <span className="text-danger">*</span>
                    </label>

                    <select
                      name="productId"
                      className="form-select"
                      value={formData.productId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">
                        Select Product
                      </option>

                      {products.map((product) => (
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

                {/* VARIANT TYPE */}

                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    Variant Type{" "}
                    <span className="text-danger">*</span>
                  </label>

                  <select
                    name="variantType"
                    className="form-select"
                    value={formData.variantType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Select Variant Type
                    </option>

                    <option value="SIZE">Size</option>
                    <option value="VOLUME">Volume</option>
                    <option value="SHADE">Shade</option>
                  </select>
                </div>

                {/* VARIANT NAME */}

                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    Variant Name{" "}
                    <span className="text-danger">*</span>
                  </label>

                  <input
                    type="text"
                    name="variantName"
                    className="form-control"
                    placeholder="Example: 50ml, Large, Rose Pink"
                    value={formData.variantName}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* SKU */}

                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    SKU{" "}
                    <span className="text-danger">*</span>
                  </label>

                  <input
                    type="text"
                    name="sku"
                    className="form-control"
                    placeholder="Enter SKU"
                    value={formData.sku}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* PRICE */}

                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    Price{" "}
                    <span className="text-danger">*</span>
                  </label>

                  <input
                    type="number"
                    name="price"
                    className="form-control"
                    placeholder="Enter price"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* STOCK */}

                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    Stock
                  </label>

                  <input
                    type="number"
                    name="stock"
                    className="form-control"
                    placeholder="Enter stock"
                    min="0"
                    value={formData.stock}
                    onChange={handleChange}
                  />
                </div>

                {/* BARCODE */}

                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    Barcode
                  </label>

                  <input
                    type="text"
                    name="barcode"
                    className="form-control"
                    placeholder="Enter barcode"
                    value={formData.barcode}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* BUTTONS */}

              <div className="d-flex justify-content-end gap-2 mt-3">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancel}
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    submitting ||
                    (isEditWizard && !variantId)
                  }
                >
                  <FontAwesomeIcon
                    icon={faSave}
                    className="me-2"
                  />

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
    </div>
  );
}

export default CreateProductVariant;
