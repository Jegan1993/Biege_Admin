
import React, { useState } from "react";
import { toast } from "react-toastify";
import { makeApiRequest } from "../../../AxiosServices/apiCall.js";

const LOOK_OPTIONS = [
  "NATURAL",
  "BRIDAL",
  "PARTY",
  "OFFICE",
  "GLAM",
  "SMOKEY",
  "EVERYDAY",
  "MINIMAL",
];

const FINISH_OPTIONS = [
  "MATTE",
  "DEWY",
  "SATIN",
  "SHIMMER",
];

const COVERAGE_OPTIONS = [
  "SHEER",
  "MEDIUM",
  "FULL",
];

const LookAIRecommendations = ({ productId }) => {
  const [looks, setLooks] = useState([]);
  const [productRole, setProductRole] = useState("");
  const [finish, setFinish] = useState("");
  const [coverage, setCoverage] = useState("");

  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // HANDLE LOOK SELECTION
  const handleLookChange = (look, checked) => {
    setLooks((previous) =>
      checked
        ? [...previous, look]
        : previous.filter((item) => item !== look)
    );
  };

  // GET LOOK AI RECOMMENDATIONS
  const handleGetRecommendations = async (event) => {
    event.preventDefault();

    if (!productId) {
      toast.error("Product not found");
      return;
    }

    if (
      looks.length === 0 &&
      !productRole.trim() &&
      !finish &&
      !coverage
    ) {
      toast.error("Please select at least one preference");
      return;
    }

    try {
      setLoading(true);
      setSearched(false);
      setRecommendations([]);

      const payload = {
        productId,
        looks,
        productRole: productRole.trim().toUpperCase(),
        finish,
        coverage,
      };

      const response = await makeApiRequest({
        url: "look-ai/recommendations",
        method: "POST",
        data: payload,
      });

      if (!response?.status) {
        toast.error(
          response?.message ||
          "Unable to get Look AI recommendations"
        );
        return;
      }

      const responseData = response.data?.data || response.data;

      const recommendationList = Array.isArray(
        responseData?.recommendations
      )
        ? responseData.recommendations
        : [];

      setRecommendations(recommendationList);
      setSearched(true);

      if (recommendationList.length === 0) {
        toast.info("No matching beauty products found");
      } else {
        toast.success("Look AI recommendations fetched successfully");
      }
    } catch (error) {
      console.error("Look AI recommendation error:", error);

      toast.error(
        error?.response?.data?.message ||
        "Unable to fetch Look AI recommendations"
      );
    } finally {
      setLoading(false);
    }
  };

  // FORMAT ENUM LABEL
  const formatLabel = (value) => {
    if (!value) return "-";

    return String(value)
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <div>
      {/* LOOK AI PREFERENCES */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">Look AI Preferences</h5>
        </div>

        <div className="card-body">
          <form onSubmit={handleGetRecommendations}>
            {/* SUITABLE LOOKS */}
            <div className="mb-4">
              <label className="form-label fw-semibold">
                Select Suitable Looks
              </label>

              <div className="row">
                {LOOK_OPTIONS.map((look) => (
                  <div className="col-md-3 col-6 mb-2" key={look}>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id={`look-${look}`}
                        checked={looks.includes(look)}
                        onChange={(event) =>
                          handleLookChange(
                            look,
                            event.target.checked
                          )
                        }
                      />

                      <label
                        className="form-check-label"
                        htmlFor={`look-${look}`}
                      >
                        {formatLabel(look)}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PRODUCT ROLE */}
            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label fw-semibold">
                  Product Role
                </label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Example: LIPSTICK"
                  value={productRole}
                  onChange={(event) =>
                    setProductRole(event.target.value)
                  }
                />
              </div>

              {/* FINISH */}
              <div className="col-md-4 mb-3">
                <label className="form-label fw-semibold">
                  Finish
                </label>

                <select
                  className="form-select"
                  value={finish}
                  onChange={(event) =>
                    setFinish(event.target.value)
                  }
                >
                  <option value="">Select Finish</option>

                  {FINISH_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {formatLabel(item)}
                    </option>
                  ))}
                </select>
              </div>

              {/* COVERAGE */}
              <div className="col-md-4 mb-3">
                <label className="form-label fw-semibold">
                  Coverage
                </label>

                <select
                  className="form-select"
                  value={coverage}
                  onChange={(event) =>
                    setCoverage(event.target.value)
                  }
                >
                  <option value="">Select Coverage</option>

                  {COVERAGE_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {formatLabel(item)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* SUBMIT */}
            <div className="d-flex justify-content-end">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Getting Recommendations...
                  </>
                ) : (
                  "Get Look AI Recommendations"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* RECOMMENDATION RESULTS */}
      {searched && (
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              Look AI Results
            </h5>

            <span className="badge bg-primary">
              {recommendations.length} Products
            </span>
          </div>

          <div className="card-body">
            {recommendations.length === 0 ? (
              <div className="alert alert-info mb-0">
                No matching products found for the selected preferences.
              </div>
            ) : (
              <div className="row">
                {recommendations.map((item, index) => {
                  const product = item.product || {};
                  const recommendation =
                    item.recommendation || {};
                  const beauty = item.aiTags?.beauty || {};

                  return (
                    <div
                      className="col-md-6 col-lg-4 mb-4"
                      key={product._id || index}
                    >
                      <div className="card h-100">
                        {product.image && (
                          <img
                            src={product.image}
                            className="card-img-top"
                            alt={product.name || "Product"}
                            style={{
                              height: "220px",
                              objectFit: "contain",
                              padding: "12px",
                            }}
                          />
                        )}

                        <div className="card-body">
                          <h6 className="fw-bold">
                            {product.name || "Unnamed Product"}
                          </h6>

                          <p className="text-muted small mb-2">
                            SKU: {product.sku || "-"}
                          </p>

                          <p className="mb-2">
                            <strong>Price:</strong>{" "}
                            {product.price ?? "-"}
                          </p>

                          <p className="mb-2">
                            <strong>Match Score:</strong>{" "}
                            {item.matchScore ?? 0}
                          </p>

                          <hr />

                          <p className="mb-1">
                            <strong>Product Role:</strong>{" "}
                            {formatLabel(beauty.productRole)}
                          </p>

                          <p className="mb-1">
                            <strong>Finish:</strong>{" "}
                            {formatLabel(beauty.finish)}
                          </p>

                          <p className="mb-1">
                            <strong>Coverage:</strong>{" "}
                            {formatLabel(beauty.coverage)}
                          </p>

                          <p className="mb-2">
                            <strong>Suitable Looks:</strong>
                          </p>

                          <div className="d-flex flex-wrap gap-1 mb-3">
                            {(item.matchedLooks || []).map(
                              (look) => (
                                <span
                                  className="badge bg-success"
                                  key={look}
                                >
                                  {formatLabel(look)}
                                </span>
                              )
                            )}
                          </div>

                          {item.matchReasons?.length > 0 && (
                            <>
                              <strong>Match Reasons</strong>

                              <ul className="small mt-2">
                                {item.matchReasons.map(
                                  (reason, reasonIndex) => (
                                    <li key={reasonIndex}>
                                      {reason}
                                    </li>
                                  )
                                )}
                              </ul>
                            </>
                          )}

                          {recommendation.title && (
                            <>
                              <hr />

                              <h6>
                                {recommendation.title}
                              </h6>

                              {recommendation.reason && (
                                <p className="small">
                                  {recommendation.reason}
                                </p>
                              )}

                              {recommendation.benefits && (
                                <p className="small">
                                  <strong>Benefits:</strong>{" "}
                                  {Array.isArray(
                                    recommendation.benefits
                                  )
                                    ? recommendation.benefits.join(", ")
                                    : recommendation.benefits}
                                </p>
                              )}

                              {recommendation.usage && (
                                <p className="small mb-0">
                                  <strong>Usage:</strong>{" "}
                                  {recommendation.usage}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LookAIRecommendations;
