import React, { useCallback, useEffect, useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";
import { makeApiRequest } from "../../AxiosServices/apiCall";
import { useNavigate } from "react-router-dom";

const initialSummary = {
  totalBatches: 0,
  active: 0,
  expiringSoon: 0,
  critical: 0,
  expired: 0,
  expiredQuantity: 0,
};

function ExpiryManagement() {
  const [batches, setBatches] = useState([]);
  const [summary, setSummary] = useState(initialSummary);

  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [warehouseId, setWarehouseId] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const navigate = useNavigate()
  // GET EXPIRY SUMMARY
  const getExpirySummary = useCallback(async () => {
    try {
      const response = await makeApiRequest({
        url: "get-expiry-summary",
        method: "GET",
      });

      if (response?.status) {
        setSummary(response.data || initialSummary);
      }
    } catch (error) {
      console.error("Expiry summary error:", error);
    }
  }, []);

  // GET EXPIRY BATCHES
  const getExpiryBatches = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      params.append("page", page);
      params.append("limit", limit);

      if (search.trim()) {
        params.append("search", search.trim());
      }

      if (status) {
        params.append("status", status);
      }

      if (warehouseId) {
        params.append("warehouseId", warehouseId);
      }

      const response = await makeApiRequest({
        url: `get-expiry-batches?${params.toString()}`,
        method: "GET",
      });

      if (response?.status) {
        setBatches(response.data || []);
        setTotalRecords(response.pagination?.total || 0);
      } else {
        setBatches([]);
        setTotalRecords(0);
        toast.error(response?.message || "Failed to fetch expiry batches");
      }
    } catch (error) {
      console.error("Get expiry batches error:", error);

      setBatches([]);
      setTotalRecords(0);

      toast.error(
        error?.response?.data?.message || "Failed to fetch expiry batches"
      );
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status, warehouseId]);

  useEffect(() => {
    getExpiryBatches();
  }, [getExpiryBatches]);

  useEffect(() => {
    getExpirySummary();
  }, [getExpirySummary]);

  // REFRESH
  const handleRefresh = async () => {
    await Promise.all([
      getExpiryBatches(),
      getExpirySummary(),
    ]);
  };

  // MARK BATCH EXPIRED
  const handleMarkExpired = async (batch) => {
    if (batch.expiryStatus !== "EXPIRED") {
      toast.warning("This batch has not expired yet");
      return;
    }

    if (!batch.remainingQuantity || batch.remainingQuantity <= 0) {
      toast.warning("This batch has no remaining stock");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to process expired batch ${batch.batchNumber}?\n\nRemaining quantity: ${batch.remainingQuantity}\n\nThis will remove the expired quantity from inventory.`
    );

    if (!confirmed) return;

    try {
      setProcessingId(batch._id);

      const response = await makeApiRequest({
        url: `mark-batch-expired/${batch._id}`,
        method: "PUT",
      });

      if (response?.status) {
        toast.success(
          response.message || "Expired batch processed successfully"
        );

        await Promise.all([
          getExpiryBatches(),
          getExpirySummary(),
        ]);
      } else {
        toast.error(response?.message || "Failed to process expired batch");
      }
    } catch (error) {
      console.error("Mark batch expired error:", error);

      toast.error(
        error?.response?.data?.message ||
        "Failed to process expired batch"
      );
    } finally {
      setProcessingId(null);
    }
  };

  // STATUS BADGE
  const getStatusStyle = (expiryStatus) => {
    const styles = {
      ACTIVE: {
        backgroundColor: "#d1e7dd",
        color: "#0f5132",
      },
      EXPIRING_SOON: {
        backgroundColor: "#fff3cd",
        color: "#856404",
      },
      CRITICAL: {
        backgroundColor: "#f8d7da",
        color: "#842029",
      },
      EXPIRED: {
        backgroundColor: "#dc3545",
        color: "#ffffff",
      },
    };

    return styles[expiryStatus] || {
      backgroundColor: "#e9ecef",
      color: "#212529",
    };
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // TABLE COLUMNS
  const columns = useMemo(
    () => [
      {
        name: "Product",
        minWidth: "160px",
        selector: (row) => row.productName || "-",
        sortable: true,
        cell: (row) => (
          <div style={{ padding: "8px 0" }}>
            <div style={{ fontWeight: "600", color: "#333" }}>
              {row.productName || "-"}
            </div>
            <small style={{ color: "#777" }}>
              {row.sku || "-"}
            </small>
          </div>
        ),
      },
      {
        name: "Batch Number",
        selector: (row) => row.batchNumber,
        minWidth: "130px",
        sortable: true,
      },
      {
        name: "Warehouse",
        selector: (row) => row.warehouseName,
        minWidth: "130px",
      },
      {
        name: "Manufacturing Date",
        minWidth: "145px",
        cell: (row) => formatDate(row.manufacturingDate),
      },
      {
        name: "Expiry Date",
        minWidth: "130px",
        sortable: true,
        cell: (row) => (
          <span style={{ fontWeight: "600" }}>
            {formatDate(row.expiryDate)}
          </span>
        ),
      },
      {
        name: "Remaining Qty",
        selector: (row) => row.remainingQuantity,
        minWidth: "115px",
        center: true,
        cell: (row) => (
          <span style={{ fontWeight: "600" }}>
            {row.remainingQuantity}
          </span>
        ),
      },
      {
        name: "Days Remaining",
        minWidth: "125px",
        center: true,
        cell: (row) => {
          if (row.expiryStatus === "EXPIRED") {
            return (
              <span style={{ color: "#dc3545", fontWeight: "600" }}>
                Expired
              </span>
            );
          }

          return (
            <span style={{ fontWeight: "600" }}>
              {row.daysRemaining} days
            </span>
          );
        },
      },
      {
        name: "Status",
        minWidth: "140px",
        center: true,
        cell: (row) => (
          <span
            style={{
              ...getStatusStyle(row.expiryStatus),
              padding: "6px 10px",
              borderRadius: "5px",
              fontSize: "11px",
              fontWeight: "600",
              whiteSpace: "nowrap",
            }}
          >
            {row.expiryStatus?.replaceAll("_", " ")}
          </span>
        ),
      },
      {
        name: "Action",
        minWidth: "160px",
        center: true,
        cell: (row) => (
          <button
            type="button"
            disabled={
              row.expiryStatus !== "EXPIRED" ||
              row.remainingQuantity <= 0 ||
              processingId === row._id
            }
            onClick={() => handleMarkExpired(row)}
            style={{
              backgroundColor:
                row.expiryStatus === "EXPIRED" &&
                  row.remainingQuantity > 0
                  ? "#dc3545"
                  : "#adb5bd",
              color: "#ffffff",
              border: "none",
              borderRadius: "5px",
              padding: "7px 10px",
              fontSize: "12px",
              cursor:
                row.expiryStatus === "EXPIRED" &&
                  row.remainingQuantity > 0
                  ? "pointer"
                  : "not-allowed",
              whiteSpace: "nowrap",
            }}
          >
            {processingId === row._id
              ? "Processing..."
              : row.remainingQuantity <= 0 && row.expiryStatus === "EXPIRED"
                ? "Processed"
                : "Mark Expired"}
          </button>
        ),
      },
    ],
    [processingId]
  );

  const summaryCards = [
    {
      title: "Total Batches",
      value: summary.totalBatches,
      color: "#0d6efd",
    },
    {
      title: "Active",
      value: summary.active,
      color: "#198754",
    },
    {
      title: "Expiring Soon",
      value: summary.expiringSoon,
      color: "#ffc107",
    },
    {
      title: "Critical",
      value: summary.critical,
      color: "#fd7e14",
    },
    {
      title: "Expired",
      value: summary.expired,
      color: "#dc3545",
    },
  ];

  return (
    <div className="container-fluid">
      {/* HEADER */}
      <div
        className="d-flex justify-content-between align-items-center flex-wrap"
        style={{ marginBottom: "20px", gap: "10px" }}
      >
        <div>
          <h4 style={{ marginBottom: "5px", fontWeight: "600" }}>
            Expiry Management
          </h4>
          <p style={{ color: "#777", marginBottom: 0 }}>
            Monitor product batch expiry and manage expired stock
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate("/inventory")}
        >
          <i className="fa fa-arrow-left me-2"></i>
          Back to Inventory
        </button>
        <button
          type="button"
          onClick={handleRefresh}
          style={{
            backgroundColor: "#0d6efd",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            padding: "9px 15px",
            cursor: "pointer",
          }}
        >
          <i className="fa fa-refresh me-2"></i>
          Refresh
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="row mb-4">
        {summaryCards.map((card) => (
          <div className="col-xl col-md-4 col-sm-6 mb-3" key={card.title}>
            <div
              className="card h-100"
              style={{
                border: "1px solid #eee",
                borderLeft: `4px solid ${card.color}`,
                borderRadius: "8px",
              }}
            >
              <div className="card-body">
                <p style={{ color: "#777", marginBottom: "8px" }}>
                  {card.title}
                </p>
                <h3 style={{ fontWeight: "700", margin: 0 }}>
                  {card.value}
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* EXPIRED QUANTITY */}
      <div
        className="card mb-4"
        style={{ borderRadius: "8px" }}
      >
        <div className="card-body d-flex justify-content-between align-items-center">
          <div>
            <span style={{ color: "#777" }}>
              Unprocessed Expired Quantity
            </span>
            <h4 style={{ color: "#dc3545", margin: "5px 0 0" }}>
              {summary.expiredQuantity}
            </h4>
          </div>

          <i
            className="fa fa-exclamation-triangle"
            style={{ fontSize: "30px", color: "#dc3545" }}
          ></i>
        </div>
      </div>

      {/* FILTERS */}
      <div className="card mb-3">
        <div className="card-body">
          <div className="row align-items-end">
            <div className="col-md-5 mb-3">
              <label className="form-label">Search</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search product, SKU, batch or warehouse..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label">Expiry Status</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="EXPIRING_SOON">Expiring Soon</option>
                <option value="CRITICAL">Critical</option>
                <option value="EXPIRED">Expired</option>
              </select>
            </div>

            <div className="col-md-3 mb-3">
              <button
                type="button"
                className="btn btn-secondary w-100"
                onClick={() => {
                  setSearch("");
                  setStatus("");
                  setWarehouseId("");
                  setPage(1);
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* EXPIRY TABLE */}
      <div className="card">
        <div className="card-header">
          <h5 style={{ margin: 0 }}>Expiry Batch List</h5>
        </div>

        <div className="card-body">
          <DataTable
            columns={columns}
            data={batches}
            progressPending={loading}
            pagination
            paginationServer
            paginationTotalRows={totalRecords}
            paginationDefaultPage={page}
            paginationPerPage={limit}
            paginationRowsPerPageOptions={[10, 20, 50, 100]}
            onChangePage={(nextPage) => setPage(nextPage)}
            onChangeRowsPerPage={(nextLimit) => {
              setLimit(nextLimit);
              setPage(1);
            }}
            highlightOnHover
            responsive
            striped
            persistTableHead
            noDataComponent="No expiry batches found"
          />
        </div>
      </div>
    </div>
  );
}

export default ExpiryManagement;