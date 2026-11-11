
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { makeApiRequest } from "../../AxiosServices/apiCall";

const initialValues = {
  productId: "",
  mrp: "",
  sellingPrice: "",
  gstRate: "",
  hsnCode: "",
  costPrice: "",
};

function CreateProductPricing() {
  console.log("CreateProductPricing COMPONENT MOUNTED");
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialValues);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  console.log('products---------', products)
  // Get all products


  const getAllProducts = async () => {
    try {
      setLoading(true);

      const result = await makeApiRequest({
        url: "getproduct",
        method: "GET",
      });

      console.log("GET PRODUCT RESPONSE:", result);
      console.log("RESPONSE STATUS:", result?.status);
      console.log("PRODUCT DATA:", result?.data);

      if (result?.status === true && Array.isArray(result.data)) {
        setProducts(result.data);
      } else {
        setProducts([]);
        toast.error(result?.message || "Products not found");
      }
    } catch (error) {
      console.error("GET PRODUCT ERROR:", error);
      console.log("ERROR STATUS:", error?.response?.status);
      console.log("ERROR RESPONSE:", error?.response?.data);

      toast.error(
        error?.response?.data?.message || "Failed to fetch products"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("CreateProductPricing useEffect RUNNING");
    getAllProducts();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Validate form
  const validateForm = () => {
    if (!formData.productId) {
      toast.error("Please select a product");
      return false;
    }

    if (
      formData.mrp === "" ||
      formData.sellingPrice === "" ||
      formData.gstRate === "" ||
      formData.costPrice === "" ||
      !formData.hsnCode.trim()
    ) {
      toast.error("Please fill all required fields");
      return false;
    }

    const mrp = Number(formData.mrp);
    const sellingPrice = Number(formData.sellingPrice);
    const gstRate = Number(formData.gstRate);
    const costPrice = Number(formData.costPrice);

    if (
      ![mrp, sellingPrice, gstRate, costPrice].every(
        Number.isFinite
      )
    ) {
      toast.error("Please enter valid numeric values");
      return false;
    }

    if (
      mrp < 0 ||
      sellingPrice < 0 ||
      costPrice < 0
    ) {
      toast.error("Price cannot be negative");
      return false;
    }

    if (gstRate < 0 || gstRate > 100) {
      toast.error("GST rate must be between 0 and 100");
      return false;
    }

    return true;
  };

  // Create product pricing
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const payload = {
        productId: formData.productId,
        mrp: Number(formData.mrp),
        sellingPrice: Number(formData.sellingPrice),
        gstRate: Number(formData.gstRate),
        hsnCode: formData.hsnCode.trim(),
        costPrice: Number(formData.costPrice),
      };

      const response = await makeApiRequest({
        url: "createproduct-pricing",
        method: "POST",
        data: payload,
      });

      const result = response?.data ?? response;

      if (result?.status) {
        toast.success(
          result.message ||
          "Product pricing created successfully"
        );

        setFormData(initialValues);

        navigate("/dashboard/product-pricing");
      } else {
        toast.error(
          result?.message || "Failed to create product pricing"
        );
      }
    } catch (error) {
      console.log("Create pricing error:", error);

      toast.error(
        error?.response?.data?.message ||
        "Something went wrong"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-fluid py-3">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Create Product Pricing</h4>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </div>

      {/* Create Form */}
      <div className="card shadow-sm">

        <div className="card-header bg-white">
          <h5 className="mb-0">Pricing Details</h5>
        </div>

        <div className="card-body">

          <form onSubmit={handleSubmit}>
            <div className="row">

              {/* Product */}
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Select Product <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select"
                  name="productId"
                  value={formData.productId}
                  onChange={handleChange}
                  disabled={loading || submitting}
                  required
                >
                  <option value="">
                    {loading ? "Loading products..." : "Select Product"}
                  </option>

                  {products.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name}
                    </option>
                  ))}
                </select>

                {!loading && products.length === 0 && (
                  <small className="text-danger">
                    No products available
                  </small>
                )}
              </div>

              {/* MRP */}
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  MRP (₹) <span className="text-danger">*</span>
                </label>

                <input
                  type="number"
                  className="form-control"
                  name="mrp"
                  placeholder="Enter MRP"
                  min="0"
                  step="0.01"
                  value={formData.mrp}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Selling Price */}
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Selling Price (₹) <span className="text-danger">*</span>
                </label>

                <input
                  type="number"
                  className="form-control"
                  name="sellingPrice"
                  placeholder="Enter Selling Price"
                  min="0"
                  step="0.01"
                  value={formData.sellingPrice}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* GST Rate */}
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  GST Rate (%) <span className="text-danger">*</span>
                </label>

                <input
                  type="number"
                  className="form-control"
                  name="gstRate"
                  placeholder="Enter GST Rate"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.gstRate}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* HSN Code */}
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  HSN Code <span className="text-danger">*</span>
                </label>

                <input
                  type="text"
                  className="form-control"
                  name="hsnCode"
                  placeholder="Enter HSN Code"
                  value={formData.hsnCode}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Cost Price */}
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Cost Price (₹) <span className="text-danger">*</span>
                </label>

                <input
                  type="number"
                  className="form-control"
                  name="costPrice"
                  placeholder="Enter Cost Price"
                  min="0"
                  step="0.01"
                  value={formData.costPrice}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>

            {/* Buttons */}
            <div className="d-flex gap-2 mt-3">

              <button
                type="submit"
                className="btn btn-success"
                disabled={submitting || loading}
              >
                {submitting ? "Creating..." : "Create Pricing"}
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate(-1)}
                disabled={submitting}
              >
                Cancel
              </button>

            </div>
          </form>

        </div>
      </div>
    </div>
  );
}

export default CreateProductPricing;
