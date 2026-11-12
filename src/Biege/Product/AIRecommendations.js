
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { makeApiRequest } from "../../AxiosServices/apiCall";

const AIRecommendations = ({ analysisId, productId }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);

  // Fetch AI Recommendations
  const fetchRecommendations = useCallback(async () => {
    if (!analysisId || !productId) {
      setRecommendations([]);
      setAnalysisResult(null);
      return;
    }

    try {
      setLoading(true);
      setRecommendations([]);
      setAnalysisResult(null);

      const response = await makeApiRequest({
        url: `skin-ai/recommendations/${encodeURIComponent(
          analysisId
        )}?productId=${encodeURIComponent(productId)}`,
        method: "GET",
      });
      if (!response?.status) {
        setRecommendations([]);
        setAnalysisResult(null);

        toast.error(
          response?.message || "Unable to fetch recommendations"
        );

        return;
      }

      const result = response.data?.data || response.data || {};

      setAnalysisResult(result);

      const items = Array.isArray(result.recommendations)
        ? result.recommendations
        : Array.isArray(result.products)
          ? result.products
          : [];

      setRecommendations(items);
    } catch (error) {
      console.error("AI recommendation error:", error);

      setRecommendations([]);
      setAnalysisResult(null);

      toast.error(
        error?.response?.data?.message ||
        "Unable to fetch AI recommendations"
      );
    } finally {
      setLoading(false);
    }
  }, [analysisId, productId]);

  useEffect(() => {
    if (analysisId && productId) {
      fetchRecommendations();
    }
  }, [analysisId, productId, fetchRecommendations]);

  // Get recommended product object
  const getProduct = (item) => {
    return item?.product || item?.Product || item || {};
  };

  // Get match score
  const getMatchScore = (item) => {
    return (
      item?.matchScore ??
      item?.matchPercentage ??
      item?.score ??
      0
    );
  };

  // Get matched skin concerns
  const getMatchedConcerns = (item) => {
    const concerns =
      item?.matchedConcerns ||
      item?.matchedSkinConcerns ||
      [];

    return Array.isArray(concerns) ? concerns : [];
  };

  // Get recommendation reason
  const getReason = (item) => {
    return (
      item?.recommendation?.reason ||
      item?.reason ||
      item?.matchReasons?.join(", ") ||
      "Recommended based on your skin analysis."
    );
  };

  // Format labels
  const formatLabel = (value) => {
    if (!value) return "-";

    return String(value)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Safe array values
  const getArrayValue = (value) => {
    return Array.isArray(value) ? value : [];
  };

  // Open Product Details Modal
  const handleViewProduct = (product, recommendation) => {
    setSelectedProduct(product);
    setSelectedRecommendation(recommendation);
    setShowProductModal(true);
  };

  // Close Product Details Modal
  const handleCloseModal = () => {
    setShowProductModal(false);
    setSelectedProduct(null);
    setSelectedRecommendation(null);
  };

  // Validate required props
  if (!analysisId || !productId) {
    return (
      <div className="alert alert-warning">
        Analysis ID and Product ID are required to show recommendations.
      </div>
    );
  }

  const profile = analysisResult?.ProductProfile || {};
  const analysis = analysisResult?.analysis || {};

  const visibleObservations = getArrayValue(
    analysis.visibleObservations
  );

  const suggestions = getArrayValue(analysis.suggestions);

  const limitations = getArrayValue(analysis.limitations);

  const allergies = getArrayValue(profile.allergies);

  const currentProducts = getArrayValue(profile.currentProducts);
  console.log('suggestions', suggestions)
  return (
    <div className="container-fluid px-0">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">AI Product Recommendations</h4>

          <p className="text-muted mb-0">
            Products recommended based on your skin analysis.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={fetchRecommendations}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="text-center py-5">
          <div
            className="spinner-border text-primary"
            role="status"
          />

          <p className="mt-2">
            Finding suitable products...
          </p>
        </div>
      ) : (
        <>
          {/* Recommendation Cards */}
          {recommendations.length > 0 ? (
            <div className="row">
              {recommendations.map((item, index) => {
                const product = getProduct(item);

                const matchedConcerns = getMatchedConcerns(item);

                const matchScore = getMatchScore(item);

                return (
                  <div
                    className="col-md-6 col-lg-4 mb-4"
                    key={product._id || item._id || index}
                  >
                    <div className="card h-100">
                      {/* Product Image */}
                      {product.image && (
                        <img
                          src={product.image}
                          alt={product.name || "Product"}
                          className="card-img-top"
                          style={{
                            height: "220px",
                            objectFit: "contain",
                            padding: "15px",
                          }}
                        />
                      )}

                      <div className="card-body">
                        {/* Product Name and Match Score */}
                        <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                          <h5 className="card-title mb-0">
                            {product.name || "Recommended Product"}
                          </h5>

                          <span className="badge bg-success flex-shrink-0">
                            {matchScore}% Match
                          </span>
                        </div>

                        {/* Product Price */}
                        {product.price !== undefined && (
                          <p className="fw-bold mb-2">
                            ₹{product.price}
                          </p>
                        )}

                        {/* Recommendation Reason */}
                        <p className="text-muted">
                          {getReason(item)}
                        </p>

                        {/* Matched Concerns */}
                        {matchedConcerns.length > 0 && (
                          <div className="mb-3">
                            <strong>Matched Concerns</strong>

                            <div className="d-flex flex-wrap gap-2 mt-2">
                              {matchedConcerns.map(
                                (concern, concernIndex) => (
                                  <span
                                    className="badge bg-light text-dark border"
                                    key={concernIndex}
                                  >
                                    {typeof concern === "string"
                                      ? formatLabel(concern)
                                      : formatLabel(concern?.name)}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}

                        {/* Product Description */}
                        {product.description && (
                          <p className="small text-muted">
                            {product.description}
                          </p>
                        )}

                        {/* View Product */}
                        {product._id && (
                          <button
                            type="button"
                            className="btn btn-primary w-100 mt-2"
                            onClick={() =>
                              handleViewProduct(product, item)
                            }
                          >
                            View Product
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="alert alert-info text-center">
              No product recommendations found for this analysis.
            </div>
          )}

          {/* Product Details Modal */}
          {showProductModal && selectedProduct && (
            <div
              className="modal d-block"
              tabIndex="-1"
              role="dialog"
              aria-modal="true"
              style={{
                backgroundColor: "rgba(0,0,0,0.6)",
                zIndex: 1055,
              }}
              onClick={handleCloseModal}
            >
              <div
                className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable"
                role="document"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="modal-content">
                  {/* Modal Header */}
                  <div className="modal-header">
                    <h5 className="modal-title">
                      Product & AI Analysis Details
                    </h5>

                    <button
                      type="button"
                      className="btn-close"
                      aria-label="Close"
                      onClick={handleCloseModal}
                    />
                  </div>

                  {/* Modal Body */}
                  <div className="modal-body">
                    {/* 1. Product Details */}
                    <div className="row mb-4">
                      <div className="col-md-5 mb-3">
                        {selectedProduct.image ? (
                          <img
                            src={selectedProduct.image}
                            alt={selectedProduct.name || "Product"}
                            style={{
                              width: "100%",
                              height: "280px",
                              objectFit: "contain",
                              border: "1px solid #eee",
                              borderRadius: "8px",
                              padding: "10px",
                            }}
                          />
                        ) : (
                          <div className="text-muted text-center p-5 border rounded">
                            No Image Available
                          </div>
                        )}
                      </div>

                      <div className="col-md-7">
                        <h5 className="mb-3">
                          {selectedProduct.name || "-"}
                        </h5>

                        <hr />

                        <p>
                          <strong>SKU:</strong>{" "}
                          {selectedProduct.sku || "-"}
                        </p>

                        <p>
                          <strong>Category:</strong>{" "}
                          {selectedProduct.category || "-"}
                        </p>

                        <p>
                          <strong>Product Type:</strong>{" "}
                          {formatLabel(selectedProduct.type)}
                        </p>

                        <p>
                          <strong>Price:</strong>{" "}
                          {selectedProduct.price !== undefined
                            ? `₹${selectedProduct.price}`
                            : "-"}
                        </p>

                        <p>
                          <strong>Stock:</strong>{" "}
                          {selectedProduct.stock ?? "-"}
                        </p>

                        <p>
                          <strong>Status:</strong>{" "}
                          {formatLabel(selectedProduct.status)}
                        </p>

                        <p className="mb-0">
                          <strong>Description:</strong>{" "}
                          {selectedProduct.description || "-"}
                        </p>
                      </div>
                    </div>

                    <hr />

                    {/* 2. AI Recommendation Details */}
                    <div className="mb-4">
                      <h5 className="mb-3">
                        <i className="fas fa-brain me-2 text-primary" />
                        AI Recommendation Details
                      </h5>

                      <div className="card">
                        <div className="card-body">
                          <div className="row">
                            <div className="col-md-4 mb-3">
                              <strong>Match Score</strong>

                              <h3 className="text-success mt-2">
                                {getMatchScore(
                                  selectedRecommendation || {}
                                )}%
                              </h3>
                            </div>

                            <div className="col-md-8 mb-3">
                              <strong>Recommendation Reason</strong>

                              <p className="mt-2 mb-0">
                                {selectedRecommendation
                                  ? getReason(selectedRecommendation)
                                  : "No recommendation reason available."}
                              </p>
                            </div>
                          </div>

                          <div>
                            <strong>Matched Skin Concerns</strong>

                            <div className="d-flex flex-wrap gap-2 mt-2">
                              {getMatchedConcerns(
                                selectedRecommendation || {}
                              ).length > 0 ? (
                                getMatchedConcerns(
                                  selectedRecommendation || {}
                                ).map((concern, index) => (
                                  <span
                                    key={index}
                                    className="badge bg-success"
                                  >
                                    {typeof concern === "string"
                                      ? formatLabel(concern)
                                      : formatLabel(concern?.name)}
                                  </span>
                                ))
                              ) : (
                                <span className="text-muted">
                                  No matched concerns available.
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <hr />

                    {/* 3. Skin Analysis Information */}

                    {/* Skin Analysis Information */}
                    <div className="mb-4">
                      <h5 className="mb-3">Skin Analysis Information</h5>

                      <div className="card">
                        <div className="card-body">
                          <div className="row">

                            <div className="col-md-6 mb-3">
                              <strong>Analysis ID</strong>
                              <p className="mb-0">{analysisResult?._id || analysisId}</p>
                            </div>

                            <div className="col-md-6 mb-3">
                              <strong>Product ID</strong>
                              <p className="mb-0">
                                {analysisResult?.ProductId || productId}
                              </p>
                            </div>

                            <div className="col-md-6 mb-3">
                              <strong>Image MIME Type</strong>
                              <p className="mb-0">
                                {analysisResult?.imageMimeType || "-"}
                              </p>
                            </div>

                            <div className="col-md-6 mb-3">
                              <strong>Consent Given</strong>
                              <p className="mb-0">
                                {analysisResult?.consentGiven === true
                                  ? "Yes"
                                  : analysisResult?.consentGiven === false
                                    ? "No"
                                    : "-"}
                              </p>
                            </div>

                            <div className="col-md-6 mb-3">
                              <strong>Analysis Status</strong>
                              <p className="mb-0">
                                {formatLabel(analysisResult?.status)}
                              </p>
                            </div>

                            <div className="col-md-6 mb-3">
                              <strong>AI Model</strong>
                              <p className="mb-0">
                                {analysisResult?.model || "-"}
                              </p>
                            </div>

                            <div className="col-md-6 mb-3">
                              <strong>Image Quality</strong>
                              <p className="mb-0">
                                {formatLabel(analysis.imageQuality)}
                              </p>
                            </div>

                            <div className="col-md-6 mb-3">
                              <strong>Age Range</strong>
                              <p className="mb-0">
                                {profile.ageRange || "-"}
                              </p>
                            </div>

                            <div className="col-md-6 mb-3">
                              <strong>Skin Type</strong>
                              <p className="mb-0">
                                {formatLabel(profile.skinType)}
                              </p>
                            </div>

                            <div className="col-md-6 mb-3">
                              <strong>Skin Sensitivity</strong>
                              <p className="mb-0">
                                {formatLabel(profile.sensitivity)}
                              </p>
                            </div>

                            <div className="col-12 mb-3">
                              <strong>Skin Concerns</strong>

                              <div className="d-flex flex-wrap gap-2 mt-2">
                                {getArrayValue(profile.concerns).length > 0 ? (
                                  profile.concerns.map((concern, index) => (
                                    <span key={index} className="badge bg-warning text-dark">
                                      {formatLabel(concern)}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-muted">No concerns provided.</span>
                                )}
                              </div>
                            </div>

                            <div className="col-md-6 mb-3">
                              <strong>Allergies</strong>
                              <p className="mb-0">
                                {allergies.length > 0
                                  ? allergies.join(", ")
                                  : "None reported"}
                              </p>
                            </div>

                            <div className="col-md-6 mb-3">
                              <strong>Current Products</strong>
                              <p className="mb-0">
                                {currentProducts.length > 0
                                  ? currentProducts.join(", ")
                                  : "Not provided"}
                              </p>
                            </div>

                            <div className="col-12 mb-3">
                              <strong>Overall Summary</strong>
                              <p className="mb-0 mt-2">
                                {analysis.overallSummary || "-"}
                              </p>
                            </div>

                            <div className="col-md-6">
                              <strong>Created At</strong>
                              <p className="mb-0">
                                {analysisResult?.createdAt
                                  ? new Date(analysisResult.createdAt).toLocaleString()
                                  : "-"}
                              </p>
                            </div>

                            <div className="col-md-6">
                              <strong>Updated At</strong>
                              <p className="mb-0">
                                {analysisResult?.updatedAt
                                  ? new Date(analysisResult.updatedAt).toLocaleString()
                                  : "-"}
                              </p>
                            </div>

                          </div>
                        </div>
                      </div>
                    </div>

                    <hr />
                    <hr />

                    <div className="row mt-3">
                      <div className="col-md-6 mb-3">
                        <strong>Recommendation Title</strong>
                        <p className="mt-2">
                          {selectedRecommendation?.recommendation?.title || "-"}
                        </p>
                      </div>

                      <div className="col-md-6 mb-3">
                        <strong>Usage</strong>
                        <p className="mt-2">
                          {selectedRecommendation?.recommendation?.usage || "-"}
                        </p>
                      </div>

                      <div className="col-md-6 mb-3">
                        <strong>Time of Use</strong>
                        <p className="mt-2">
                          {formatLabel(
                            selectedRecommendation?.recommendation?.timeOfUse
                          )}
                        </p>
                      </div>

                      <div className="col-12">
                        <strong>Product Benefits</strong>

                        {selectedRecommendation?.recommendation?.benefits?.length > 0 ? (
                          <ul className="mt-2">
                            {selectedRecommendation.recommendation.benefits.map(
                              (benefit, index) => (
                                <li key={index}>{benefit}</li>
                              )
                            )}
                          </ul>
                        ) : (
                          <p className="text-muted mt-2">No benefits available.</p>
                        )}
                      </div>
                    </div>
                    {/* 4. AI Visible Observations */}
                    <div className="mb-4">
                      <h5 className="mb-3">
                        AI Visible Observations
                      </h5>

                      <div className="card">
                        <div className="card-body">
                          {visibleObservations.length > 0 ? (
                            visibleObservations.map(
                              (observation, index) => (
                                <div
                                  key={observation._id || index}
                                  className="border rounded p-3 mb-3"
                                >
                                  <div className="row">
                                    <div className="col-md-4 mb-2">
                                      <strong>Concern</strong>
                                      <p className="mb-0">
                                        {formatLabel(
                                          observation.concern
                                        )}
                                      </p>
                                    </div>

                                    <div className="col-md-4 mb-2">
                                      <strong>Severity</strong>
                                      <p className="mb-0">
                                        {formatLabel(
                                          observation.severity
                                        )}
                                      </p>
                                    </div>

                                    <div className="col-md-4 mb-2">
                                      <strong>Confidence</strong>
                                      <p className="mb-0">
                                        {formatLabel(
                                          observation.confidence
                                        )}
                                      </p>
                                    </div>

                                    <div className="col-12 mt-2">
                                      <strong>Description</strong>
                                      <p className="mb-0 mt-1">
                                        {observation.description || "-"}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )
                            )
                          ) : (
                            <p className="text-muted mb-0">
                              No visible observations available.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <hr />

                    {/* 5. Important Skin Care Suggestions */}
                    <div className="mb-4">
                      <h5 className="mb-3">
                        <i className="fas fa-lightbulb me-2 text-success" />
                        Important Skin Care Suggestions
                      </h5>

                      <div className="card">
                        <div className="card-body">
                          {suggestions.length > 0 ? (
                            <div className="d-flex flex-column gap-3">
                              {suggestions.map(
                                (suggestion, index) => (
                                  <div
                                    key={index}
                                    className="d-flex align-items-start gap-3 border rounded p-3"
                                  >
                                    <span
                                      style={{
                                        width: "30px",
                                        height: "30px",
                                        minWidth: "30px",
                                        borderRadius: "50%",
                                        backgroundColor: "#198754",
                                        color: "#fff",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      {index + 1}
                                    </span>

                                    <p className="mb-0">
                                      {suggestion}
                                    </p>
                                  </div>
                                )
                              )}
                            </div>
                          ) : (
                            <p className="text-muted mb-0">
                              No skin care suggestions available.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <hr />

                    {/* 6. Analysis Limitations */}
                    <div className="mb-4">
                      <h5 className="mb-3">
                        Analysis Limitations
                      </h5>

                      <div className="card">
                        <div className="card-body">
                          {limitations.length > 0 ? (
                            <ul className="mb-0">
                              {limitations.map(
                                (limitation, index) => (
                                  <li key={index} className="mb-2">
                                    {limitation}
                                  </li>
                                )
                              )}
                            </ul>
                          ) : (
                            <p className="text-muted mb-0">
                              No limitations provided.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 7. Professional Advice */}
                    {analysis.requiresProfessionalAdvice && (
                      <div className="alert alert-warning">
                        <strong>Professional Advice:</strong>{" "}
                        Professional medical advice is recommended.
                      </div>
                    )}

                    {/* 8. Medical Disclaimer */}
                    <div className="alert alert-info mb-0">
                      <strong>Medical Disclaimer:</strong>{" "}
                      {analysis.medicalDisclaimer ||
                        "This AI analysis is not a medical diagnosis. Consult a qualified healthcare professional for medical concerns."}
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCloseModal}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AIRecommendations;
