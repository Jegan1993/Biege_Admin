
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { makeApiRequest } from "../../AxiosServices/apiCall";

const initialValues = {
  name: "",
  image: null,
  sku: "",
  category: "",
  type: "",
  price: "",
  stock: "",
  status: "DRAFT",
};

function CreateProduct() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  // Create and clean up image preview URL
  useEffect(() => {
    if (!formData.image) {
      setImagePreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(formData.image);
    setImagePreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [formData.image]);

  // Handle normal input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        image: "Please select a valid image file",
      }));
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        image: "Image size must be less than 5 MB",
      }));
      e.target.value = "";
      return;
    }

    setFormData((prev) => ({
      ...prev,
      image: file,
    }));

    setErrors((prev) => ({
      ...prev,
      image: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }

    if (!formData.sku.trim()) {
      newErrors.sku = "SKU is required";
    }

    if (!formData.category.trim()) {
      newErrors.category = "Category is required";
    }

    if (!formData.type) {
      newErrors.type = "Please select product type";
    }

    if (
      formData.price === "" ||
      !Number.isFinite(Number(formData.price)) ||
      Number(formData.price) < 0
    ) {
      newErrors.price = "Enter a valid price";
    }

    if (
      formData.stock === "" ||
      !Number.isInteger(Number(formData.stock)) ||
      Number(formData.stock) < 0
    ) {
      newErrors.stock = "Enter a valid stock quantity";
    }

    if (!formData.status) {
      newErrors.status = "Please select product status";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData(initialValues);
    setErrors({});

    const fileInput = document.getElementById("productImage");
    if (fileInput) fileInput.value = "";
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      const payload = new FormData();

      payload.append("name", formData.name);
      payload.append("sku", formData.sku);
      payload.append("category", formData.category);
      payload.append("type", formData.type);
      payload.append("price", formData.price);
      payload.append("stock", formData.stock);
      payload.append("status", formData.status);

      if (formData.image) {
        payload.append("image", formData.image);
      }

      const response = await makeApiRequest({
        url: "/createproduct",
        method: "POST",
        data: payload,
        header: "image",
      });

      if (response.status) {
        const createdProduct =
          response?.data?.data ||
          response?.data ||
          response;

        const productId = createdProduct?._id;

        if (!productId) {
          toast.error("Product created, but product ID was not received");
          return;
        }

        toast.success(
          response.message || "Product created successfully"
        );

        navigate(`/add-product/${productId}/basic`);
      } else {
        toast.error(response.message || "Failed to create product");
      }
    } catch (error) {
      console.error("Create product error:", error);

      toast.error(
        error.response?.data?.message ||
        "Something went wrong while creating product"
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Create Product</h4>
          <p className="text-muted mb-0">
            Add a new product to your store
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => navigate(-1)}
        >
          <i className="fa-solid fa-arrow-left me-2"></i>
          Back
        </button>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            <div className="row g-4">
              {/* Product Name */}
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Product Name <span className="text-danger">*</span>
                </label>

                <input
                  type="text"
                  name="name"
                  className={`form-control ${errors.name ? "is-invalid" : ""
                    }`}
                  placeholder="Enter product name"
                  value={formData.name}
                  onChange={handleChange}
                />

                {errors.name && (
                  <div className="invalid-feedback">{errors.name}</div>
                )}
              </div>

              {/* SKU */}
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  SKU <span className="text-danger">*</span>
                </label>

                <input
                  type="text"
                  name="sku"
                  className={`form-control ${errors.sku ? "is-invalid" : ""
                    }`}
                  placeholder="Enter product SKU"
                  value={formData.sku}
                  onChange={handleChange}
                />

                {errors.sku && (
                  <div className="invalid-feedback">{errors.sku}</div>
                )}
              </div>

              {/* Product Image */}
              <div className="col-md-12">
                <label className="form-label fw-semibold">
                  Product Image
                </label>

                <input
                  id="productImage"
                  type="file"
                  name="image"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className={`form-control ${errors.image ? "is-invalid" : ""
                    }`}
                  onChange={handleImageChange}
                />

                <small className="text-muted">
                  Allowed: JPG, JPEG, PNG, WEBP. Maximum size: 5 MB.
                </small>

                {errors.image && (
                  <div className="text-danger small mt-1">
                    {errors.image}
                  </div>
                )}

                {imagePreview && (
                  <div className="mt-3">
                    <img
                      src={imagePreview}
                      alt="Product preview"
                      style={{
                        width: "120px",
                        height: "120px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                      }}
                    />

                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger ms-3"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          image: null,
                        }));

                        const fileInput =
                          document.getElementById("productImage");

                        if (fileInput) fileInput.value = "";
                      }}
                    >
                      Remove Image
                    </button>
                  </div>
                )}
              </div>

              {/* Category */}
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Category <span className="text-danger">*</span>
                </label>

                <input
                  type="text"
                  name="category"
                  className={`form-control ${errors.category ? "is-invalid" : ""
                    }`}
                  placeholder="Enter category"
                  value={formData.category}
                  onChange={handleChange}
                />

                {errors.category && (
                  <div className="invalid-feedback">
                    {errors.category}
                  </div>
                )}
              </div>

              {/* Product Type */}
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Product Type <span className="text-danger">*</span>
                </label>

                <select
                  name="type"
                  className={`form-select ${errors.type ? "is-invalid" : ""
                    }`}
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="">Select product type</option>
                  <option value="SKIN_CARE">Skin Care</option>
                  <option value="BEAUTY">Beauty</option>
                </select>

                {errors.type && (
                  <div className="invalid-feedback">{errors.type}</div>
                )}
              </div>

              {/* Price */}
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Price (₹) <span className="text-danger">*</span>
                </label>

                <input
                  type="number"
                  name="price"
                  min="0"
                  step="0.01"
                  className={`form-control ${errors.price ? "is-invalid" : ""
                    }`}
                  placeholder="Enter product price"
                  value={formData.price}
                  onChange={handleChange}
                />

                {errors.price && (
                  <div className="invalid-feedback">{errors.price}</div>
                )}
              </div>

              {/* Stock */}
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Stock <span className="text-danger">*</span>
                </label>

                <input
                  type="number"
                  name="stock"
                  min="0"
                  step="1"
                  className={`form-control ${errors.stock ? "is-invalid" : ""
                    }`}
                  placeholder="Enter available stock"
                  value={formData.stock}
                  onChange={handleChange}
                />

                {errors.stock && (
                  <div className="invalid-feedback">{errors.stock}</div>
                )}
              </div>

              {/* Status */}
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Status <span className="text-danger">*</span>
                </label>

                <select
                  name="status"
                  className="form-select"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="col-12">
                <hr />

                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-light border px-4"
                    onClick={resetForm}
                    disabled={loading}
                  >
                    Reset
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary px-4"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Creating...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-plus me-2"></i>
                        Create Product
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateProduct;
