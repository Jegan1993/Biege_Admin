
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import DataTable from "react-data-table-component";
import { makeApiRequest } from "../../AxiosServices/apiCall";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import {
  faPenToSquare,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function ViewProduct() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [bulkCategoryId, setBulkCategoryId] = useState("");

  const [selectedRows, setSelectedRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedImage, setSelectedImage] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);

  const [importRows, setImportRows] = useState([]);
  const [importErrors, setImportErrors] = useState([]);
  const [importResult, setImportResult] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // GET CATEGORIES FROM CATEGORY MANAGEMENT
  const getCategories = useCallback(async () => {
    try {
      const response = await makeApiRequest({
        url: "get-categories?status=ACTIVE&limit=500&page=1",
        method: "GET",
      });

      if (response.status) {
        setCategories(response.data || []);
      } else {
        setCategories([]);
        toast.error(response.message || "Failed to fetch categories");
      }
    } catch (err) {
      console.error("Get categories error:", err);
      setCategories([]);
      toast.error(
        err.response?.data?.message || "Failed to fetch categories"
      );
    }
  }, []);

  // GET PRODUCTS
  const getProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await makeApiRequest({
        url: "getproduct?limit=10000&page=1",
        method: "GET",
      });

      if (response.status) {
        setProducts(response.data || []);
        setSelectedRows([]);
      } else {
        setProducts([]);
        setError(response.message || "Failed to fetch products");
      }
    } catch (err) {
      console.error("Get products error:", err);
      setProducts([]);
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  // INITIAL LOAD
  useEffect(() => {
    getProducts();
    getCategories();
  }, [getProducts, getCategories]);

  // REFRESH PRODUCTS AND CATEGORIES
  const handleRefresh = async () => {
    await Promise.all([getProducts(), getCategories()]);
  };

  // GET CATEGORY ID
  const getCategoryId = (category) => {
    if (!category) return "";

    if (typeof category === "object") {
      return category._id || "";
    }

    return String(category);
  };

  // GET CATEGORY NAME
  const getCategoryName = (category) => {
    if (!category) return "";

    if (typeof category === "object") {
      return category.name || "";
    }

    const matchedCategory = categories.find(
      (item) => item._id === String(category)
    );

    return matchedCategory?.name || String(category);
  };

  // GET CATEGORY LABEL
  const getCategoryLabel = (category) => {
    if (!category) return "";

    if (typeof category === "object") {
      const parentName =
        typeof category.parentCategory === "object"
          ? category.parentCategory?.name
          : "";

      return parentName
        ? `${parentName} / ${category.name}`
        : category.name || "";
    }

    return getCategoryName(category);
  };

  // GET CATEGORY BY ID / SLUG / NAME
  const findCategory = (value) => {
    const searchValue = String(value || "").trim().toLowerCase();

    if (!searchValue) return null;

    return categories.find(
      (category) =>
        String(category._id).toLowerCase() === searchValue ||
        String(category.slug || "").toLowerCase() === searchValue ||
        String(category.name || "").toLowerCase() === searchValue
    );
  };

  // DELETE PRODUCT
  const handleDelete = useCallback(
    async (id) => {
      if (!window.confirm("Are you sure you want to delete this product?")) {
        return;
      }

      try {
        const response = await makeApiRequest({
          url: `deleteproduct/${id}`,
          method: "DELETE",
        });

        if (response.status) {
          toast.success(
            response.message || "Product deleted successfully"
          );
          getProducts();
        } else {
          toast.error(response.message || "Failed to delete product");
        }
      } catch (err) {
        console.error("Delete product error:", err);
        toast.error(
          err.response?.data?.message || "Something went wrong"
        );
      }
    },
    [getProducts]
  );

  // FILTER PRODUCTS
  const filteredProducts = useMemo(() => {
    const value = search.toLowerCase().trim();

    return products.filter((product) => {
      const categoryName = getCategoryName(product.category);
      const categoryId = getCategoryId(product.category);

      const matchesSearch =
        !value ||
        product.name?.toLowerCase().includes(value) ||
        product.sku?.toLowerCase().includes(value) ||
        categoryName?.toLowerCase().includes(value);

      const matchesStatus =
        !statusFilter || product.status === statusFilter;

      const matchesType =
        !typeFilter || product.type === typeFilter;

      const matchesCategory =
        !categoryFilter || categoryId === categoryFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType &&
        matchesCategory
      );
    });
  }, [
    products,
    search,
    statusFilter,
    typeFilter,
    categoryFilter,
    categories,
  ]);

  // SELECTED PRODUCT IDS
  const selectedIds = useMemo(
    () => selectedRows.map((row) => row._id),
    [selectedRows]
  );

  // BULK STATUS UPDATE
  const handleBulkStatus = async (status) => {
    if (!selectedIds.length) {
      toast.warning("Please select at least one product");
      return;
    }

    const action = status === "ACTIVE" ? "activate" : "archive";

    if (
      !window.confirm(
        `Are you sure you want to ${action} ${selectedIds.length} selected product(s)?`
      )
    ) {
      return;
    }

    try {
      setBulkLoading(true);

      const response = await makeApiRequest({
        url: "bulk-update-status",
        method: "PATCH",
        data: {
          productIds: selectedIds,
          status,
        },
      });

      if (response.status) {
        toast.success(
          response.message || "Products updated successfully"
        );
        await getProducts();
      } else {
        toast.error(response.message || "Bulk update failed");
      }
    } catch (err) {
      console.error("Bulk status error:", err);
      toast.error(
        err.response?.data?.message || "Bulk update failed"
      );
    } finally {
      setBulkLoading(false);
    }
  };

  // BULK CATEGORY UPDATE
  const handleBulkCategory = async () => {
    if (!selectedIds.length) {
      toast.warning("Please select products");
      return;
    }

    if (!bulkCategoryId) {
      toast.warning("Please select a category");
      return;
    }

    try {
      setBulkLoading(true);

      const response = await makeApiRequest({
        url: "bulk-update-category",
        method: "PATCH",
        data: {
          productIds: selectedIds,
          category: bulkCategoryId,
        },
      });

      if (response.status) {
        toast.success(
          response.message || "Category updated successfully"
        );
        setBulkCategoryId("");
        await getProducts();
      } else {
        toast.error(response.message || "Category update failed");
      }
    } catch (err) {
      console.error("Bulk category error:", err);
      toast.error(
        err.response?.data?.message || "Category update failed"
      );
    } finally {
      setBulkLoading(false);
    }
  };

  // EXPORT CSV
  const exportCSV = (rows, fileName) => {
    if (!rows.length) {
      toast.warning("No products available to export");
      return;
    }

    const exportData = rows.map((product) => {
      const category =
        typeof product.category === "object"
          ? product.category?.slug || product.category?.name || ""
          : getCategoryName(product.category);

      return {
        name: product.name || "",
        sku: product.sku || "",
        category,
        type: product.type || "",
        price: product.price ?? "",
        stock: product.stock ?? "",
        status: product.status || "",
        image: product.image || "",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

    XLSX.writeFile(workbook, fileName, {
      bookType: "csv",
    });
  };

  const handleExportSelected = () => {
    exportCSV(selectedRows, "selected-products.csv");
  };

  const handleExportFiltered = () => {
    exportCSV(filteredProducts, "products.csv");
  };

  // DOWNLOAD CSV TEMPLATE
  const downloadTemplate = () => {
    const firstCategory = categories[0];

    const template = [
      {
        name: "Aloe Vera Gel",
        sku: "SKIN001",
        category: firstCategory
          ? firstCategory.slug || firstCategory.name
          : "category-slug",
        type: "SKIN_CARE",
        price: 500,
        stock: 100,
        status: "DRAFT",
        image: "",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

    XLSX.writeFile(workbook, "product-import-template.csv", {
      bookType: "csv",
    });
  };

  // READ CSV / EXCEL FILE
  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const extension = file.name.split(".").pop().toLowerCase();

    if (!["csv", "xlsx", "xls"].includes(extension)) {
      toast.error("Only CSV, XLS and XLSX files are supported");
      event.target.value = "";
      return;
    }

    try {
      if (!categories.length) {
        toast.error(
          "Active categories are not available. Please create a category first."
        );
        event.target.value = "";
        return;
      }

      const buffer = await file.arrayBuffer();

      const workbook = XLSX.read(buffer, {
        type: "array",
        cellDates: false,
      });

      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

      const rawRows = XLSX.utils.sheet_to_json(firstSheet, {
        defval: "",
        raw: false,
      });

      if (!rawRows.length) {
        toast.warning("The uploaded file is empty");
        event.target.value = "";
        return;
      }

      const normalizedRows = rawRows.map((row) => {
        const normalized = {};

        Object.keys(row).forEach((key) => {
          normalized[key.trim().toLowerCase()] = row[key];
        });

        const enteredCategory = String(
          normalized.category ?? ""
        ).trim();

        const matchedCategory = findCategory(enteredCategory);

        return {
          name: String(normalized.name ?? "").trim(),
          sku: String(normalized.sku ?? "").trim().toUpperCase(),
          category: matchedCategory
            ? matchedCategory._id
            : enteredCategory,
          type: String(normalized.type ?? "").trim().toUpperCase(),
          price: String(normalized.price ?? "").trim(),
          stock: String(normalized.stock ?? "").trim(),
          status: String(normalized.status || "DRAFT")
            .trim()
            .toUpperCase(),
          image: String(normalized.image ?? "").trim(),
        };
      });

      const previewErrors = [];
      const seenSkus = new Set();

      normalizedRows.forEach((row, index) => {
        const rowErrors = [];

        if (!row.name) {
          rowErrors.push("Name is required");
        }

        if (!row.sku) {
          rowErrors.push("SKU is required");
        }

        if (!row.category) {
          rowErrors.push("Category is required");
        } else {
          const categoryExists = categories.some(
            (category) => category._id === row.category
          );

          if (!categoryExists) {
            rowErrors.push(
              "Invalid category. Use an active category name or slug"
            );
          }
        }

        if (!["SKIN_CARE", "BEAUTY"].includes(row.type)) {
          rowErrors.push("Invalid type");
        }

        if (!["DRAFT", "ACTIVE", "ARCHIVED"].includes(row.status)) {
          rowErrors.push("Invalid status");
        }

        if (
          row.price === "" ||
          !Number.isFinite(Number(row.price)) ||
          Number(row.price) < 0
        ) {
          rowErrors.push("Invalid price");
        }

        if (
          row.stock === "" ||
          !Number.isInteger(Number(row.stock)) ||
          Number(row.stock) < 0
        ) {
          rowErrors.push("Invalid stock");
        }

        if (row.sku && seenSkus.has(row.sku)) {
          rowErrors.push("Duplicate SKU in file");
        }

        if (row.sku) {
          seenSkus.add(row.sku);
        }

        if (rowErrors.length) {
          previewErrors.push({
            row: index + 2,
            sku: row.sku,
            message: rowErrors.join(", "),
          });
        }
      });

      setImportRows(normalizedRows);
      setImportErrors(previewErrors);
      setImportResult(null);
      setShowImportModal(true);
    } catch (err) {
      console.error("File read error:", err);
      toast.error("Unable to read the uploaded file");
    } finally {
      event.target.value = "";
    }
  };

  // CONFIRM IMPORT
  const confirmImport = async () => {
    if (!importRows.length) {
      toast.warning("No products available to import");
      return;
    }

    if (importErrors.length) {
      toast.warning(
        "Please correct the validation errors before importing"
      );
      return;
    }

    try {
      setImportLoading(true);

      const response = await makeApiRequest({
        url: "bulk-import",
        method: "POST",
        data: {
          products: importRows,
        },
      });

      if (response.status) {
        setImportResult(response.data);

        toast.success(
          `${response.data?.importedCount || 0} product(s) imported`
        );

        await getProducts();
      } else {
        toast.error(response.message || "Import failed");
      }
    } catch (err) {
      console.error("Bulk import error:", err);
      toast.error(err.response?.data?.message || "Import failed");
    } finally {
      setImportLoading(false);
    }
  };

  // TABLE COLUMNS
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
          <span className="fw-semibold text-dark">{row.name}</span>
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
        selector: (row) => getCategoryName(row.category),
        sortable: true,
        minWidth: "150px",
        cell: (row) => (
          <span>{getCategoryLabel(row.category)}</span>
        ),
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
              className={`badge px-3 py-2 ${statusClass[row.status] || "bg-light text-dark"
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
    [navigate, handleDelete, categories]
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
      {/* PAGE HEADER */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold mb-1">Products</h4>
          <p className="text-muted mb-0 small">
            Manage your skincare and beauty products
          </p>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-outline-primary px-3"
            onClick={handleRefresh}
            disabled={loading}
          >
            <i className="fa-solid fa-rotate me-2"></i>
            Refresh
          </button>

          <button
            type="button"
            className="btn btn-outline-success px-3"
            onClick={downloadTemplate}
          >
            <i className="fa-solid fa-download me-2"></i>
            CSV Template
          </button>

          <button
            type="button"
            className="btn btn-outline-success px-3"
            onClick={() => fileInputRef.current?.click()}
          >
            <i className="fa-solid fa-file-import me-2"></i>
            Import CSV / Excel
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            hidden
            onChange={handleImportFile}
          />

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

      {/* PRODUCT TABLE CARD */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-3 p-md-4">
          {/* SEARCH AND FILTERS */}
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-3">
            <div>
              <h6 className="fw-bold mb-1">Product List</h6>
              <small className="text-muted">
                Total: {products.length} | Filtered:{" "}
                {filteredProducts.length}
              </small>
            </div>

            <div className="d-flex flex-wrap gap-2">
              <div style={{ width: "230px", maxWidth: "100%" }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search name / SKU..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <select
                className="form-select"
                style={{ width: "145px" }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="ARCHIVED">Archived</option>
              </select>

              <select
                className="form-select"
                style={{ width: "145px" }}
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="SKIN_CARE">Skin Care</option>
                <option value="BEAUTY">Beauty</option>
              </select>

              <select
                className="form-select"
                style={{ width: "180px" }}
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {getCategoryLabel(category)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* BULK ACTIONS */}
          <div className="d-flex flex-wrap align-items-center gap-2 mb-3 p-3 bg-light rounded">
            <strong className="me-2">
              {selectedRows.length} Selected
            </strong>

            <button
              type="button"
              className="btn btn-sm btn-success"
              disabled={!selectedRows.length || bulkLoading}
              onClick={() => handleBulkStatus("ACTIVE")}
            >
              Activate
            </button>

            <button
              type="button"
              className="btn btn-sm btn-secondary"
              disabled={!selectedRows.length || bulkLoading}
              onClick={() => handleBulkStatus("ARCHIVED")}
            >
              Archive
            </button>

            <select
              className="form-select form-select-sm"
              style={{ width: "200px" }}
              value={bulkCategoryId}
              onChange={(e) => setBulkCategoryId(e.target.value)}
              disabled={!categories.length || bulkLoading}
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {getCategoryLabel(category)}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              disabled={
                !selectedRows.length ||
                !bulkCategoryId ||
                bulkLoading
              }
              onClick={handleBulkCategory}
            >
              Change Category
            </button>

            <button
              type="button"
              className="btn btn-sm btn-outline-success"
              disabled={!selectedRows.length}
              onClick={handleExportSelected}
            >
              Export Selected CSV
            </button>

            <button
              type="button"
              className="btn btn-sm btn-outline-dark"
              disabled={!filteredProducts.length}
              onClick={handleExportFiltered}
            >
              Export Filtered CSV
            </button>

            {bulkLoading && (
              <span className="text-muted small">Updating...</span>
            )}
          </div>

          {/* ERROR */}
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

          {/* DATA TABLE */}
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
                />
                <p className="text-muted mt-2 mb-0">
                  Loading products...
                </p>
              </div>
            }
            selectableRows
            selectableRowsHighlight
            onSelectedRowsChange={({ selectedRows: rows }) =>
              setSelectedRows(rows)
            }
            clearSelectedRows={loading}
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
                  {search ||
                    statusFilter ||
                    typeFilter ||
                    categoryFilter
                    ? "No matching products found"
                    : "No products available"}
                </h6>
              </div>
            }
          />
        </div>

        {/* PRODUCT IMAGE MODAL */}
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

        {/* IMPORT PREVIEW MODAL */}
        {showImportModal && (
          <div
            className="modal show d-block"
            tabIndex="-1"
            style={{
              backgroundColor: "rgba(0,0,0,0.6)",
              overflowY: "auto",
            }}
          >
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content border-0">
                <div className="modal-header">
                  <h5 className="modal-title">Import Products</h5>
                  <button
                    type="button"
                    className="btn-close"
                    disabled={importLoading}
                    onClick={() => setShowImportModal(false)}
                  ></button>
                </div>

                <div className="modal-body">
                  {!importResult ? (
                    <>
                      <div className="alert alert-info">
                        File contains {importRows.length} product row(s).
                        Review validation errors before importing.
                      </div>

                      <div className="row g-2 mb-3">
                        <div className="col-md-6">
                          <div className="border rounded p-3">
                            <small className="text-muted">
                              Total rows
                            </small>
                            <h4 className="mb-0">
                              {importRows.length}
                            </h4>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="border rounded p-3">
                            <small className="text-muted">
                              Preview errors
                            </small>
                            <h4 className="mb-0 text-danger">
                              {importErrors.length}
                            </h4>
                          </div>
                        </div>
                      </div>

                      {importErrors.length > 0 && (
                        <div className="alert alert-warning">
                          <strong>Rows with validation errors:</strong>
                          <div
                            style={{
                              maxHeight: "180px",
                              overflowY: "auto",
                              marginTop: "8px",
                            }}
                          >
                            {importErrors.map((item, index) => (
                              <div
                                key={index}
                                className="small mb-1"
                              >
                                Row {item.row} (
                                {item.sku || "No SKU"}): {item.message}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="table-responsive">
                        <table className="table table-sm table-bordered">
                          <thead className="table-light">
                            <tr>
                              <th>Name</th>
                              <th>SKU</th>
                              <th>Category</th>
                              <th>Type</th>
                              <th>Price</th>
                              <th>Stock</th>
                              <th>Status</th>
                            </tr>
                          </thead>

                          <tbody>
                            {importRows.slice(0, 10).map((row, index) => (
                              <tr key={index}>
                                <td>{row.name}</td>
                                <td>{row.sku}</td>
                                <td>
                                  {getCategoryName(row.category) ||
                                    row.category}
                                </td>
                                <td>{row.type}</td>
                                <td>{row.price}</td>
                                <td>{row.stock}</td>
                                <td>{row.status}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {importRows.length > 10 && (
                        <small className="text-muted">
                          Showing first 10 rows of {importRows.length}.
                        </small>
                      )}

                      <small className="text-muted d-block mt-2">
                        Category must match an active category name,
                        slug, or ID. Backend will also check existing
                        SKU duplicates.
                      </small>
                    </>
                  ) : (
                    <>
                      <div className="alert alert-success">
                        Import process completed.
                      </div>

                      <div className="row g-2 mb-3">
                        <div className="col-md-4">
                          <div className="border rounded p-3">
                            <small className="text-muted">
                              Total rows
                            </small>
                            <h4>{importResult.totalRows}</h4>
                          </div>
                        </div>

                        <div className="col-md-4">
                          <div className="border rounded p-3">
                            <small className="text-muted">
                              Imported
                            </small>
                            <h4 className="text-success">
                              {importResult.importedCount}
                            </h4>
                          </div>
                        </div>

                        <div className="col-md-4">
                          <div className="border rounded p-3">
                            <small className="text-muted">
                              Failed
                            </small>
                            <h4 className="text-danger">
                              {importResult.failedCount}
                            </h4>
                          </div>
                        </div>
                      </div>

                      {importResult.errors?.length > 0 && (
                        <div className="alert alert-warning">
                          <strong>Import errors:</strong>
                          <div
                            style={{
                              maxHeight: "200px",
                              overflowY: "auto",
                              marginTop: "8px",
                            }}
                          >
                            {importResult.errors.map((item, index) => (
                              <div
                                key={index}
                                className="small mb-1"
                              >
                                Row {item.row} (
                                {item.sku || "No SKU"}): {item.message}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    disabled={importLoading}
                    onClick={() => setShowImportModal(false)}
                  >
                    Close
                  </button>

                  {!importResult && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={
                        importLoading ||
                        !importRows.length ||
                        importErrors.length > 0
                      }
                      onClick={confirmImport}
                    >
                      {importLoading ? "Importing..." : "Confirm Import"}
                    </button>
                  )}
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
