
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { makeApiRequest } from "../../AxiosServices/apiCall";

function ViewInventory() {
  const [inventory, setInventory] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [warehouseId, setWarehouseId] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [selectedInventory, setSelectedInventory] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  console.log('inventory', inventory)
  // GET INVENTORY LIST
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
      console.log('response----------------', response)
      if (response?.data?.status) {
        const result = response.data.data || [];

        setInventory(result);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalRecords(response.data.pagination?.totalRecords || result.length);
      } else {
        setInventory([]);
        setTotalPages(1);
        setTotalRecords(0);
      }
    } catch (error) {
      console.error("Get inventory error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to fetch inventory"
      );
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status, warehouseId]);

  // FETCH INVENTORY
  useEffect(() => {
    getInventory();
  }, [getInventory]);

  // WAREHOUSE DROPDOWN
  const getWarehouses = async () => {
    try {
      const response = await makeApiRequest({
        url: "warehouse/get-warehouses",
        method: "GET",
      });
      console.log('response++++++++++++++++', response)
      if (response?.data?.status) {
        setWarehouses(response.data.data || []);
      }
    } catch (error) {
      console.error("Get warehouses error:", error);
    }
  };

  useEffect(() => {
    getWarehouses();
  }, []);

  // VIEW INVENTORY DETAILS
  const handleViewDetails = async (id) => {
    try {
      const response = await makeApiRequest({
        url: `get-inventory/${id}`,
        method: "GET",
      });
      console.log('response!!!!!!!!!!!!!!!!!', response)
      if (response?.data?.status) {
        setSelectedInventory(response.data.data);
        setShowDetails(true);
      } else {
        toast.error(response?.data?.message || "Failed to fetch details");
      }
    } catch (error) {
      console.error("Inventory details error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to fetch inventory details"
      );
    }
  };

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (value) => {
    setStatus(value);
    setPage(1);
  };

  const handleWarehouseChange = (value) => {
    setWarehouseId(value);
    setPage(1);
  };

  const getStatusBadge = (value) => {
    switch (value) {
      case "IN_STOCK":
        return "badge bg-success";
      case "LOW_STOCK":
        return "badge bg-warning text-dark";
      case "OUT_OF_STOCK":
        return "badge bg-danger";
      default:
        return "badge bg-secondary";
    }
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedInventory(null);
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Inventory Management</h4>
          <p className="text-muted mb-0">
            Manage product stock across warehouses
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={getInventory}
          disabled={loading}
        >
          <i className="fa fa-refresh me-2"></i>
          Refresh
        </button>
      </div>

      {/* FILTERS */}
      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Search</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search product name or SKU"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            <div className="col-md-4">
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

            <div className="col-md-4">
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

      {/* INVENTORY TABLE */}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Inventory List</h5>
          <span className="text-muted">
            Total Records: {totalRecords}
          </span>
        </div>

        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Variant</th>
                  <th>Warehouse</th>
                  <th>On Hand</th>
                  <th>Reserved</th>
                  <th>Available</th>
                  <th>Low Stock Limit</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="11" className="text-center py-4">
                      Loading inventory...
                    </td>
                  </tr>
                ) : inventory.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="text-center py-4">
                      No inventory records found
                    </td>
                  </tr>
                ) : (
                  inventory.map((item, index) => (
                    <tr key={item._id}>
                      <td>{(page - 1) * limit + index + 1}</td>

                      <td>
                        <div className="d-flex align-items-center gap-2">
                          {item.productId?.image && (
                            <img
                              src={item.productId.image}
                              alt={item.productId.name}
                              width="40"
                              height="40"
                              style={{
                                objectFit: "cover",
                                borderRadius: "5px",
                              }}
                            />
                          )}

                          <div>
                            <div className="fw-semibold">
                              {item.productId?.name || "N/A"}
                            </div>
                            <small className="text-muted">
                              {item.productId?.type || ""}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>{item.sku || item.variantId?.sku || "N/A"}</td>

                      <td>
                        {item.variantId?.name ||
                          item.variantId?.variantName ||
                          item.variantId?._id ||
                          "N/A"}
                      </td>

                      <td>
                        {item.warehouseId?.name || "N/A"}
                        <br />
                        <small className="text-muted">
                          {item.warehouseId?.code || ""}
                        </small>
                      </td>

                      <td>{item.onHand ?? 0}</td>
                      <td>{item.reserved ?? 0}</td>

                      <td>
                        <strong>{item.available ?? 0}</strong>
                      </td>

                      <td>{item.lowStockThreshold ?? 0}</td>

                      <td>
                        <span className={getStatusBadge(item.status)}>
                          {item.status?.replaceAll("_", " ") || "N/A"}
                        </span>
                      </td>

                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleViewDetails(item._id)}
                        >
                          <i className="fa fa-eye me-1"></i>
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <span className="text-muted">
              Page {page} of {totalPages}
            </span>

            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-secondary btn-sm"
                disabled={page <= 1 || loading}
                onClick={() => setPage((prev) => prev - 1)}
              >
                Previous
              </button>

              <button
                className="btn btn-outline-secondary btn-sm"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* INVENTORY DETAILS MODAL */}
      {showDetails && selectedInventory && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
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
                    <p>
                      {selectedInventory.productId?.name || "N/A"}
                    </p>
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
                    <p>
                      {selectedInventory.warehouseId?.name || "N/A"}
                    </p>
                  </div>

                  <div className="col-md-6">
                    <strong>Variant:</strong>
                    <p>
                      {selectedInventory.variantId?.name ||
                        selectedInventory.variantId?.variantName ||
                        "N/A"}
                    </p>
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
                      <span className={getStatusBadge(selectedInventory.status)}>
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
    </div>
  );
}

export default ViewInventory;
