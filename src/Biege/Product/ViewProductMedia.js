
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faPenToSquare,
  faImage,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";
import { makeApiRequest } from "../../AxiosServices/apiCall";

function ViewProductMedia() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(false);

  // GET PRODUCT MEDIA
  const getProductMedia = async () => {
    try {
      setLoading(true);

      const result = await makeApiRequest({
        url: `getproduct-media/${id}`,
        method: "GET",
      });

      if (result?.status) {
        const mediaData = Array.isArray(result.data)
          ? result.data[0]
          : result.data;

        if (mediaData) {
          setMedia(mediaData);
        } else {
          setMedia(null);
          toast.error("Product media not found");
        }
      } else {
        setMedia(null);
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
    if (id) {
      getProductMedia();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="container-fluid py-4 text-center">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-2">Loading product media...</p>
      </div>
    );
  }

  if (!media) {
    return (
      <div className="container-fluid py-4">
        <button
          type="button"
          className="btn btn-secondary mb-3"
          onClick={() => navigate("/product-media")}
        >
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          Back
        </button>

        <div className="alert alert-warning">
          No product media found.
        </div>
      </div>
    );
  }

  const productName = media.productDetails?.name || "-";
  const images = Array.isArray(media.images) ? media.images : [];

  return (
    <div className="container-fluid py-3">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">View Product Media</h4>

        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/product-media")}
          >
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            Back
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate(`/edit-product-media/${id}`)}
          >
            <FontAwesomeIcon icon={faPenToSquare} className="me-2" />
            Edit Media
          </button>
        </div>
      </div>

      {/* PRODUCT DETAILS */}
      <div className="card shadow-sm mb-4">
        <div className="card-header">
          <h5 className="mb-0">Product Information</h5>
        </div>

        <div className="card-body">
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="fw-bold">Product Name</label>
              <p className="mb-0">{productName}</p>
            </div>

            <div className="col-md-6 mb-3">
              <label className="fw-bold">Total Images</label>
              <p className="mb-0">{images.length}</p>
            </div>

            <div className="col-md-6 mb-3">
              <label className="fw-bold">Video</label>
              <p className="mb-0">
                {media.video ? "Available" : "Not Available"}
              </p>
            </div>

            <div className="col-md-6 mb-3">
              <label className="fw-bold">Main Image</label>
              <p className="mb-0">
                {media.mainImage ? "Selected" : "Not Selected"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN IMAGE */}
      <div className="card shadow-sm mb-4">
        <div className="card-header">
          <h5 className="mb-0">
            <FontAwesomeIcon icon={faImage} className="me-2" />
            Main Image
          </h5>
        </div>

        <div className="card-body">
          {media.mainImage ? (
            <img
              src={media.mainImage}
              alt="Main Product"
              style={{
                width: "220px",
                height: "220px",
                objectFit: "contain",
                border: "1px solid #dee2e6",
                borderRadius: "8px",
                padding: "8px",
              }}
            />
          ) : (
            <p className="text-muted mb-0">No main image available.</p>
          )}
        </div>
      </div>

      {/* ALL IMAGES */}
      <div className="card shadow-sm mb-4">
        <div className="card-header">
          <h5 className="mb-0">
            <FontAwesomeIcon icon={faImage} className="me-2" />
            Product Images
          </h5>
        </div>

        <div className="card-body">
          {images.length > 0 ? (
            <div className="row">
              {images.map((image, index) => (
                <div className="col-md-3 col-sm-6 mb-4" key={image._id || index}>
                  <div
                    className="card h-100"
                    style={{ borderRadius: "8px" }}
                  >
                    <img
                      src={image.url}
                      alt={image.altText || productName}
                      style={{
                        width: "100%",
                        height: "200px",
                        objectFit: "contain",
                        padding: "10px",
                      }}
                    />

                    <div className="card-body text-center">
                      <p className="mb-1 fw-bold">
                        Image {index + 1}
                      </p>

                      {image.url === media.mainImage && (
                        <span className="badge bg-success">
                          Main Image
                        </span>
                      )}

                      {image.altText && (
                        <p className="text-muted small mt-2 mb-0">
                          {image.altText}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted mb-0">No product images available.</p>
          )}
        </div>
      </div>

      {/* PRODUCT VIDEO */}
      <div className="card shadow-sm mb-4">
        <div className="card-header">
          <h5 className="mb-0">
            <FontAwesomeIcon icon={faVideo} className="me-2" />
            Product Video
          </h5>
        </div>

        <div className="card-body">
          {media.video ? (
            <video
              controls
              style={{
                width: "100%",
                maxWidth: "600px",
                maxHeight: "400px",
                borderRadius: "8px",
              }}
            >
              <source src={media.video} />
              Your browser does not support video playback.
            </video>
          ) : (
            <p className="text-muted mb-0">No product video available.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ViewProductMedia;
