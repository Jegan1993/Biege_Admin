
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";
import { makeApiRequest } from "../../AxiosServices/apiCall";

function ViewProductVariant() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [variant, setVariant] = useState(null);
  const [loading, setLoading] = useState(false);
  console.log('variant-------------', variant)
  useEffect(() => {
    getVariant();
  }, [id]);

  const getVariant = async () => {
    try {
      setLoading(true);

      const response = await makeApiRequest({
        url: `getproduct-variant/${id}`,
        method: "GET",
      });

      console.log('response-------------------22222', response)

      if (response?.status) {
        setVariant(response.data);
      } else {
        toast.error(response?.message || "Failed to fetch variant");
      }
    } catch (error) {
      console.error("Get variant error:", error);
      toast.error(
        error?.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-4">Loading variant details...</div>;
  }

  if (!variant) {
    return (
      <div className="container mt-4">
        <p className="text-danger">Product variant not found.</p>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/product-variants")}
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Back
        </button>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>View Product Variant</h4>

        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/product-variants")}
          >
            <FontAwesomeIcon icon={faArrowLeft} /> Back
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate(`/edit-product-variant/${id}`)}
          >
            <FontAwesomeIcon icon={faPenToSquare} /> Edit
          </button>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header">
          <h5 className="mb-0">Variant Information</h5>
        </div>

        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-bold">Product Name</label>
              <p className="form-control bg-light">
                {variant.product?.name || "N/A"}
              </p>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-bold">Product SKU</label>
              <p className="form-control bg-light">
                {variant?.sku || "N/A"}
              </p>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-bold">Variant Type</label>
              <p className="form-control bg-light">
                {variant.variantType || "N/A"}
              </p>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-bold">Variant Name</label>
              <p className="form-control bg-light">
                {variant.variantName || "N/A"}
              </p>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-bold">Variant SKU</label>
              <p className="form-control bg-light">
                {variant.sku || "N/A"}
              </p>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-bold">Price</label>
              <p className="form-control bg-light">
                ₹{Number(variant.price || 0).toFixed(2)}
              </p>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-bold">Stock</label>
              <p className="form-control bg-light">
                {variant.stock ?? 0}
              </p>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-bold">Barcode</label>
              <p className="form-control bg-light">
                {variant.barcode || "N/A"}
              </p>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-bold">Created At</label>
              <p className="form-control bg-light">
                {variant.createdAt
                  ? new Date(variant.createdAt).toLocaleString()
                  : "N/A"}
              </p>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-bold">Updated At</label>
              <p className="form-control bg-light">
                {variant.updatedAt
                  ? new Date(variant.updatedAt).toLocaleString()
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewProductVariant;
