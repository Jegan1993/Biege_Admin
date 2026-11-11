import React, { useCallback, useEffect, useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import { makeApiRequest } from "../../AxiosServices/apiCall";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  faPenToSquare,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
function ViewProduct() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);
  const navigate = useNavigate()

  const productTabs = [
    { id: "BASICS", label: "Basics", icon: "fa-circle-info" },
    { id: "PRICING", label: "Pricing", icon: "fa-tag" },
    { id: "MEDIA", label: "Media", icon: "fa-images" },
    { id: "VARIANTS", label: "Variants", icon: "fa-layer-group" },
    { id: "INGREDIENTS", label: "Ingredients", icon: "fa-flask" },
    { id: "AI_TAGS", label: "AI Tags", icon: "fa-wand-magic-sparkles" },
  ];

  const getProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await makeApiRequest({
        url: "getproduct",
        method: "GET",
      });

      if (response.status) {
        setProducts(response.data || []);
      } else {
        setProducts([]);
        setError(response.message || "Failed to fetch products");
      }
    } catch (error) {
      console.error("Get products error:", error);
      setProducts([]);
      setError(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getProducts();
  }, [getProducts]);


  const handleDelete = async (id) => {
    try {
      const response = await makeApiRequest({
        url: `deleteproduct/${id}`,
        method: "DELETE",
      });

      if (response.status) {
        toast.success(response.message || "Product deleted successfully");
        getProducts();
      } else {
        toast.error(response.message || "Failed to delete product");
      }
    } catch (error) {
      console.error("Delete product error:", error);
      toast.error(
        error.response?.data?.message || "Something went wrong"
      );
    }
  };

  const filteredProducts = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) return products;

    return products.filter((product) => {
      const category =
        typeof product.category === "object"
          ? product.category?.name
          : product.category;

      return (
        product.name?.toLowerCase().includes(value) ||
        product.sku?.toLowerCase().includes(value) ||
        category?.toLowerCase().includes(value) ||
        product.type?.toLowerCase().includes(value) ||
        product.status?.toLowerCase().includes(value)
      );
    });
  }, [products, search]);

  const columns = useMemo(
    () => [
      {
        name: "S.NO",
        width: "75px",
        cell: (row, index) => (
          <span className="fw-semibold">{index + 1}</span>
        ),
      },
      {
        name: "IMAGE",
        width: "100px",
        cell: (row) => (
          <div className="py-2">
            {row.image ? (
              <img
                src={row.image}
                alt={row.name || "Product"}
                width="55"
                height="55"
                style={{
                  objectFit: "cover",
                  borderRadius: "8px",
                  border: "1px solid #eee",
                  cursor: "pointer",
                }}
                onClick={() => {
                  setSelectedImage(row.image);
                  setShowImageModal(true);
                }}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <span className="text-muted small">No Image</span>
            )}
          </div>
        ),
      },

      {
        name: "PRODUCT NAME",
        selector: (row) => row.name,
        sortable: true,
        minWidth: "180px",
        cell: (row) => (
          <span className="fw-semibold text-dark">
            {row.name}
          </span>
        ),
      },
      {
        name: "SKU",
        selector: (row) => row.sku,
        sortable: true,
        minWidth: "120px",
      },
      {
        name: "CATEGORY",
        selector: (row) =>
          typeof row.category === "object"
            ? row.category?.name
            : row.category,
        sortable: true,
        minWidth: "130px",
      },
      {
        name: "TYPE",
        selector: (row) => row.type,
        sortable: true,
        cell: (row) => (
          <span className="badge bg-info-subtle text-info px-3 py-2">
            {row.type === "SKIN_CARE" ? "Skin Care" : "Beauty"}
          </span>
        ),
      },
      {
        name: "PRICE",
        selector: (row) => row.price,
        sortable: true,
        cell: (row) => (
          <span className="fw-semibold">
            ₹{Number(row.price).toLocaleString("en-IN")}
          </span>
        ),
      },
      {
        name: "STOCK",
        selector: (row) => row.stock,
        sortable: true,
        cell: (row) => (
          <span
            className={
              row.stock === 0
                ? "text-danger fw-semibold"
                : "text-dark"
            }
          >
            {row.stock}
          </span>
        ),
      },
      {
        name: "STATUS",
        selector: (row) => row.status,
        sortable: true,
        cell: (row) => {
          const statusClass = {
            ACTIVE: "bg-success-subtle text-success",
            DRAFT: "bg-warning-subtle text-warning",
            ARCHIVED: "bg-secondary-subtle text-secondary",
          };

          return (
            <span
              className={`badge px-3 py-2 ${statusClass[row.status] ||
                "bg-light text-dark"
                }`}
            >
              {row.status}
            </span>
          );
        },
      },

      {
        name: "ACTION",
        width: "180px",
        minWidth: "180px",
        button: true,
        cell: (row) => (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              width: "100%",
              minWidth: "150px",
              whiteSpace: "nowrap",
            }}
          >
            <button
              type="button"
              title="Edit Product"
              onClick={() =>
                navigate(`/edit-product/${row._id}/basic`)
              }
              style={{
                width: "38px",
                height: "38px",
                minWidth: "38px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #0d6efd",
                borderRadius: "6px",
                background: "#fff",
                color: "#0d6efd",
                cursor: "pointer",
              }}
            >
              <FontAwesomeIcon icon={faPenToSquare} />
            </button>

            <button
              type="button"
              title="Delete Product"
              onClick={() => handleDelete(row._id)}
              style={{
                width: "38px",
                height: "38px",
                minWidth: "38px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #dc3545",
                borderRadius: "6px",
                background: "#fff",
                color: "#dc3545",
                cursor: "pointer",
              }}
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: "#f8f9fa",
        minHeight: "55px",
        borderBottom: "1px solid #dee2e6",
      },
    },
    headCells: {
      style: {
        fontSize: "12px",
        fontWeight: "700",
        color: "#555",
        paddingLeft: "16px",
        paddingRight: "16px",
      },
    },
    rows: {
      style: {
        minHeight: "75px",
        fontSize: "13px",
        color: "#444",
      },
      highlightOnHoverStyle: {
        backgroundColor: "#f8f9fa",
        transition: "0.2s",
      },
    },
    cells: {
      style: {
        paddingLeft: "12px",
        paddingRight: "12px",
        overflow: "visible",
      },
    },
    pagination: {
      style: {
        borderTop: "1px solid #dee2e6",
        minHeight: "60px",
      },
    },
  };

  return (
    <div className="container-fluid py-4">

      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold mb-1">Products</h4>
          <p className="text-muted mb-0 small">
            Manage your skincare and beauty products
          </p>
        </div>
        {/* Product Tabs */}

        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-3">
            <div className="d-flex flex-wrap gap-2">
              {productTabs.map((tab) => {
                const paths = {
                  BASICS: "basic",
                  PRICING: "pricing",
                  MEDIA: "media",
                  VARIANTS: "variants",
                  INGREDIENTS: "ingredients",
                  AI_TAGS: "ai-tags",
                };

                return (
                  <button
                    key={tab.id}
                    type="button"
                    className="btn px-3 py-2 btn-outline-secondary"
                    onClick={() => {
                      if (tab.id === "BASICS") {
                        navigate("/product-basics");
                      } else {
                        navigate(`/add-product/${paths[tab.id]}`);
                      }
                    }}
                  >
                    <i className={`fa-solid ${tab.icon} me-2`}></i>
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-outline-primary px-4"
            onClick={getProducts}
            disabled={loading}
          >
            <i className="fa-solid fa-rotate me-2"></i>
            Refresh
          </button>

          <button
            type="button"
            className="btn btn-primary px-4"
            onClick={() => navigate("/create-product")}
          >
            <i className="fa-solid fa-plus me-2"></i>
            Add Product
          </button>
        </div>
      </div>



      {/* Product Table Card */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-3 p-md-4">
          {/* Search and count */}
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-3">
            <div>
              <h6 className="fw-bold mb-1">Product List</h6>
              <small className="text-muted">
                Total Products: {products.length}
              </small>
            </div>

            <div style={{ width: "280px", maxWidth: "100%" }}>
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <i className="fa-solid fa-magnifying-glass text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="alert alert-danger py-2">
              {error}
              <button
                className="btn btn-sm btn-outline-danger ms-3"
                onClick={getProducts}
              >
                Retry
              </button>
            </div>
          )}

          {/* DataTable */}
          <DataTable
            columns={columns}
            data={filteredProducts}
            customStyles={customStyles}
            progressPending={loading}
            progressComponent={
              <div className="py-5 text-center">
                <div
                  className="spinner-border text-primary"
                  role="status"
                ></div>
                <p className="text-muted mt-2 mb-0">
                  Loading products...
                </p>
              </div>
            }
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 25, 50, 100]}
            highlightOnHover
            striped
            responsive
            persistTableHead
            noDataComponent={
              <div className="py-5 text-center">
                <i className="fa-solid fa-box-open fs-2 text-muted mb-3"></i>
                <h6 className="text-muted">
                  {search
                    ? "No matching products found"
                    : "No products available"}
                </h6>
              </div>
            }
          />
        </div>
        {/* Product Image Modal */}
        {showImageModal && (
          <div
            className="modal show d-block"
            tabIndex="-1"
            style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
            onClick={() => setShowImageModal(false)}
          >
            <div
              className="modal-dialog modal-dialog-centered modal-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content border-0">
                <div className="modal-header">
                  <h5 className="modal-title">Product Image</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowImageModal(false)}
                  ></button>
                </div>

                <div className="modal-body text-center p-3">
                  <img
                    src={selectedImage}
                    alt="Product"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "70vh",
                      objectFit: "contain",
                      borderRadius: "8px",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

export default ViewProduct;

