import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { makeApiRequest } from "../../AxiosServices/apiCall";

const initialValues = {
  name: "",
  image: "",
  sku: "",
  category: "",
  type: "",
  price: "",
  stock: "",
  status: "DRAFT",
};

function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState(initialValues);
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  // Get product details by ID

  const getProductById = useCallback(async () => {
    try {
      setFetchLoading(true);

      const response = await makeApiRequest({
        url: `/getproduct/${id}`,
        method: "GET",
      });

      if (!response?.status) {
        toast.error(response?.message || "Failed to fetch product");
        return;
      }

      // Supports either { data: product } or { data: [products] }

      const product = Array.isArray(response.data)
        ? response.data[0]
        : response.data || response.product;

      if (!product) {
        toast.error("Product details not found");
        return;
      }

      setFormData({
        name: product.name || "",
        image: product.image || "",
        sku: product.sku || "",
        category: product.category || "",
        type: product.type || "",
        price: product.price ?? "",
        stock: product.stock ?? "",
        status: product.status || "DRAFT",
      });

      setPreviewImage(product.image || "");
    } catch (error) {
      console.error("Get product error:", error);

      toast.error(
        error.response?.data?.message ||
        "Unable to fetch product details"
      );
    } finally {
      setFetchLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) {
      setFetchLoading(false);
      toast.error("Invalid product ID");
      return;
    }

    getProductById();
  }, [id, getProductById]);

  // Handle input changes

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

  // Handle image file selection

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should not exceed 5MB");
      e.target.value = "";
      return;
    }

    setImageFile(file);
    setPreviewImage(URL.createObjectURL(file));

    setErrors((prev) => ({
      ...prev,
      image: "",
    }));
  };

  // Form validation

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

  // Update product

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please check the required fields");
      return;
    }

    try {
      setLoading(true);

      let response;

      const payload = {
        name: formData.name.trim(),
        sku: formData.sku.trim().toUpperCase(),
        category: formData.category.trim(),
        type: formData.type,
        price: Number(formData.price),
        stock: Number(formData.stock),
        status: formData.status,
      };

      if (imageFile) {
        // Image changed: upload using multipart/form-data
        const formDataToSend = new FormData();

        Object.entries(payload).forEach(([key, value]) => {
          formDataToSend.append(key, value);
        });

        formDataToSend.append("image", imageFile);

        response = await makeApiRequest({
          url: `/updateproduct/${id}`,
          method: "PUT",
          data: formDataToSend,
          header: "image",
        });
      } else {
        // Image not changed: send existing image URL
        response = await makeApiRequest({
          url: `/updateproduct/${id}`,
          method: "PUT",
          data: {
            ...payload,
            image: formData.image,
          },
        });
      }

      if (response?.status) {
        toast.success(response.message || "Product updated successfully");

        navigate("/view-product");
      } else {
        toast.error(response?.message || "Failed to update product");
      }
    } catch (error) {
      console.error("Update product error:", error);

      toast.error(
        error.response?.data?.message ||
        "Something went wrong while updating product"
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="container-fluid py-5 text-center">
        <div className="spinner-border text-primary"></div>
        <p className="text-muted mt-2">Loading product details...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Edit Product</h4>
          <p className="text-muted mb-0">
            Update your product information
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => navigate(-1)}
          disabled={loading}
        >
          <i className="fa-solid fa-arrow-left me-2"></i>
          Back
        </button>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <form onSubmit={handleSubmit} noValidate>
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
                  type="file"
                  name="image"
                  accept="image/*"
                  className={`form-control ${errors.image ? "is-invalid" : ""
                    }`}
                  onChange={handleImageChange}
                />

                {errors.image && (
                  <div className="invalid-feedback">{errors.image}</div>
                )}

                {previewImage && (
                  <div className="mt-3">
                    <img
                      src={previewImage}
                      alt="Product preview"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                      style={{
                        width: "120px",
                        height: "120px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                      }}
                    />
                  </div>
                )}

                <small className="text-muted">
                  Leave unchanged to keep the existing image. Maximum size: 5MB.
                </small>
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

              {/* Type */}
              
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
                  placeholder="Enter price"
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
                  placeholder="Enter stock"
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
                  className={`form-select ${errors.status ? "is-invalid" : ""
                    }`}
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                  <option value="ARCHIVED">Archived</option>
                </select>

                {errors.status && (
                  <div className="invalid-feedback">{errors.status}</div>
                )}
              </div>

              {/* Submit */}
              <div className="col-12">
                <hr />

                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-light border px-4"
                    onClick={() => navigate(-1)}
                    disabled={loading}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary px-4"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Updating...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-floppy-disk me-2"></i>
                        Update Product
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

export default EditProduct;