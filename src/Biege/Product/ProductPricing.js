
import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { makeApiRequest } from "../../AxiosServices/apiCall";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPenToSquare,
  faTrash,
  faPlus,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";

const initialValues = {
  product: "",
  mrp: "",
  sellingPrice: "",
  gstRate: "",
  hsnCode: "",
  costPrice: "",
};

function ProductPricing() {
  const [pricingList, setPricingList] = useState([]);
  const [products, setProducts] = useState([]);

  const [formData, setFormData] = useState(initialValues);
  const [editId, setEditId] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Get all product pricing
  const getAllProductPricing = async () => {
    try {
      setLoading(true);

      const result = await makeApiRequest({
        url: "getproduct-pricing",
        method: "GET",
      });

      console.log("PRICING API RESULT:", result);

      if (result?.status && Array.isArray(result.data)) {
        setPricingList(result.data);
      } else {
        setPricingList([]);
        toast.error(result?.message || "Failed to fetch pricing");
      }
    } catch (error) {
      console.log("Get pricing error:", error);
      toast.error(
        error?.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };
  // Get all products for dropdown
  // Get all products for dropdown
  const getAllProducts = async () => {
    try {
      const result = await makeApiRequest({
        url: "getproduct",
        method: "GET",
      });

      console.log("PRODUCT API RESULT:", result);

      if (result?.status && Array.isArray(result.data)) {
        setProducts(result.data);
      } else {
        setProducts([]);
        toast.error(result?.message || "Products not found");
      }
    } catch (error) {
      console.log("Get products error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to fetch products"
      );
    }
  };

  useEffect(() => {
    getAllProductPricing();
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

  // Open create form
  const handleAdd = () => {
    setEditId(null);
    setFormData(initialValues);
    setShowForm(true);
  };

  // Open update form
  const handleEdit = (row) => {
    setEditId(row._id);

    setFormData({
      product:
        typeof row.product === "object"
          ? row.product?._id || ""
          : row.product || "",
      mrp: row.mrp ?? "",
      sellingPrice: row.sellingPrice ?? "",
      gstRate: row.gstRate ?? "",
      hsnCode: row.hsnCode ?? "",
      costPrice: row.costPrice ?? "",
    });

    setShowForm(true);
  };
  // Close form
  const handleCancel = () => {
    setShowForm(false);
    setEditId(null);
    setFormData(initialValues);
  };

  // Validate form
  const validateForm = () => {
    if (!formData.product) {
      toast.error("Please select a product");
      return false;
    }

    if (
      formData.mrp === "" ||
      formData.sellingPrice === "" ||
      formData.gstRate === "" ||
      formData.costPrice === ""
    ) {
      toast.error("Please fill all pricing fields");
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
      toast.error("Enter valid numeric values");
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

    if (!formData.hsnCode.trim()) {
      toast.error("Please enter HSN code");
      return false;
    }

    return true;
  };

  // Create / Update pricing
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const payload = {
        productId: formData.product,
        mrp: Number(formData.mrp),
        sellingPrice: Number(formData.sellingPrice),
        gstRate: Number(formData.gstRate),
        hsnCode: formData.hsnCode.trim(),
        costPrice: Number(formData.costPrice),
      };

      const result = await makeApiRequest({
        url: editId
          ? `updateproduct-pricing/${editId}`
          : "createproduct-pricing",
        method: editId ? "PUT" : "POST",
        data: payload,
      });

      if (result?.status) {
        toast.success(
          result.message ||
          (editId
            ? "Pricing updated successfully"
            : "Pricing created successfully")
        );

        handleCancel();
        getAllProductPricing();
      } else {
        toast.error(result?.message || "Operation failed");
      }
    } catch (error) {
      console.log("Save pricing error:", error);

      toast.error(
        error?.response?.data?.message || "Something went wrong"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Delete pricing
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this pricing?")) {
      return;
    }

    try {
      const response = await makeApiRequest({
        url: `/admin/deleteproductpricing/${id}`,
        method: "DELETE",
      });

      const result = response?.data ?? response;

      if (result?.status) {
        toast.success(
          result.message || "Pricing deleted successfully"
        );

        getAllProductPricing();
      } else {
        toast.error(result?.message || "Delete failed");
      }
    } catch (error) {
      console.log("Delete pricing error:", error);

      toast.error(
        error?.response?.data?.message ||
        "Something went wrong"
      );
    }
  };


  // DataTable columns
  const columns = [
    {
      name: "S.No",
      width: "75px",
      cell: (row, index) => index + 1,
    },
    {
      name: "Product Name",
      selector: (row) => row.productDetails?.name || "-",
      sortable: true,
      width: "180px",
    },
    {
      name: "MRP",
      selector: (row) => row.mrp,
      sortable: true,
      cell: (row) => `₹${row.mrp}`,
    },
    {
      name: "Selling Price",
      selector: (row) => row.sellingPrice,
      sortable: true,
      cell: (row) => `₹${row.sellingPrice}`,
    },
    {
      name: "GST (%)",
      selector: (row) => row.gstRate,
      sortable: true,
      cell: (row) => `${row.gstRate}%`,
    },
    {
      name: "HSN Code",
      selector: (row) => row.hsnCode,
      sortable: true,
    },
    {
      name: "Cost Price",
      selector: (row) => row.costPrice,
      sortable: true,
      cell: (row) => `₹${row.costPrice}`,
    },


    {
      name: "Actions",
      width: "130px",
      center: true,
      ignoreRowClick: true,
      allowOverflow: true,
      cell: (row) => (
        <div
          className="pricing-action-buttons"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            width: "100%",
          }}
        >
          {/* Edit Button */}
          <button
            type="button"
            onClick={() => handleEdit(row)}
            title="Edit Pricing"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "32px",
              height: "32px",
              border: "none",
              borderRadius: "4px",
              backgroundColor: "#0d6efd",
              color: "#ffffff",
              cursor: "pointer",
            }}
          >
            <FontAwesomeIcon icon={faPenToSquare} />
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={() => handleDelete(row._id)}
            title="Delete Pricing"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "32px",
              height: "32px",
              border: "none",
              borderRadius: "4px",
              backgroundColor: "#dc3545",
              color: "#ffffff",
              cursor: "pointer",
            }}
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      ),
    },


  ];

  return (
    <div className="container-fluid py-3">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">
          Product Pricing
        </h4>

        {!showForm && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleAdd}
          >
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Add Pricing
          </button>
        )}

        {showForm && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCancel}
          >
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            Back
          </button>
        )}
      </div>

      {/* Create / Update Form */}
      {showForm ? (
        <div className="card shadow-sm">
          <div className="card-header bg-white">
            <h5 className="mb-0">
              {editId ? "Update Product Pricing" : "Create Product Pricing"}
            </h5>
          </div>

          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">

                {/* Product */}
                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    Product <span className="text-danger">*</span>
                  </label>

                  <select
                    className="form-select"
                    name="product"
                    value={formData.product}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Product</option>

                    {products.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* MRP */}
                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    MRP <span className="text-danger">*</span>
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
                    Selling Price <span className="text-danger">*</span>
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

                {/* HSN */}
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
                    Cost Price <span className="text-danger">*</span>
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

              <div className="d-flex gap-2 mt-3">
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={submitting}
                >
                  {submitting
                    ? "Saving..."
                    : editId
                      ? "Update Pricing"
                      : "Create Pricing"}
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancel}
                  disabled={submitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        /* View All Pricing */
        <div className="card shadow-sm">
          <div className="card-body">
            <DataTable
              columns={columns}
              data={pricingList}
              progressPending={loading}
              pagination
              paginationPerPage={10}
              paginationRowsPerPageOptions={[10, 25, 50]}
              highlightOnHover
              responsive
              persistTableHead
              noDataComponent="No product pricing found"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductPricing;
