
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";
import { makeApiRequest } from "../../AxiosServices/apiCall";
import StockAdjustmentModal from "./StockAdjustmentModal";
import StockAdjustmentLog from "./StockAdjustmentLog";
import { useNavigate } from "react-router-dom";
const initialReceiveValues = {
  productId: "",
  variantId: "",
  warehouseId: "",
  batchNumber: "",
  receivedQuantity: "",
  lowStockThreshold: 10,
  manufacturingDate: "",
  expiryDate: "",
  notes: "",
};
const tableCustomStyles = {
  table: {
    style: { backgroundColor: "#ffffff" },
  },
  headRow: {
    style: {
      backgroundColor: "#f8f9fa",
      borderBottom: "1px solid #dee2e6",
      minHeight: "50px",
    },
  },
  headCells: {
    style: {
      fontSize: "13px",
      fontWeight: "600",
      color: "#343a40",
      paddingLeft: "12px",
      paddingRight: "12px",
    },
  },
  rows: {
    style: {
      minHeight: "65px",
      fontSize: "13px",
      color: "#495057",
      "&:not(:last-of-type)": {
        borderBottom: "1px solid #eeeeee",
      },
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
    },
  },
  pagination: {
    style: {
      borderTop: "1px solid #dee2e6",
      minHeight: "55px",
      fontSize: "13px",
    },
  },
};

