
import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { makeApiRequest } from "../../AxiosServices/apiCall";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEye,
  faPenToSquare,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

function ProductVariants() {
  const navigate = useNavigate();

  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);

  const getVariants = async () => {
    try {
      setLoading(true);

      const result = await makeApiRequest({
        url: "getproduct-variant",
        method: "GET",
      });

      if (result?.status && Array.isArray(result.data)) {
        setVariants(result.data);
      } else {
        setVariants([]);
        toast.error(result?.message || "Failed to fetch variants");
      }
    } catch (error) {
      console.log("Get variants error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to fetch variants"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getVariants();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this variant?")) {
      return;
    }

    try {
      const result = await makeApiRequest({
        url: `deleteproduct-variant/${id}`,
        method: "DELETE",
      });

      if (result?.status) {
        toast.success(result.message || "Variant deleted successfully");
        getVariants();
      } else {
        toast.error(result?.message || "Delete failed");
      }
    } catch (error) {
      console.log("Delete variant error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to delete variant"
      );
    }
  };

  const columns = [
    {
      name: "S.No",
      width: "75px",
      cell: (row, index) => index + 1,
    },
    {
      name: "Product",
      selector: (row) => row.product?.name || "-",
      sortable: true,
      minWidth: "180px",
    },
    {
      name: "Variant Type",
      selector: (row) => row.variantType || "-",
      sortable: true,
      width: "140px",
    },
    {
      name: "Variant Name",
      selector: (row) => row.variantName || "-",
      sortable: true,
      minWidth: "150px",
    },
    {
      name: "SKU",
      selector: (row) => row.sku || "-",
      sortable: true,
      minWidth: "130px",
    },
    {
      name: "Price",
      selector: (row) => row.price ?? 0,
      sortable: true,
      width: "110px",
      cell: (row) => `₹${Number(row.price || 0).toFixed(2)}`,
    },
    {
      name: "Stock",
      selector: (row) => row.stock ?? 0,
      sortable: true,
      width: "100px",
    },
    {
      name: "Barcode",
      selector: (row) => row.barcode || "-",
      minWidth: "140px",
    },
    {
      name: "Actions",
      width: "180px",
      center: true,
      cell: (row) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            width: "100%",
          }}
        >
          {/* VIEW */}
          <button
            type="button"
            title="View Variant"
            onClick={() =>
              navigate(`/view-product-variant/${row._id}`)
            }
            style={{
              width: "35px",
              height: "35px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#0dcaf0",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            <FontAwesomeIcon icon={faEye} />
          </button>

          {/* EDIT */}
          <button
            type="button"
            title="Edit Variant"
            onClick={() =>
              navigate(`/edit-product-variant/${row._id}`)
            }
            style={{
              width: "35px",
              height: "35px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#0d6efd",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            <FontAwesomeIcon icon={faPenToSquare} />
          </button>

          {/* DELETE */}
          <button
            type="button"
            title="Delete Variant"
            onClick={() => handleDelete(row._id)}
            style={{
              width: "35px",
              height: "35px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#dc3545",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },


  ];

  return (
    <div className="container-fluid py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Product Variants</h4>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => navigate("/create-product-variant")}
        >
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Add Variant
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <DataTable
            columns={columns}
            data={variants}
            keyField="_id"
            progressPending={loading}
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 25, 50]}
            highlightOnHover
            responsive
            persistTableHead
            noDataComponent="No product variants found"
          />
        </div>
      </div>
    </div>
  );
}

export default ProductVariants;
