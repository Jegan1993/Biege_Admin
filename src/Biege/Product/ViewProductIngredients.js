
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";
import { makeApiRequest } from "../../AxiosServices/apiCall";

function ViewProductIngredients() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [ingredients, setIngredients] = useState(null);
  const [loading, setLoading] = useState(false);
  console.log('ingredients111111111111111--', ingredients)
  useEffect(() => {
    getIngredients();
  }, [id]);

  // GET PRODUCT INGREDIENTS BY PRODUCT ID
  const getIngredients = async () => {
    try {
      setLoading(true);

      const response = await makeApiRequest({
        url: `getproduct-ingredients/${id}`,
        method: "GET",
      });

      if (response?.status) {
        setIngredients(response.data);
      } else {
        setIngredients(null);
        toast.error(
          response?.message || "Failed to fetch product ingredients"
        );
      }
    } catch (error) {
      console.error("Get product ingredients error:", error);
      toast.error(
        error?.response?.data?.message ||
        "Failed to fetch product ingredients"
      );
    } finally {
      setLoading(false);
    }
  };

  const freeFrom = ingredients?.freeFrom || {};

  const freeFromOptions = [
    { label: "Fragrance Free", value: freeFrom.fragranceFree },
    { label: "Paraben Free", value: freeFrom.parabenFree },
    { label: "Vegan", value: freeFrom.vegan },
    { label: "Cruelty Free", value: freeFrom.crueltyFree },
  ];

  if (loading) {
    return (
      <div className="text-center mt-4">
        Loading product ingredients...
      </div>
    );
  }

  if (!ingredients) {
    return (
      <div className="container-fluid mt-4">
        <div className="alert alert-warning">
          Product ingredients not found.
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate("/product-ingredients")}
        >
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-3">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>View Product Ingredients</h4>

        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/product-ingredients")}
          >
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            Back
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() =>
              navigate(`/edit-product-ingredients/${id}`)
            }
          >
            <FontAwesomeIcon icon={faPenToSquare} className="me-2" />
            Edit
          </button>
        </div>
      </div>

      {/* PRODUCT INFORMATION */}
      <div className="card shadow-sm mb-4">
        <div className="card-header">
          <h5 className="mb-0">Product Information</h5>
        </div>

        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label fw-bold">Product Name</label>
              <p className="form-control bg-light">
                {ingredients.productId?.name || "N/A"}
              </p>
            </div>

            {/* <div className="col-md-4">
              <label className="form-label fw-bold">Product Slug</label>
              <p className="form-control bg-light">
                {ingredients.productId?.slug || "N/A"}
              </p>
            </div> */}

            <div className="col-md-4">
              <label className="form-label fw-bold">Product Type</label>
              <p className="form-control bg-light">
                {ingredients.productId?.type || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* INGREDIENT LIST */}
      <div className="card shadow-sm mb-4">
        <div className="card-header">
          <h5 className="mb-0">Ingredient List</h5>
        </div>

        <div className="card-body">
          {ingredients.ingredientList?.length > 0 ? (
            <div className="d-flex flex-wrap gap-2">
              {ingredients.ingredientList.map((item, index) => (
                <span
                  key={index}
                  className="badge bg-primary p-2"
                  style={{ fontSize: "13px" }}
                >
                  {item}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-muted mb-0">
              No ingredients added.
            </p>
          )}
        </div>
      </div>

      {/* KEY ACTIVES */}
      <div className="card shadow-sm mb-4">
        <div className="card-header">
          <h5 className="mb-0">Key Actives</h5>
        </div>

        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: "80px" }}>S.No</th>
                  <th>Active Ingredient</th>
                  <th>Percentage (%)</th>
                </tr>
              </thead>

              <tbody>
                {ingredients.keyActives?.length > 0 ? (
                  ingredients.keyActives.map((active, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{active.name}</td>
                      <td>{active.percentage}%</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center text-muted">
                      No key actives added.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FREE FROM */}
      <div className="card shadow-sm mb-4">
        <div className="card-header">
          <h5 className="mb-0">Free From Information</h5>
        </div>

        <div className="card-body">
          <div className="row g-3">
            {freeFromOptions.map((item) => (
              <div className="col-md-3 col-sm-6" key={item.label}>
                <div className="border rounded p-3 d-flex justify-content-between align-items-center">
                  <span className="fw-semibold">{item.label}</span>

                  <span
                    className={`badge ${item.value ? "bg-success" : "bg-secondary"
                      }`}
                  >
                    {item.value ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TIMESTAMPS */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <label className="fw-bold">Created At</label>
              <p className="text-muted">
                {ingredients.createdAt
                  ? new Date(ingredients.createdAt).toLocaleString()
                  : "N/A"}
              </p>
            </div>

            <div className="col-md-6">
              <label className="fw-bold">Updated At</label>
              <p className="text-muted">
                {ingredients.updatedAt
                  ? new Date(ingredients.updatedAt).toLocaleString()
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewProductIngredients;
