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

function ProductMedia() {
  const navigate = useNavigate();

  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(false);

  // GET ALL PRODUCT MEDIA
  const getAllProductMedia = async () => {
    try {
      setLoading(true);

      const result = await makeApiRequest({
        url: "getproduct-media",
        method: "GET",
      });

      if (result?.status && Array.isArray(result.data)) {
        setMediaList(result.data);
      } else {
        setMediaList([]);
        toast.error(result?.message || "Failed to fetch product media");
      }
    } catch (error) {
      console.log("Get product media error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to fetch product media"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllProductMedia();
  }, []);

  // DELETE PRODUCT MEDIA
  const handleDelete = async (productId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this product media?"
      )
    ) {
      return;
    }

    try {
      const result = await makeApiRequest({
        url: `deleteproduct-media/${productId}`,
        method: "DELETE",
      });

      if (result?.status) {
        toast.success(result.message || "Product media deleted successfully");
        getAllProductMedia();
      } else {
        toast.error(result?.message || "Delete failed");
      }
    } catch (error) {
      console.log("Delete media error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to delete product media"
      );
    }
  };

  // DATATABLE COLUMNS
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
      minWidth: "180px",
    },
    {
      name: "Main Image",
      width: "120px",
      cell: (row) =>
        row.mainImage ? (
          <img
            src={row.mainImage}
            alt={row.productDetails?.name || "Product"}
            style={{
              width: "55px",
              height: "55px",
              objectFit: "contain",
              borderRadius: "5px",
            }}
          />
        ) : (
          "-"
        ),
    },
    {
      name: "Total Images",
      selector: (row) => row.images?.length || 0,
      sortable: true,
      width: "120px",
    },
    {
      name: "Video",
      width: "130px",
      cell: (row) =>
        row.video ? (
          <a href={row.video} target="_blank" rel="noreferrer">
            View Video
          </a>
        ) : (
          "-"
        ),
    },
    {
      name: "Actions",
      width: "190px",
      center: true,
      cell: (row) => {
        const productId = row.product?._id || row.product;

        return (
          <div
            className="d-flex align-items-center justify-content-center"
            style={{ gap: "8px", minWidth: "150px" }}
          >
            {/* EDIT BUTTON */}
            <button
              type="button"
              title="Edit Media"
              onClick={() =>
                navigate(`/edit-product-media/${productId}`)
              }
              style={{
                width: "34px",
                height: "34px",
                border: "none",
                borderRadius: "4px",
                backgroundColor: "#0d6efd",
                color: "#ffffff",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "15px",
              }}
            >
              <FontAwesomeIcon icon={faPenToSquare} />
            </button>

            {/* VIEW BUTTON */}
            <button
              type="button"
              title="View Media"
              onClick={() =>
                navigate(`/view-product-media/${productId}`)
              }
              style={{
                width: "34px",
                height: "34px",
                border: "none",
                borderRadius: "4px",
                backgroundColor: "#0dcaf0",
                color: "#ffffff",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "15px",
              }}
            >
              <FontAwesomeIcon icon={faEye} />
            </button>

            {/* DELETE BUTTON */}
            <button
              type="button"
              title="Delete Media"
              onClick={() => handleDelete(productId)}
              style={{
                width: "34px",
                height: "34px",
                border: "none",
                borderRadius: "4px",
                backgroundColor: "#dc3545",
                color: "#ffffff",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "15px",
              }}
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        );
      },
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  return (
    <div className="container-fluid py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Product Media</h4>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => navigate("/create-product-media")}
        >
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Add Media
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <DataTable
            columns={columns}
            data={mediaList}
            keyField="_id"
            progressPending={loading}
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 25, 50]}
            highlightOnHover
            responsive
            persistTableHead
            noDataComponent="No product media found"
          />
        </div>
      </div>
    </div>
  );
}

export default ProductMedia;