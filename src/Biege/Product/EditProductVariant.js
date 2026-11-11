
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { makeApiRequest } from "../../AxiosServices/apiCall";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSave } from "@fortawesome/free-solid-svg-icons";

function EditProductVariant() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    product: "",
    variantType: "",
    variantName: "",
    sku: "",
    price: "",
    stock: 0,
    barcode: "",
  });

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // GET PRODUCTS
  const getProducts = async () => {
    try {
      const result = await makeApiRequest({
        url: "getproduct",
        method: "GET",
      });

      if (result?.status && Array.isArray(result.data)) {
        setProducts(result.data);
      }
    } catch (error) {
      console.log("Get products error:", error);
      toast.error("Failed to fetch products");
    }
  };

  // GET SINGLE VARIANT
  const getVariant = async () => {
    try {
      setLoading(true);

      const result = await makeApiRequest({
        url: `getproduct-variant/${id}`,
        method: "GET",
      });

      if (result?.status && result.data) {
        const variant = result.data;

        setFormData({
          product: variant.product?._id || variant.product || "",
          variantType: variant.variantType || "",
          variantName: variant.variantName || "",
          sku: variant.sku || "",
          price: variant.price ?? "",
          stock: variant.stock ?? 0,
          barcode: variant.barcode || "",
        });
      } else {
        toast.error(result?.message || "Variant not found");
        navigate("/product-variants");
      }
    } catch (error) {
      console.log("Get variant error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to fetch variant"
      );
      navigate("/product-variants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProducts();
    getVariant();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // UPDATE VARIANT
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.product ||
      !formData.variantType ||
      !formData.variantName.trim() ||
      !formData.sku.trim() ||
      formData.price === ""
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setSubmitting(true);

      const result = await makeApiRequest({
        url: `updateproduct-variant/${id}`,
        method: "PUT",
        data: {
          ...formData,
          sku: formData.sku.trim().toUpperCase(),
          variantName: formData.variantName.trim(),
          price: Number(formData.price),
          stock: Number(formData.stock || 0),
        },
      });

      if (result?.status) {
        toast.success(result.message || "Variant updated successfully");
        navigate("/product-variants");
      } else {
        toast.error(result?.message || "Failed to update variant");
      }
    } catch (error) {
      console.log("Update variant error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to update variant"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid py-4 text-center">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-2">Loading variant...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Edit Product Variant</h4>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate("/product-variants")}
        >
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          Back
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Product <span className="text-danger">*</span>
                </label>

                <select
                  name="product"
                  className="form-select"
                  value={formData.product}
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

              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Variant Type <span className="text-danger">*</span>
                </label>

                <select
                  name="variantType"
                  className="form-select"
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

              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Variant Name <span className="text-danger">*</span>
                </label>

                <input
                  type="text"
                  name="variantName"
                  className="form-control"
                  placeholder="Enter variant name"
                  value={formData.variantName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">
                  SKU <span className="text-danger">*</span>
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

              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Price <span className="text-danger">*</span>
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

              <div className="col-md-6 mb-3">
                <label className="form-label">Stock</label>

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

              <div className="col-md-6 mb-3">
                <label className="form-label">Barcode</label>

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

            <div className="d-flex justify-content-end gap-2 mt-3">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate("/product-variants")}
                disabled={submitting}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                <FontAwesomeIcon icon={faSave} className="me-2" />
                {submitting ? "Updating..." : "Update Variant"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditProductVariant;
