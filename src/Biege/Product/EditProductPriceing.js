
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

function EditProductPriceing() {
  const navigate = useNavigate();
  const { productId } = useParams();

  const [formData, setFormData] = useState(initialValues);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Get all products
  const getAllProducts = async () => {
    try {
      const response = await makeApiRequest({
        url: "/admin/getproduct",
        method: "GET",
      });

      const result = response?.data ?? response;

      if (result?.status) {
        setProducts(
          Array.isArray(result.data) ? result.data : []
        );
      }
    } catch (error) {
      console.log("Get products error:", error);
      toast.error("Failed to fetch products");
    }
  };

  // Get existing product pricing
  const getProductPricing = async () => {
    try {
      setLoading(true);

      const response = await makeApiRequest({
        url: "/getpricing",
        method: "POST",
        data: {
          productId,
        },
      });

      const result = response?.data ?? response;

      if (result?.status) {
        const pricing = result.data;

        setFormData({
          productId: pricing.product?._id || productId,
          mrp: pricing.mrp ?? "",
          sellingPrice: pricing.sellingPrice ?? "",
          gstRate: pricing.gstRate ?? "",
          hsnCode: pricing.hsnCode ?? "",
          costPrice: pricing.costPrice ?? "",
        });
      } else {
        toast.error(
          result?.message || "Product pricing not found"
        );
        navigate(-1);
      }
    } catch (error) {
      console.log("Get pricing error:", error);

      toast.error(
        error?.response?.data?.message ||
        "Failed to fetch product pricing"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      getAllProducts();
      getProductPricing();
    }
  }, [productId]);

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
    if (
      !formData.mrp.toString().trim() ||
      !formData.sellingPrice.toString().trim() ||
      !formData.gstRate.toString().trim() ||
      !formData.costPrice.toString().trim() ||
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
      toast.error("Prices cannot be negative");
      return false;
    }

    if (gstRate < 0 || gstRate > 100) {
      toast.error("GST must be between 0 and 100");
      return false;
    }

    return true;
  };

  // Update product pricing
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
        url: "/admin/updateproductpricing",
        method: "PUT",
        data: payload,
      });

      const result = response?.data ?? response;

      if (result?.status) {
        toast.success(
          result.message ||
          "Product pricing updated successfully"
        );

        navigate("/dashboard/product-pricing");
      } else {
        toast.error(
          result?.message || "Failed to update pricing"
        );
      }
    } catch (error) {
      console.log("Update pricing error:", error);

      toast.error(
        error?.response?.data?.message ||
        "Something went wrong"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const selectedProduct = products.find(
    (item) => item._id === formData.productId
  );

  return (
    <div className="container-fluid py-3">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Edit Product Pricing</h4>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          Loading product pricing...
        </div>
      ) : (
        <div className="card shadow-sm">
          <div className="card-header bg-white">
            <h5 className="mb-0">Update Pricing Details</h5>
          </div>

          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">

                {/* Product */}
                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    Product
                  </label>

                  <select
                    className="form-select"
                    value={formData.productId}
                    disabled
                  >
                    <option value="">
                      Select Product
                    </option>

                    {products.map((item) => (
                      <option
                        key={item._id}
                        value={item._id}
                      >
                        {item.name}
                      </option>
                    ))}
                  </select>

                  <small className="text-muted">
                    Product cannot be changed while editing pricing.
                  </small>

                  {selectedProduct && (
                    <div className="mt-1 text-muted">
                      SKU: {selectedProduct.sku || "-"}
                    </div>
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

                {/* GST */}
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
                  {submitting ? "Updating..." : "Update Pricing"}
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
      )}
    </div>
  );
}

export default EditProductPriceing;
