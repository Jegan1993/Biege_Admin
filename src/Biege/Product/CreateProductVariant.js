
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { makeApiRequest } from "../../AxiosServices/apiCall";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSave } from "@fortawesome/free-solid-svg-icons";

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

  const [formData, setFormData] = useState(initialValues);
  const [products, setProducts] = useState([]);
  const [submitting, setSubmitting] = useState(false);

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

  useEffect(() => {
    getProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.productId ||
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
        url: "createproduct-variant",
        method: "POST",
        data: {
          ...formData,
          variantName: formData.variantName.trim(),
          sku: formData.sku.trim().toUpperCase(),
          price: Number(formData.price),
          stock: Number(formData.stock || 0),
        },
      });

      if (result?.status) {
        toast.success(result.message || "Variant created successfully");
        navigate("/product-variants");
      } else {
        toast.error(result?.message || "Failed to create variant");
      }
    } catch (error) {
      console.log("Create variant error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to create variant"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-fluid py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Create Product Variant</h4>

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
                  name="productId"
                  className="form-select"
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
                  placeholder="Example: 50ml, Large, Rose Pink"
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
                {submitting ? "Saving..." : "Create Variant"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateProductVariant;
