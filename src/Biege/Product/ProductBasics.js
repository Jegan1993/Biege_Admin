
import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { makeApiRequest } from "../../AxiosServices/apiCall";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {

  faTrash,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FaEdit } from "react-icons/fa";
function ProductBasics() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Fetch all basic products
  const getProducts = async () => {
    try {
      setLoading(true);

      const response = await makeApiRequest({
        url: "getproduct-basics",
        method: "GET",
      });

      const result = response?.data.data || response;

      if (result?.status) {
        setProducts(result.data || []);
      } else {
        toast.error(result?.message || "Failed to fetch products");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  // Add Basic Product
  const handleAdd = () => {
    navigate("/add-product-basic");
  };

  // Delete Basic Product
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) return;

    try {
      const response = await makeApiRequest({
        url: `deleteproduct-basics/${id}`,
        method: "DELETE",
      });

      const result = response?.data.data || response;
      console.log('result------------', result)
      if (result?.status) {
        toast.success("Product deleted successfully");
        getProducts();
      } else {
        toast.error(result?.message || "Delete failed");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Delete failed"
      );
    }
  };

  // Search
  const filteredProducts = products.filter((product) => {
    const searchValue = search.toLowerCase();

    return (
      product.name?.toLowerCase().includes(searchValue) ||
      product.slug?.toLowerCase().includes(searchValue) ||
      product.category?.toLowerCase().includes(searchValue) ||
      product.brandLine?.toLowerCase().includes(searchValue)
    );
  });

  // Table columns
  const columns = [
    {
      name: "S.No",
      width: "75px",
      cell: (row) => (
        <span>{filteredProducts.indexOf(row) + 1}</span>
      ),
    },
    {
      name: "Product Name",
      selector: (row) => row.name,
      sortable: true,
      minWidth: "180px",
    },
    {
      name: "Slug",
      selector: (row) => row.slug,
      sortable: true,
      minWidth: "160px",
    },
    {
      name: "Type",
      selector: (row) => row.type,
      sortable: true,
      minWidth: "120px",
    },
    {
      name: "Brand Line",
      selector: (row) => row.brandLine || "-",
      sortable: true,
      minWidth: "140px",
    },
    {
      name: "Category",
      selector: (row) => row.category || "-",
      sortable: true,
      minWidth: "130px",
    },
    {
      name: "Collections",
      cell: (row) =>
        Array.isArray(row.collections)
          ? row.collections.join(", ")
          : "-",
      minWidth: "160px",
    },
    {
      name: "Status",
      cell: (row) => (
        <span
          className={`badge ${row.status === "ACTIVE"
            ? "bg-success"
            : row.status === "ARCHIVED"
              ? "bg-danger"
              : "bg-warning text-dark"
            }`}
        >
          {row.status}
        </span>
      ),
      sortable: true,
    },


    {
      name: "Action",
      width: "220px",
      minWidth: "220px",
      grow: 0,
      allowOverflow: true,
      ignoreRowClick: true,
      cell: (row) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: "8px",
            width: "100%",
            flexWrap: "nowrap",
          }}
        >
          <button
            type="button"
            onClick={() => navigate(`/edit-product-basic/${row._id}`)}
            style={{
              flexShrink: 0,
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              padding: "6px 10px",
              backgroundColor: "#0d6efd",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            <FaEdit />
            Edit
          </button>

          <button
            type="button"
            onClick={() => handleDelete(row._id)}
            style={{
              flexShrink: 0,
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              padding: "6px 10px",
              backgroundColor: "#dc3545",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            <FontAwesomeIcon icon={faTrash} />
            Delete
          </button>
        </div>
      ),
    }

  ];
  const handleBack = () => {
    navigate("/view-product")
  }
  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Product Basic Details</h4>

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleAdd}
        >
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Add Basic Product
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleBack}
        >
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Back
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Search product..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <DataTable
            columns={columns}
            data={filteredProducts}
            progressPending={loading}
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 25, 50]}
            highlightOnHover
            responsive
            striped
            persistTableHead
            noDataComponent="No basic products found"
          />
        </div>
      </div>
    </div>
  );
}

export default ProductBasics;