function ViewInventory() {
  const [inventory, setInventory] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [warehouseId, setWarehouseId] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  const [selectedInventory, setSelectedInventory] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [receiveValues, setReceiveValues] = useState(initialReceiveValues);
  const [showAdjustmentLog, setShowAdjustmentLog] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [selectedAdjustmentInventory, setSelectedAdjustmentInventory] =
    useState(null);
  useEffect(() => {
    console.log("showAdjustmentModal changed:", showAdjustmentModal);
  }, [showAdjustmentModal]);


  const [showEditModal, setShowEditModal] = useState(false);
  const [editingInventory, setEditingInventory] = useState(null);
  const [editLowStockThreshold, setEditLowStockThreshold] = useState("");


  const navigate = useNavigate()



  // OPEN EDIT INVENTORY MODAL
  const handleEditInventory = (row) => {
    setEditingInventory(row);
    setEditLowStockThreshold(
      String(row.lowStockThreshold ?? 0)
    );
    setShowEditModal(true);
  };

  // CLOSE EDIT INVENTORY MODAL
  const closeEditModal = () => {
    if (submitting) return;

    setShowEditModal(false);
    setEditingInventory(null);
    setEditLowStockThreshold("");
  };

  // UPDATE INVENTORY
  const handleUpdateInventory = async (e) => {
    e.preventDefault();

    if (
      editLowStockThreshold === "" ||
      !Number.isInteger(Number(editLowStockThreshold)) ||
      Number(editLowStockThreshold) < 0
    ) {
      toast.error("Enter a valid low stock threshold");
      return;
    }

    try {
      setSubmitting(true);

      const response = await makeApiRequest({
        url: `update-inventory/${editingInventory._id}`,
        method: "PUT",
        data: {
          lowStockThreshold: Number(editLowStockThreshold),
        },
      });

      if (response?.status) {
        toast.success(
          response.message || "Inventory updated successfully"
        );

        setShowEditModal(false);
        setEditingInventory(null);
        setEditLowStockThreshold("");

        await getInventory();
      } else {
        toast.error(
          response?.message || "Failed to update inventory"
        );
      }
    } catch (error) {
      console.error("Update inventory error:", error);

      toast.error(
        error?.response?.data?.message ||
        "Failed to update inventory"
      );
    } finally {
      setSubmitting(false);
    }
  };
  // GET INVENTORY
  const getInventory = useCallback(async () => {
    try {
      setLoading(true);

      let url = `get-inventory?page=${page}&limit=${limit}`;

      if (search.trim()) {
        url += `&search=${encodeURIComponent(search.trim())}`;
      }

      if (status) {
        url += `&status=${status}`;
      }

      if (warehouseId) {
        url += `&warehouseId=${warehouseId}`;
      }

      const response = await makeApiRequest({
        url,
        method: "GET",
      });

      if (response?.status && Array.isArray(response.data)) {
        setInventory(response.data);
        setTotalRecords(
          response.pagination?.total ??
          response.pagination?.totalRecords ??
          response.data.length
        );
      } else {
        setInventory([]);
        setTotalRecords(0);
      }
    } catch (error) {
      console.error("Get inventory error:", error);
      setInventory([]);
      setTotalRecords(0);

      toast.error(
        error?.response?.data?.message || "Failed to fetch inventory"
      );
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status, warehouseId]);

  useEffect(() => {
    getInventory();
  }, [getInventory]);

  // GET WAREHOUSES
  const getWarehouses = async () => {
    try {
      const response = await makeApiRequest({
        url: "warehouse/get-warehouses",
        method: "GET",
      });

      if (response?.status && Array.isArray(response.data)) {
        setWarehouses(response.data);
      } else {
        setWarehouses([]);
      }
    } catch (error) {
      console.error("Get warehouses error:", error);
      toast.error("Failed to fetch warehouses");
    }
  };

  // GET PRODUCTS
  const getProducts = async () => {
    try {
      const response = await makeApiRequest({
        url: "getproduct",
        method: "GET",
      });

      if (response?.status && Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Get products error:", error);
      toast.error("Failed to fetch products");
    }
  };

  useEffect(() => {
    getWarehouses();
    getProducts();
  }, []);
  // DELETE INVENTORY
  const handleDeleteInventory = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this inventory record?"
    );

    if (!confirmed) return;

    try {
      setSubmitting(true);

      const response = await makeApiRequest({
        url: `delete-inventory/${id}`,
        method: "DELETE",
      });

      if (response?.status) {
        toast.success(
          response.message || "Inventory deleted successfully"
        );

        await getInventory();
      } else {
        toast.error(
          response?.message || "Failed to delete inventory"
        );
      }
    } catch (error) {
      console.error("Delete inventory error:", error);

      toast.error(
        error?.response?.data?.message ||
        "Failed to delete inventory"
      );
    } finally {
      setSubmitting(false);
    }
  };
  // GET VARIANTS BY PRODUCT
  const getVariants = async (productId) => {
    try {
      setVariants([]);

      if (!productId) return;

      const response = await makeApiRequest({
        url: "getproduct-variant",
        method: "GET",
      });

      if (response?.status && Array.isArray(response.data)) {
        const filteredVariants = response.data.filter((variant) => {
          const variantProductId =
            typeof variant.product === "object"
              ? variant.product?._id
              : variant.product;

          return String(variantProductId) === String(productId);
        });

        setVariants(filteredVariants);
      } else {
        setVariants([]);
      }
    } catch (error) {
      console.error("Get variants error:", error);
      setVariants([]);
      toast.error("Failed to fetch variants");
    }
  };

  // RECEIVE FORM CHANGE
  const handleReceiveChange = (e) => {
    const { name, value } = e.target;

    if (name === "productId") {
      setReceiveValues((prev) => ({
        ...prev,
        productId: value,
        variantId: "",
      }));

      setVariants([]);
      getVariants(value);
      return;
    }

    setReceiveValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // OPEN RECEIVE MODAL
  const openReceiveModal = () => {
    setReceiveValues({ ...initialReceiveValues });
    setVariants([]);
    setShowReceiveModal(true);
  };

  // CLOSE RECEIVE MODAL
  const closeReceiveModal = () => {
    if (submitting) return;

    setShowReceiveModal(false);
    setReceiveValues({ ...initialReceiveValues });
    setVariants([]);
  };

  // RECEIVE STOCK
  const handleReceiveStock = async (e) => {
    e.preventDefault();

    const {
      productId,
      variantId,
      warehouseId,
      batchNumber,
      receivedQuantity,
      lowStockThreshold,
      manufacturingDate,
      expiryDate,
      notes,
    } = receiveValues;

    if (
      !productId ||
      !variantId ||
      !warehouseId ||
      !batchNumber.trim() ||
      !receivedQuantity ||
      !expiryDate
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    if (
      !Number.isInteger(Number(receivedQuantity)) ||
      Number(receivedQuantity) <= 0
    ) {
      toast.error("Received quantity must be a positive whole number");
      return;
    }

    if (
      !Number.isInteger(Number(lowStockThreshold)) ||
      Number(lowStockThreshold) < 0
    ) {
      toast.error("Low stock threshold must be a non-negative whole number");
      return;
    }

    if (manufacturingDate && expiryDate <= manufacturingDate) {
      toast.error("Expiry date must be after manufacturing date");
      return;
    }

    if (expiryDate <= new Date().toISOString().slice(0, 10)) {
      toast.error("Expiry date must be in the future");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        productId,
        variantId,
        warehouseId,
        batchNumber: batchNumber.trim(),
        receivedQuantity: Number(receivedQuantity),
        lowStockThreshold: Number(lowStockThreshold),
        manufacturingDate: manufacturingDate || undefined,
        expiryDate,
        notes: notes.trim(),
      };

      const response = await makeApiRequest({
        url: "receive-stock",
        method: "POST",
        data: payload,
      });

      if (response?.status) {
        toast.success(response.message || "Stock received successfully");

        setShowReceiveModal(false);
        setReceiveValues({ ...initialReceiveValues });
        setVariants([]);

        if (page === 1) {
          getInventory();
        } else {
          setPage(1);
        }
      } else {
        toast.error(response?.message || "Failed to receive stock");
      }
    } catch (error) {
      console.error("Receive stock error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to receive stock"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // VIEW INVENTORY DETAILS
  const handleViewDetails = useCallback(async (id) => {
    try {
      const response = await makeApiRequest({
        url: `get-inventory/${id}`,
        method: "GET",
      });

      if (response?.status) {
        setSelectedInventory(response.data);
        setShowDetails(true);
      } else {
        toast.error(response?.message || "Failed to fetch inventory details");
      }
    } catch (error) {
      console.error("Inventory details error:", error);
      toast.error(
        error?.response?.data?.message ||
        "Failed to fetch inventory details"
      );
    }
  }, []);

  // OPEN STOCK ADJUSTMENT FOR THE SELECTED ROW
  const openAdjustmentModal = (row) => {
    setSelectedAdjustmentInventory(row);
    setShowAdjustmentModal(true);
  };

  // CLOSE STOCK ADJUSTMENT
  const closeAdjustmentModal = () => {
    if (submitting) return;

    setShowAdjustmentModal(false);
    setSelectedAdjustmentInventory(null);
  };

  // HANDLE STOCK ADJUSTMENT API
  const handleStockAdjustment = async (payload) => {
    try {
      setSubmitting(true);

      const response = await makeApiRequest({
        url: "adjust-stock",
        method: "POST",
        data: payload,
      });

      if (response?.status) {
        toast.success(response.message || "Stock adjusted successfully");

        setShowAdjustmentModal(false);
        setSelectedAdjustmentInventory(null);

        await getInventory();
        return true;
      }

      toast.error(response?.message || "Failed to adjust stock");
      return false;
    } catch (error) {
      console.error("Stock adjustment error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to adjust stock"
      );
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  // SEARCH
  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  // STATUS FILTER
  const handleStatusChange = (value) => {
    setStatus(value);
    setPage(1);
  };

  // WAREHOUSE FILTER
  const handleWarehouseChange = (value) => {
    setWarehouseId(value);
    setPage(1);
  };

  // CLOSE DETAILS
  const closeDetails = () => {
    setShowDetails(false);
    setSelectedInventory(null);
  };

  // STATUS BADGE
  const getStatusBadge = (value) => {
    const styles = {
      IN_STOCK: {
        backgroundColor: "#d1e7dd",
        color: "#0f5132",
      },
      LOW_STOCK: {
        backgroundColor: "#fff3cd",
        color: "#664d03",
      },
      OUT_OF_STOCK: {
        backgroundColor: "#f8d7da",
        color: "#842029",
      },
    };

    return {
      ...(styles[value] || {
        backgroundColor: "#e9ecef",
        color: "#495057",
      }),
      padding: "5px 10px",
      borderRadius: "5px",
      fontSize: "11px",
      fontWeight: "600",
      whiteSpace: "nowrap",
      display: "inline-block",
    };
  };

  // DATATABLE COLUMNS
  const columns = useMemo(
    () => [
      {
        name: "S.No",
        width: "65px",
        center: true,
        cell: (row, index) => (
          <span>{(page - 1) * limit + index + 1}</span>
        ),
      },
      {
        name: "Product",
        minWidth: "220px",
        selector: (row) => row.productId?.name || "N/A",
        cell: (row) => (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "8px 0",
            }}
          >
            {row.productId?.image ? (
              <img
                src={row.productId.image}
                alt={row.productId.name || "Product"}
                style={{
                  width: "42px",
                  height: "42px",
                  objectFit: "cover",
                  borderRadius: "6px",
                  border: "1px solid #dee2e6",
                }}
              />
            ) : (
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  backgroundColor: "#f1f3f5",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#adb5bd",
                }}
              >
                <i className="fa fa-image"></i>
              </div>
            )}

            <div>
              <div style={{ fontWeight: "600", color: "#343a40" }}>
                {row.productId?.name || "N/A"}
              </div>
              <small style={{ color: "#6c757d" }}>
                {row.productId?.type || ""}
              </small>
            </div>
          </div>
        ),
      },
      {
        name: "SKU",
        minWidth: "120px",
        selector: (row) => row.sku || row.variantId?.sku || "N/A",
        sortable: true,
      },
      {
        name: "Variant",
        minWidth: "140px",
        selector: (row) => row.variantId?.variantName || "N/A",
      },
      {
        name: "Warehouse",
        minWidth: "160px",
        selector: (row) => row.warehouseId?.name || "N/A",
        cell: (row) => (
          <div>
            <div style={{ fontWeight: "500" }}>
              {row.warehouseId?.name || "N/A"}
            </div>
            <small style={{ color: "#6c757d" }}>
              {row.warehouseId?.code || ""}
            </small>
          </div>
        ),
      },
      {
        name: "On Hand",
        width: "100px",
        selector: (row) => row.onHand ?? 0,
        sortable: true,
        center: true,
      },
      {
        name: "Reserved",
        width: "100px",
        selector: (row) => row.reserved ?? 0,
        sortable: true,
        center: true,
      },
      {
        name: "Available",
        width: "110px",
        selector: (row) => row.available ?? 0,
        sortable: true,
        center: true,
        cell: (row) => (
          <strong>{row.available ?? 0}</strong>
        ),
      },
      {
        name: "Low Stock Limit",
        width: "130px",
        selector: (row) => row.lowStockThreshold ?? 0,
        center: true,
      },
      {
        name: "Status",
        width: "130px",
        selector: (row) => row.status || "",
        cell: (row) => (
          <span style={getStatusBadge(row.status)}>
            {row.status?.replaceAll("_", " ") || "N/A"}
          </span>
        ),
      },

      {
        name: "Action",
        minWidth: "420px",
        center: true,
        cell: (row) => (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              flexWrap: "wrap",
              padding: "8px 0",
            }}
          >
            {/* View */}
            <button
              type="button"
              onClick={() => handleViewDetails(row._id)}
              style={{
                backgroundColor: "#0d6efd",
                color: "#ffffff",
                border: "none",
                borderRadius: "5px",
                padding: "7px 12px",
                fontSize: "13px",
                fontWeight: "500",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                whiteSpace: "nowrap",
              }}
            >
              <i className="fa fa-eye"></i>
              View
            </button>

            {/* Adjust Stock */}
            <button
              type="button"
              onClick={() => openAdjustmentModal(row)}
              style={{
                backgroundColor: "#ffc107",
                color: "#212529",
                border: "none",
                borderRadius: "5px",
                padding: "7px 12px",
                fontSize: "13px",
                fontWeight: "500",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                whiteSpace: "nowrap",
              }}
            >
              <i className="fa fa-edit"></i>
              Adjust
            </button>

            {/* Edit Inventory */}
            <button
              type="button"
              onClick={() => handleEditInventory(row)}
              style={{
                backgroundColor: "#0dcaf0",
                color: "#000000",
                border: "none",
                borderRadius: "5px",
                padding: "7px 12px",
                fontSize: "13px",
                fontWeight: "500",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                whiteSpace: "nowrap",
              }}
            >
              <i className="fa fa-pencil"></i>
              Edit
            </button>

            {/* Delete Inventory */}
            <button
              type="button"
              onClick={() => handleDeleteInventory(row._id)}
              style={{
                backgroundColor: "#dc3545",
                color: "#ffffff",
                border: "none",
                borderRadius: "5px",
                padding: "7px 12px",
                fontSize: "13px",
                fontWeight: "500",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                whiteSpace: "nowrap",
              }}
            >
              <i className="fa fa-trash"></i>
              Delete
            </button>
          </div>
        ),
      },



    ],
    [page, limit, handleViewDetails]
  );

  return (
    <div className="container-fluid">

      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "22px",
        }}
      >
        <div>
          <h4 style={{ marginBottom: "5px" }}>
            Inventory Management
          </h4>
          <p style={{ color: "#6c757d", marginBottom: 0 }}>
            Manage product stock across warehouses
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={getInventory}
            disabled={loading}
          >
            <i className="fa fa-refresh me-2"></i>
            Refresh
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={openReceiveModal}
          >
            <i className="fa fa-plus me-2"></i>
            Receive Stock
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="card mb-3">
        <div className="card-body">

          {/* SEARCH AND ADJUST BUTTON */}
          <div className="d-flex justify-content-between align-items-end flex-wrap gap-3 mb-3">
            <div style={{ width: "100%", maxWidth: "400px" }}>
              <label className="form-label">Search</label>

              <input
                type="text"
                className="form-control"
                placeholder="Search product name or SKU"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() => setShowAdjustmentLog(true)}
            >
              <i className="fa fa-history me-2"></i>
              Adjustment Log
            </button>

            <button
              type="button"
              className="btn btn-warning"
              onClick={() => navigate("/expiry-management")}
            >
              <i className="fa fa-calendar-times me-2"></i>
              Expiry Management
            </button>
          </div>

          {/* OTHER FILTERS */}
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Stock Status</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="IN_STOCK">In Stock</option>
                <option value="LOW_STOCK">Low Stock</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label">Warehouse</label>
              <select
                className="form-select"
                value={warehouseId}
                onChange={(e) => handleWarehouseChange(e.target.value)}
              >
                <option value="">All Warehouses</option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse._id} value={warehouse._id}>
                    {warehouse.name} ({warehouse.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* INVENTORY DATATABLE */}
      {/* INVENTORY TABLE / ADJUSTMENT LOG */}
      {showAdjustmentLog ? (
        <StockAdjustmentLog
          warehouses={warehouses}
          onBack={() => setShowAdjustmentLog(false)}
        />
      ) : (
        <div className="card">
          <div
            className="card-header"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <h5 className="mb-0">Inventory List</h5>

            <span style={{ color: "#6c757d", fontSize: "13px" }}>
              Total Records: {totalRecords}
            </span>
          </div>

          <div className="card-body p-0">
            <DataTable
              columns={columns}
              data={inventory}
              customStyles={tableCustomStyles}
              progressPending={loading}
              progressComponent={
                <div style={{ padding: "30px", color: "#6c757d" }}>
                  Loading inventory...
                </div>
              }
              noDataComponent={
                <div style={{ padding: "30px", color: "#6c757d" }}>
                  No inventory records found
                </div>
              }
              pagination
              paginationServer
              paginationTotalRows={totalRecords}
              paginationPerPage={limit}
              paginationDefaultPage={page}
              paginationRowsPerPageOptions={[10, 20, 50, 100]}
              onChangePage={(newPage) => setPage(newPage)}
              onChangeRowsPerPage={(newLimit) => {
                setLimit(newLimit);
                setPage(1);
              }}
              highlightOnHover
              responsive
              persistTableHead
              striped
            />
          </div>
        </div>
      )}

      {/* RECEIVE STOCK MODAL */}
      {showReceiveModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 1050,
          }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={handleReceiveStock}>
                <div className="modal-header">
                  <h5 className="modal-title">Receive Stock</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeReceiveModal}
                    disabled={submitting}
                  ></button>
                </div>

                <div className="modal-body">
                  <div className="row g-3">

                    <div className="col-md-6">
                      <label className="form-label">
                        Product <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        name="productId"
                        value={receiveValues.productId}
                        onChange={handleReceiveChange}
                        required
                      >
                        <option value="">Select Product</option>
                        {products.map((product) => (
                          <option key={product._id} value={product._id}>
                            {product.name} {product.sku ? `(${product.sku})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">
                        Variant <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        name="variantId"
                        value={receiveValues.variantId}
                        onChange={handleReceiveChange}
                        required
                        disabled={!receiveValues.productId}
                      >
                        <option value="">Select Variant</option>
                        {variants.map((variant) => (
                          <option key={variant._id} value={variant._id}>
                            {variant.variantName} ({variant.sku})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">
                        Warehouse <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        name="warehouseId"
                        value={receiveValues.warehouseId}
                        onChange={handleReceiveChange}
                        required
                      >
                        <option value="">Select Warehouse</option>
                        {warehouses.map((warehouse) => (
                          <option key={warehouse._id} value={warehouse._id}>
                            {warehouse.name} ({warehouse.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">
                        Batch Number <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="batchNumber"
                        value={receiveValues.batchNumber}
                        onChange={handleReceiveChange}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">
                        Received Quantity <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        className="form-control"
                        name="receivedQuantity"
                        value={receiveValues.receivedQuantity}
                        onChange={handleReceiveChange}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Low Stock Threshold</label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        className="form-control"
                        name="lowStockThreshold"
                        value={receiveValues.lowStockThreshold}
                        onChange={handleReceiveChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Manufacturing Date</label>
                      <input
                        type="date"
                        className="form-control"
                        name="manufacturingDate"
                        value={receiveValues.manufacturingDate}
                        onChange={handleReceiveChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">
                        Expiry Date <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        name="expiryDate"
                        min={new Date().toISOString().slice(0, 10)}
                        value={receiveValues.expiryDate}
                        onChange={handleReceiveChange}
                        required
                      />
                    </div>

                    <div className="col-md-12">
                      <label className="form-label">Notes</label>
                      <textarea
                        className="form-control"
                        name="notes"
                        rows="3"
                        value={receiveValues.notes}
                        onChange={handleReceiveChange}
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeReceiveModal}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? "Receiving..." : "Receive Stock"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* INVENTORY DETAILS MODAL */}
      {showDetails && selectedInventory && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 1060,
          }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Inventory Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeDetails}
                ></button>
              </div>

              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <strong>Product:</strong>
                    <p>{selectedInventory.productId?.name || "N/A"}</p>
                  </div>

                  <div className="col-md-6">
                    <strong>SKU:</strong>
                    <p>
                      {selectedInventory.sku ||
                        selectedInventory.variantId?.sku ||
                        "N/A"}
                    </p>
                  </div>

                  <div className="col-md-6">
                    <strong>Warehouse:</strong>
                    <p>{selectedInventory.warehouseId?.name || "N/A"}</p>
                  </div>

                  <div className="col-md-6">
                    <strong>Variant:</strong>
                    <p>{selectedInventory.variantId?.variantName || "N/A"}</p>
                  </div>

                  <div className="col-md-3">
                    <strong>On Hand</strong>
                    <p>{selectedInventory.onHand ?? 0}</p>
                  </div>

                  <div className="col-md-3">
                    <strong>Reserved</strong>
                    <p>{selectedInventory.reserved ?? 0}</p>
                  </div>

                  <div className="col-md-3">
                    <strong>Available</strong>
                    <p>{selectedInventory.available ?? 0}</p>
                  </div>

                  <div className="col-md-3">
                    <strong>Low Stock Limit</strong>
                    <p>{selectedInventory.lowStockThreshold ?? 0}</p>
                  </div>

                  <div className="col-md-6">
                    <strong>Status:</strong>
                    <p>
                      <span style={getStatusBadge(selectedInventory.status)}>
                        {selectedInventory.status?.replaceAll("_", " ") || "N/A"}
                      </span>
                    </p>
                  </div>

                  <div className="col-md-6">
                    <strong>Created At:</strong>
                    <p>
                      {selectedInventory.createdAt
                        ? new Date(selectedInventory.createdAt).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeDetails}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAdjustmentModal && (
        <StockAdjustmentModal
          inventory={selectedAdjustmentInventory}
          inventoryList={inventory}
          submitting={submitting}
          onClose={closeAdjustmentModal}
          onSubmit={handleStockAdjustment}
        />
      )}
      {/* EDIT INVENTORY MODAL */}
      {showEditModal && editingInventory && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 1070,
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">

              <form onSubmit={handleUpdateInventory}>

                <div className="modal-header">
                  <h5 className="modal-title">
                    Edit Inventory
                  </h5>

                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeEditModal}
                    disabled={submitting}
                  ></button>
                </div>

                <div className="modal-body">

                  <div className="mb-3">
                    <label className="form-label">
                      Product
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      value={editingInventory.productId?.name || "N/A"}
                      disabled
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      SKU
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      value={
                        editingInventory.sku ||
                        editingInventory.variantId?.sku ||
                        "N/A"
                      }
                      disabled
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Warehouse
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      value={editingInventory.warehouseId?.name || "N/A"}
                      disabled
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Low Stock Threshold *
                    </label>

                    <input
                      type="number"
                      className="form-control"
                      min="0"
                      step="1"
                      value={editLowStockThreshold}
                      onChange={(e) =>
                        setEditLowStockThreshold(e.target.value)
                      }
                      required
                    />

                    <small className="text-muted">
                      Dashboard low-stock alerts use this threshold.
                    </small>
                  </div>

                </div>

                <div className="modal-footer">

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeEditModal}
                    disabled={submitting}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? "Updating..." : "Update Inventory"}
                  </button>

                </div>

              </form>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewInventory;
