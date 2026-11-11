
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { makeApiRequest } from "../../AxiosServices/apiCall";
import { toast } from "react-toastify";

function AddEditBasic() {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = Boolean(id);
  console.log("Current URL:", window.location.pathname);
  console.log("Product ID:", id);
  console.log("Edit Mode:", isEdit);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    type: "SKIN_CARE",
    brandLine: "",
    category: "",
    collections: "",
    shortDescription: "",
    longDescription: "",
    howToUse: "",
    status: "DRAFT",
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Fetch single product for editing
  // Fetch single product for editing
  const getSingleProduct = async () => {
    try {
      setLoading(true);

      const response = await makeApiRequest({
        url: `getproduct-basics/${id}`,
        method: "GET",
      });

      console.log("SINGLE PRODUCT API RESPONSE:", response);

      const result = response?.data.data || response;

      console.log("SINGLE PRODUCT RESULT:", result);

      if (result?.status && result.data) {
        const product = result.data;

        setFormData({
          name: product.name || "",
          slug: product.slug || "",
          type: product.type || "SKIN_CARE",
          brandLine: product.brandLine || "",
          category: product.category || "",
          collections: Array.isArray(product.collections)
            ? product.collections.join(", ")
            : "",
          shortDescription: product.shortDescription || "",
          longDescription: product.longDescription || "",
          howToUse: product.howToUse || "",
          status: product.status || "DRAFT",
        });
      } else {
        console.error("Product API returned unsuccessful response:", result);
        toast.error(result?.message || "Product not found");
      }
    } catch (error) {
      console.error("GET SINGLE PRODUCT ERROR:", error);
      console.error("API ERROR RESPONSE:", error?.response?.data);

      toast.error(
        error?.response?.data?.message || "Failed to fetch product"
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (isEdit) {
      getSingleProduct();
    }
  }, [id]);

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Product name is required");
      return;
    }

    if (!formData.type) {
      toast.error("Product type is required");
      return;
    }

    const payload = {
      ...formData,
      collections: formData.collections
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
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

      const result = response?.data || response;

      if (result?.status) {
        toast.success(
          isEdit
            ? "Product updated successfully"
            : "Product created successfully"
        );

        navigate("/view-product");
      } else {
        toast.error(result?.message || "Something went wrong");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to save product"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" />
        <p className="mt-2">Loading product details...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>
          {isEdit ? "Edit Product Basic Details" : "Add Product Basic Details"}
        </h4>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate("/product-basics")}
        >
          Back
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">

              {/* Product Name */}
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Product Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="Enter product name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Slug */}
              <div className="col-md-6 mb-3">
                <label className="form-label">Slug</label>
                <input
                  type="text"
                  name="slug"
                  className="form-control"
                  placeholder="Enter product slug (optional)"
                  value={formData.slug}
                  onChange={handleChange}
                />
                <small className="text-muted">
                  Leave empty to generate automatically from product name.
                </small>
              </div>

              {/* Type */}
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Product Type <span className="text-danger">*</span>
                </label>
                <select
                  name="type"
                  className="form-select"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="SKIN_CARE">Skin Care</option>
                  <option value="BEAUTY">Beauty</option>
                </select>
              </div>

              {/* Brand Line */}
              <div className="col-md-6 mb-3">
                <label className="form-label">Brand Line</label>
                <input
                  type="text"
                  name="brandLine"
                  className="form-control"
                  placeholder="Enter brand line"
                  value={formData.brandLine}
                  onChange={handleChange}
                />
              </div>

              {/* Category */}
              <div className="col-md-6 mb-3">
                <label className="form-label">Category</label>
                <input
                  type="text"
                  name="category"
                  className="form-control"
                  placeholder="Enter category"
                  value={formData.category}
                  onChange={handleChange}
                />
              </div>

              {/* Collections */}
              <div className="col-md-6 mb-3">
                <label className="form-label">Collections</label>
                <input
                  type="text"
                  name="collections"
                  className="form-control"
                  placeholder="Daily Care, Face Care, Premium"
                  value={formData.collections}
                  onChange={handleChange}
                />
                <small className="text-muted">
                  Separate multiple collections with commas.
                </small>
              </div>

              {/* Short Description */}
              <div className="col-md-12 mb-3">
                <label className="form-label">Short Description</label>
                <textarea
                  name="shortDescription"
                  className="form-control"
                  rows="3"
                  placeholder="Enter short description"
                  value={formData.shortDescription}
                  onChange={handleChange}
                />
              </div>

              {/* Long Description */}
              <div className="col-md-12 mb-3">
                <label className="form-label">Long Description</label>
                <textarea
                  name="longDescription"
                  className="form-control"
                  rows="5"
                  placeholder="Enter long description"
                  value={formData.longDescription}
                  onChange={handleChange}
                />
              </div>

              {/* How To Use */}
              <div className="col-md-12 mb-3">
                <label className="form-label">How To Use</label>
                <textarea
                  name="howToUse"
                  className="form-control"
                  rows="3"
                  placeholder="Enter product usage instructions"
                  value={formData.howToUse}
                  onChange={handleChange}
                />
              </div>

              {/* Status */}
              <div className="col-md-6 mb-3">
                <label className="form-label">Status</label>
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

            </div>

            <div className="d-flex justify-content-end gap-2 mt-3">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate("/view-product")}
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
