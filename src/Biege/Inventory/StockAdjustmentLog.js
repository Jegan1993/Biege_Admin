
import React, { useCallback, useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";
import { makeApiRequest } from "../../AxiosServices/apiCall";

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
      fontSize: "12px",
      fontWeight: "600",
      color: "#343a40",
    },
  },
  rows: {
    style: {
      minHeight: "60px",
      fontSize: "13px",
      color: "#495057",
    },
  },
};

function getReferenceName(value, fields = []) {
  if (!value || typeof value !== "object") return "N/A";

  for (const field of fields) {
    if (value[field]) return value[field];
  }

  return "N/A";
}

function StockAdjustmentLog({ warehouses = [], onBack }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [warehouseId, setWarehouseId] = useState("");

  const getAdjustmentLogs = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (reason) params.append("reason", reason);
      if (warehouseId) params.append("warehouseId", warehouseId);

      const query = params.toString();

      // Change this URL only if your backend GET route has a different name.
      const url = query
        ? `get-stock-movements?${query}`
        : "get-stock-movements";

      const response = await makeApiRequest({
        url,
        method: "GET",
      });

      const result = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.data?.data)
          ? response.data.data
          : [];

      if (response?.status) {
        setLogs(result);
      } else {
        setLogs([]);
        toast.error(response?.message || "Failed to fetch adjustment log");
      }
    } catch (error) {
      console.error("Adjustment log error:", error);
      setLogs([]);

      toast.error(
        error?.response?.data?.message ||
        "Failed to fetch adjustment log"
      );
    } finally {
      setLoading(false);
    }
  }, [reason, warehouseId]);

  useEffect(() => {
    getAdjustmentLogs();
  }, [getAdjustmentLogs]);

  const columns = [
    {
      name: "DATE AND TIME",
      minWidth: "170px",
      selector: (row) => row.createdAt || "",
      sortable: true,
      cell: (row) =>
        row.createdAt
          ? new Date(row.createdAt).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
          : "N/A",
    },
    {
      name: "SKU",
      minWidth: "130px",
      selector: (row) =>
        row.sku || row.inventoryId?.sku || row.variantId?.sku || "N/A",
    },
    {
      name: "WAREHOUSE",
      minWidth: "140px",
      selector: (row) =>
        getReferenceName(row.warehouseId, ["name", "warehouseName"]),
    },
    {
      name: "REASON",
      minWidth: "120px",
      selector: (row) => row.reason || "N/A",
      cell: (row) => {
        const reasonLabel = (row.reason || "N/A").replaceAll("_", " ");

        return (
          <span
            style={{
              backgroundColor:
                row.reason === "DAMAGED"
                  ? "#f8d7da"
                  : row.reason === "EXPIRED"
                    ? "#fff3cd"
                    : "#e2e3e5",
              color:
                row.reason === "DAMAGED"
                  ? "#842029"
                  : row.reason === "EXPIRED"
                    ? "#664d03"
                    : "#41464b",
              padding: "5px 10px",
              borderRadius: "15px",
              fontSize: "11px",
              fontWeight: "600",
            }}
          >
            {reasonLabel}
          </span>
        );
      },
    },
    {
      name: "CHANGE",
      width: "100px",
      center: true,
      selector: (row) => {
        if (row.movementType === "OUT") {
          return -Number(row.quantity || 0);
        }

        if (row.movementType === "IN") {
          return Number(row.quantity || 0);
        }

        return (
          Number(row.afterQuantity || 0) -
          Number(row.beforeQuantity || 0)
        );
      },
      cell: (row) => {
        const change =
          row.movementType === "OUT"
            ? -Number(row.quantity || 0)
            : row.movementType === "IN"
              ? Number(row.quantity || 0)
              : Number(row.afterQuantity || 0) -
              Number(row.beforeQuantity || 0);

        return (
          <strong
            style={{
              color: change < 0 ? "#dc3545" : "#198754",
            }}
          >
            {change > 0 ? `+${change}` : change}
          </strong>
        );
      },
    },
    {
      name: "BATCH",
      minWidth: "120px",
      selector: (row) =>
        row.batchId?.batchNumber ||
        row.batchNumber ||
        "N/A",
    },
    {
      name: "STOCK AFTER",
      width: "120px",
      center: true,
      selector: (row) => row.afterQuantity ?? "N/A",
    },
    {
      name: "ADJUSTED BY",
      minWidth: "150px",
      selector: (row) =>
        getReferenceName(row.performedBy, [
          "name",
          "username",
          "email",
        ]),
    },
    {
      name: "NOTE",
      minWidth: "180px",
      selector: (row) => row.notes || "N/A",
      wrap: true,
    },
  ];

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <h5 className="mb-1">Adjustment Log</h5>
          <small className="text-muted">
            Every stock movement is recorded here and cannot be edited.
          </small>
        </div>

        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={onBack}
        >
          <i className="fa fa-arrow-left me-2"></i>
          Back to Inventory
        </button>
      </div>

      <div className="card-body">
        <div className="row g-3 mb-3">
          <div className="col-md-4">
            <label className="form-label">Warehouse</label>

            <select
              className="form-select"
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
            >
              <option value="">All warehouses</option>

              {warehouses.map((warehouse) => (
                <option key={warehouse._id} value={warehouse._id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">Reason</label>

            <select
              className="form-select"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              <option value="">All reasons</option>
              <option value="DAMAGED">Damaged</option>
              <option value="EXPIRED">Expired</option>
              <option value="CORRECTION">Correction</option>
              <option value="RECEIVED">Received</option>
            </select>
          </div>

          <div className="col-md-4 d-flex align-items-end">
            <button
              type="button"
              className="btn btn-primary w-100"
              onClick={getAdjustmentLogs}
              disabled={loading}
            >
              <i className="fa fa-refresh me-2"></i>
              Refresh Log
            </button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={logs}
          customStyles={tableCustomStyles}
          progressPending={loading}
          progressComponent={
            <div className="p-4">Loading adjustment history...</div>
          }
          noDataComponent={
            <div className="p-4 text-muted">
              No adjustment history found
            </div>
          }
          pagination
          paginationPerPage={10}
          paginationRowsPerPageOptions={[10, 20, 50, 100]}
          responsive
          highlightOnHover
          persistTableHead
          striped
        />
      </div>
    </div>
  );
}

export default StockAdjustmentLog;
