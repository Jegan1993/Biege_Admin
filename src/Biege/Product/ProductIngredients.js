
import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEye,
  faPenToSquare,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { makeApiRequest } from "../../AxiosServices/apiCall";

function ProductIngredients() {
  const navigate = useNavigate();

  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getIngredients();
  }, []);

  // GET ALL PRODUCT INGREDIENTS
  const getIngredients = async () => {
    try {
      setLoading(true);

      const response = await makeApiRequest({
        url: "getproduct-ingredients",
        method: "GET",
      });

      if (response?.status) {
        setIngredients(response.data || []);
      } else {
        setIngredients([]);
        toast.error(
          response?.message || "Failed to fetch product ingredients"
        );
      }
    } catch (error) {
      console.error("Get ingredients error:", error);
      toast.error(
        error?.response?.data?.message ||
        "Failed to fetch product ingredients"
      );
    } finally {
      setLoading(false);
    }
  };

  // DELETE INGREDIENTS
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete these ingredients?")) {
      return;
    }

    try {
      const response = await makeApiRequest({
        url: `deleteproduct-ingredients/${id}`,
        method: "DELETE",
      });

      if (response?.status) {
        toast.success(response.message || "Ingredients deleted successfully");
        getIngredients();
      } else {
        toast.error(response?.message || "Failed to delete ingredients");
      }
    } catch (error) {
      console.error("Delete ingredients error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to delete ingredients"
      );
    }
  };

  const columns = [
    {
      name: "S.No",
      width: "80px",
      center: true,
      cell: (row, index) => index + 1,
    },
    {
      name: "Product Name",
      selector: (row) => row.productId?.name || "N/A",
      sortable: true,
      minWidth: "180px",
    },
    {
      name: "Product Type",
      selector: (row) => row.productId?.type || "N/A",
      sortable: true,
    },
    {
      name: "Ingredients",
      selector: (row) => row.ingredientList?.length || 0,
      center: true,
      sortable: true,
    },
    {
      name: "Key Actives",
      selector: (row) => row.keyActives?.length || 0,
      center: true,
      sortable: true,
    },
    {
      name: "Fragrance Free",
      center: true,
      cell: (row) => (
        <span className={`badge ${row.freeFrom?.fragranceFree ? "bg-success" : "bg-secondary"}`}>
          {row.freeFrom?.fragranceFree ? "Yes" : "No"}
        </span>
      ),
    },
    {
      name: "Paraben Free",
      center: true,
      cell: (row) => (
        <span className={`badge ${row.freeFrom?.parabenFree ? "bg-success" : "bg-secondary"}`}>
          {row.freeFrom?.parabenFree ? "Yes" : "No"}
        </span>
      ),
    },
    {
      name: "Actions",
      width: "190px",
      center: true,
      cell: (row) => (
        <div className="d-flex align-items-center justify-content-center gap-2">
          {/* VIEW */}
          <button
            type="button"
            title="View"
            onClick={() =>
              navigate(`/view-product-ingredients/${row.productId?._id}`)
            }
            style={{
              width: "34px",
              height: "34px",
              border: "none",
              borderRadius: "5px",
              backgroundColor: "#0dcaf0",
              color: "#fff",
            }}
          >
            <FontAwesomeIcon icon={faEye} />
          </button>

          {/* EDIT */}
          <button
            type="button"
            title="Edit"
            onClick={() =>
              navigate(`/edit-product-ingredients/${row.productId?._id}`)
            }
            style={{
              width: "34px",
              height: "34px",
              border: "none",
              borderRadius: "5px",
              backgroundColor: "#0d6efd",
              color: "#fff",
            }}
          >
            <FontAwesomeIcon icon={faPenToSquare} />
          </button>

          {/* DELETE */}
          <button
            type="button"
            title="Delete"
            onClick={() => handleDelete(row.productId?._id)}
            style={{
              width: "34px",
              height: "34px",
              border: "none",
              borderRadius: "5px",
              backgroundColor: "#dc3545",
              color: "#fff",
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
    <div className="container-fluid mt-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Product Ingredients</h4>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => navigate("/create-product-ingredients")}
        >
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Add Ingredients
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <DataTable
            columns={columns}
            data={ingredients}
            progressPending={loading}
            pagination
            highlightOnHover
            responsive
            persistTableHead
            noDataComponent="No product ingredients found"
          />
        </div>
      </div>
    </div>
  );
}

export default ProductIngredients;
