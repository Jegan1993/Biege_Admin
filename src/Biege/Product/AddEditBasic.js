
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { makeApiRequest } from "../../AxiosServices/apiCall";
import { toast } from "react-toastify";
import * as Yup from "yup";

function AddEditBasic() {
  const navigate = useNavigate();
  const { id, productId } = useParams();

  const isWizard = Boolean(productId);
  const isEdit = Boolean(id) && !isWizard;

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    productId: "",
    slug: "",
    brandLine: "",
    collections: "",
    shortDescription: "",
    longDescription: "",
    howToUse: "",
  });

  // ==============================
  // YUP VALIDATION
  // ==============================

  const validationSchema = Yup.object().shape({
    ...(!isEdit && !isWizard
      ? {
        productId: Yup.string().required(
          "Please select a product"
        ),
      }
      : {}),

    slug: Yup.string()
      .trim()
      .required("Slug is required")
      .max(150, "Slug must not exceed 150 characters")
      .matches(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Enter a valid slug (example: face-serum)"
      ),

    brandLine: Yup.string()
      .trim()
      .required("Brand line is required")
      .max(100, "Brand line must not exceed 100 characters"),

    collections: Yup.string()
      .trim()
      .required("Collections are required")
      .max(500, "Collections must not exceed 500 characters"),

    shortDescription: Yup.string()
      .trim()
      .required("Short description is required")
      .max(300, "Short description must not exceed 300 characters"),

    longDescription: Yup.string()
      .trim()
      .required("Long description is required")
      .max(5000, "Long description must not exceed 5000 characters"),

    howToUse: Yup.string()
      .trim()
      .required("How to use is required")
      .max(2000, "How to use must not exceed 2000 characters"),
  });

  // ==============================
  // API RESPONSE HANDLER
  // ==============================

  const getResponseData = (response) => {
    if (response?.data?.status !== undefined) {
      return response.data;
    }

    return response;
  };

  // ==============================
  // FETCH PRODUCTS
  // ==============================

  const getProducts = async (basics = null) => {
    try {
      const response = await makeApiRequest({
        url: "getproduct",
        method: "GET",
      });

      const result = getResponseData(response);

      const productList = Array.isArray(result?.data)
        ? result.data
        : Array.isArray(result)
          ? result
          : [];

      setProducts(productList);

      // WIZARD: Automatically select product from URL
      if (isWizard && productId) {
        const product = productList.find(
          (item) => String(item._id) === String(productId)
        );

        if (!product) {
          toast.error("Product not found");
          return;
        }

        setSelectedProduct(product);

        const generatedSlug = product.name
          ? product.name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")
          : "";

        setFormData((prev) => ({
          ...prev,
          productId: String(product._id),
          slug: prev.slug || generatedSlug,
        }));
      }

      // STANDALONE EDIT: Select existing parent product
      if (isEdit && basics) {
        const parentValue = basics.productId ?? basics.product;

        const parentId =
          typeof parentValue === "object"
            ? parentValue?._id
            : parentValue;

        const populatedParent =
          typeof parentValue === "object"
            ? parentValue
            : null;

        const parent =
          productList.find(
            (item) => String(item._id) === String(parentId)
          ) || populatedParent;

        setSelectedProduct(parent || null);
      }
    } catch (error) {
      console.error("GET PRODUCTS ERROR:", error);

      toast.error(
        error?.response?.data?.message ||
        "Failed to fetch products"
      );
    }
  };

  // ==============================
  // PRODUCT SELECTION
  // ==============================

  const handleProductChange = (e) => {
    const selectedId = e.target.value;

    const product = products.find(
      (item) => String(item._id) === String(selectedId)
    );

    const generatedSlug = product?.name
      ? product.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
      : "";

    const updatedFormData = {
      ...formData,
      productId: selectedId,
      slug: formData.slug || generatedSlug,
    };

    setSelectedProduct(product || null);
    setFormData(updatedFormData);

    if (!isEdit && !isWizard) {
      try {
        validationSchema.validateSyncAt(
          "productId",
          updatedFormData
        );

        setErrors((prev) => ({
          ...prev,
          productId: "",
        }));
      } catch (error) {
        setErrors((prev) => ({
          ...prev,
          productId: error.message,
        }));
      }
    }
  };

  // ==============================
  // HANDLE INPUT CHANGE
  // ==============================

  const handleChange = (e) => {
    const { name, value } = e.target;

    const updatedFormData = {
      ...formData,
      [name]: value,
    };

    setFormData(updatedFormData);

    try {
      validationSchema.validateSyncAt(
        name,
        updatedFormData
      );

      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        [name]: error.message,
      }));
    }
  };

  // ==============================
  // HANDLE FIELD BLUR
  // ==============================

  const handleBlur = (e) => {
    const { name, value } = e.target;

    if (isEdit && name === "productId") {
      return;
    }

    try {
      validationSchema.validateSyncAt(name, {
        ...formData,
        [name]: value,
      });

      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        [name]: error.message,
      }));
    }
  };

  // ==============================
  // FETCH SINGLE PRODUCT BASICS
  // ==============================

  const getSingleProduct = async () => {
    try {
      const response = await makeApiRequest({
        url: `getproduct-basics/${id}`,
        method: "GET",
      });

      console.log("SINGLE PRODUCT BASICS RESPONSE:", response);

      const result = getResponseData(response);
      const basics = result?.data;

      if (!result?.status || !basics?._id) {
        toast.error(
          result?.message || "Product basics not found"
        );
        return null;
      }

      const parentValue = basics.productId ?? basics.product;

      const parentId =
        typeof parentValue === "object"
          ? parentValue?._id
          : parentValue;

      setFormData({
        productId: parentId ? String(parentId) : "",
        slug: basics.slug || "",
        brandLine: basics.brandLine || "",
        collections: Array.isArray(basics.collections)
          ? basics.collections.join(", ")
          : basics.collections || "",
        shortDescription: basics.shortDescription || "",
        longDescription: basics.longDescription || "",
        howToUse: basics.howToUse || "",
      });

      if (parentValue && typeof parentValue === "object") {
        setSelectedProduct(parentValue);
      }

      setErrors({});

      return basics;
    } catch (error) {
      console.error("GET SINGLE PRODUCT BASICS ERROR:", error);

      toast.error(
        error?.response?.data?.message ||
        "Failed to fetch product basics"
      );

      return null;
    }
  };

  // ==============================
  // INITIAL LOAD
  // ==============================

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        let basics = null;

        if (isEdit) {
          basics = await getSingleProduct();
        }

        await getProducts(basics);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, productId]);

  // ==============================
  // FORM VALIDATION
  // ==============================

  const validateForm = () => {
    try {
      validationSchema.validateSync(formData, {
        abortEarly: false,
      });

      setErrors({});
      return true;
    } catch (error) {
      const validationErrors = {};

      if (error.inner?.length) {
        error.inner.forEach((item) => {
          if (item.path && !validationErrors[item.path]) {
            validationErrors[item.path] = item.message;
          }
        });
      } else if (error.path) {
        validationErrors[error.path] = error.message;
      }

      setErrors(validationErrors);
      return false;
    }
  };

  // ==============================
  // HANDLE SUBMIT
  // ==============================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    if (!validateForm()) {
      toast.error("Please fill all required fields correctly");
      return;
    }

    const payload = {
      productId: isWizard ? productId : formData.productId,
      slug: formData.slug.trim(),
      brandLine: formData.brandLine.trim(),

      collections: formData.collections
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),

      shortDescription: formData.shortDescription.trim(),
      longDescription: formData.longDescription.trim(),
      howToUse: formData.howToUse.trim(),
    };

    try {
      setSubmitting(true);

      const response = await makeApiRequest({
        url: isEdit
          ? `updateproduct-basics/${id}`
          : "createproduct-basics",

        method: isEdit ? "PUT" : "POST",

        data: payload,
      });

      const result = getResponseData(response);

      if (result?.status) {
        toast.success(
          isEdit
            ? "Product basics updated successfully"
            : "Product basics created successfully"
        );

        if (isWizard && productId) {
          navigate(`/add-product/${productId}/pricing`);
        } else {
          navigate("/product-basics");
        }
      } else {
        toast.error(
          result?.message || "Something went wrong"
        );
      }
    } catch (error) {
      console.error("SAVE PRODUCT BASICS ERROR:", error);

      toast.error(
        error?.response?.data?.message ||
        "Failed to save product basics"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==============================
  // LOADING
  // ==============================

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" />
        <p className="mt-2">Loading product details...</p>
      </div>
    );
  }

  // ==============================
  // MAIN UI
  // ==============================

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>
          {isEdit
            ? "Edit Product Basic Details"
            : "Add Product Basic Details"}
        </h4>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() =>
            navigate(
              isWizard
                ? `/add-product/${productId}/product`
                : "/product-basics"
            )
          }
        >
          Back
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit} noValidate>
            <div className="row">

              {/* SELECT PRODUCT - STANDALONE ONLY */}

              {!isWizard && (
                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    Select Product
                    {!isEdit && (
                      <span className="text-danger"> *</span>
                    )}
                  </label>

                  <select
                    name="productId"
                    className={`form-select ${!isEdit && errors.productId
                      ? "is-invalid"
                      : ""
                      }`}
                    value={formData.productId}
                    onChange={handleProductChange}
                    onBlur={handleBlur}
                    disabled={isEdit}
                  >
                    <option value="">Select Product</option>

                    {products.map((product) => (
                      <option
                        key={product._id}
                        value={product._id}
                      >
                        {product.name} ({product.sku})
                      </option>
                    ))}
                  </select>

                  {!isEdit && errors.productId && (
                    <div className="invalid-feedback">
                      {errors.productId}
                    </div>
                  )}

                  {isEdit && (
                    <small className="text-muted">
                      Parent product cannot be changed while editing.
                    </small>
                  )}
                </div>
              )}

              {/* EXISTING PRODUCT DETAILS */}

              {selectedProduct && (
                <>
                  <div className="col-12 mb-2">
                    <h6 className="text-primary">
                      Existing Product Details
                    </h6>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Product Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={selectedProduct.name || ""}
                      readOnly
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Product Type</label>
                    <input
                      type="text"
                      className="form-control"
                      value={selectedProduct.type || ""}
                      readOnly
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Category</label>
                    <input
                      type="text"
                      className="form-control"
                      value={selectedProduct.category || ""}
                      readOnly
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Price</label>
                    <input
                      type="text"
                      className="form-control"
                      value={selectedProduct.price ?? ""}
                      readOnly
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Stock</label>
                    <input
                      type="text"
                      className="form-control"
                      value={selectedProduct.stock ?? ""}
                      readOnly
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Status</label>
                    <input
                      type="text"
                      className="form-control"
                      value={selectedProduct.status || ""}
                      readOnly
                    />
                  </div>
                </>
              )}

              <div className="col-12 mt-2 mb-2">
                <h6 className="text-primary">
                  Product Basic Information
                </h6>
              </div>

              {/* SLUG */}

              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Slug <span className="text-danger">*</span>
                </label>

                <input
                  type="text"
                  name="slug"
                  className={`form-control ${errors.slug ? "is-invalid" : ""
                    }`}
                  placeholder="Enter product slug"
                  value={formData.slug}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />

                {errors.slug && (
                  <div className="invalid-feedback">
                    {errors.slug}
                  </div>
                )}

                <small className="text-muted">
                  Leave empty to generate automatically from product name.
                </small>
              </div>

              {/* BRAND LINE */}

              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Brand Line <span className="text-danger">*</span>
                </label>

                <input
                  type="text"
                  name="brandLine"
                  className={`form-control ${errors.brandLine ? "is-invalid" : ""
                    }`}
                  placeholder="Enter brand line"
                  value={formData.brandLine}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />

                {errors.brandLine && (
                  <div className="invalid-feedback">
                    {errors.brandLine}
                  </div>
                )}
              </div>

              {/* COLLECTIONS */}

              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Collections <span className="text-danger">*</span>
                </label>

                <input
                  type="text"
                  name="collections"
                  className={`form-control ${errors.collections ? "is-invalid" : ""
                    }`}
                  placeholder="Daily Care, Face Care, Premium"
                  value={formData.collections}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />

                {errors.collections && (
                  <div className="invalid-feedback">
                    {errors.collections}
                  </div>
                )}

                <small className="text-muted">
                  Separate multiple collections with commas.
                </small>
              </div>

              {/* SHORT DESCRIPTION */}

              <div className="col-md-12 mb-3">
                <label className="form-label">
                  Short Description <span className="text-danger">*</span>
                </label>

                <textarea
                  name="shortDescription"
                  className={`form-control ${errors.shortDescription ? "is-invalid" : ""
                    }`}
                  rows="3"
                  placeholder="Enter short description"
                  value={formData.shortDescription}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />

                {errors.shortDescription && (
                  <div className="invalid-feedback">
                    {errors.shortDescription}
                  </div>
                )}
              </div>

              {/* LONG DESCRIPTION */}

              <div className="col-md-12 mb-3">
                <label className="form-label">
                  Long Description <span className="text-danger">*</span>
                </label>

                <textarea
                  name="longDescription"
                  className={`form-control ${errors.longDescription ? "is-invalid" : ""
                    }`}
                  rows="5"
                  placeholder="Enter long description"
                  value={formData.longDescription}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />

                {errors.longDescription && (
                  <div className="invalid-feedback">
                    {errors.longDescription}
                  </div>
                )}
              </div>

              {/* HOW TO USE */}

              <div className="col-md-12 mb-3">
                <label className="form-label">
                  How To Use <span className="text-danger">*</span>
                </label>

                <textarea
                  name="howToUse"
                  className={`form-control ${errors.howToUse ? "is-invalid" : ""
                    }`}
                  rows="3"
                  placeholder="Enter product usage instructions"
                  value={formData.howToUse}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />

                {errors.howToUse && (
                  <div className="invalid-feedback">
                    {errors.howToUse}
                  </div>
                )}
              </div>
            </div>

            {/* BUTTONS */}

            <div className="d-flex justify-content-end gap-2 mt-3">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() =>
                  navigate(
                    isWizard
                      ? `/add-product/${productId}/product`
                      : "/product-basics"
                  )
                }
                disabled={submitting}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting
                  ? "Saving..."
                  : isWizard
                    ? "Save & Next"
                    : isEdit
                      ? "Update Product"
                      : "Create Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddEditBasic;
