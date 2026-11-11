import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { makeApiRequest } from "../../AxiosServices/apiCall";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faSave,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

function EditProductMedia() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [productName, setProductName] = useState("");
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [mainImage, setMainImage] = useState("");
  const [video, setVideo] = useState("");

  // GET EXISTING PRODUCT MEDIA
  const getProductMedia = async () => {
    try {
      setLoading(true);

      const result = await makeApiRequest({
        url: `getproduct-media/${id}`,
        method: "GET",
      });

      if (result?.status && result.data) {
        const media = Array.isArray(result.data)
          ? result.data[0]
          : result.data;

        if (!media) {
          toast.error("Product media not found");
          navigate("/product-media");
          return;
        }

        setProductName(media.productDetails?.name || "");
        setExistingImages(media.images || []);
        setVideo(media.video || "");
        setMainImage(media.mainImage || "");
      } else {
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

  // SELECT NEW IMAGES
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (files.length + newImages.length > 10) {
      toast.error("You can upload a maximum of 10 new images");
      e.target.value = "";
      return;
    }

    const validFiles = files.filter((file) =>
      file.type.startsWith("image/")
    );

    if (validFiles.length !== files.length) {
      toast.error("Please select only image files");
    }

    const updatedImages = [...newImages, ...validFiles];
    setNewImages(updatedImages);

    if (!mainImage && updatedImages.length > 0) {
      setMainImage(URL.createObjectURL(updatedImages[0]));
    }

    e.target.value = "";
  };

  // REMOVE NEW IMAGE
  const handleRemoveNewImage = (index) => {
    const updatedImages = newImages.filter((_, i) => i !== index);

    const removedImageUrl = URL.createObjectURL(newImages[index]);

    setNewImages(updatedImages);

    if (mainImage === removedImageUrl) {
      setMainImage(existingImages[0]?.url || "");
    }
  };

  // SELECT EXISTING IMAGE AS MAIN IMAGE
  const handleSelectExistingMain = (imageUrl) => {
    setMainImage(imageUrl);
  };

  // SELECT NEW IMAGE AS MAIN IMAGE
  const handleSelectNewMain = (file) => {
    setMainImage(URL.createObjectURL(file));
  };

  // UPDATE PRODUCT MEDIA
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      const formData = new FormData();

      formData.append("video", video);
      formData.append("mainImage", mainImage);

      newImages.forEach((image) => {
        formData.append("images", image);
      });

      const result = await makeApiRequest({
        url: `updateproduct-media/${id}`,
        method: "PUT",
        data: formData,
        header: "image",
      });

      if (result?.status) {
        toast.success(
          result.message || "Product media updated successfully"
        );

        navigate("/product-media");
      } else {
        toast.error(result?.message || "Failed to update product media");
      }
    } catch (error) {
      console.log("Update product media error:", error);

      toast.error(
        error?.response?.data?.message || "Failed to update product media"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid py-4 text-center">
        Loading product media...
      </div>
    );
  }

  return (
    <div className="container-fluid py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Edit Product Media</h4>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate("/product-media")}
        >
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          Back
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {/* PRODUCT NAME */}
            <div className="mb-3">
              <label className="form-label">Product Name</label>
              <input
                type="text"
                className="form-control"
                value={productName}
                readOnly
              />
            </div>

            {/* EXISTING IMAGES */}
            <div className="mb-4">
              <label className="form-label fw-semibold">
                Existing Images
              </label>

              {existingImages.length > 0 ? (
                <div className="d-flex flex-wrap gap-3">
                  {existingImages.map((image, index) => (
                    <div
                      key={image.publicId || index}
                      className="border rounded p-2 text-center"
                      style={{ width: "130px" }}
                    >
                      <img
                        src={image.url}
                        alt={image.altText || "Product"}
                        style={{
                          width: "100%",
                          height: "100px",
                          objectFit: "contain",
                        }}
                      />

                      <div className="mt-2">
                        <input
                          type="radio"
                          name="mainImage"
                          checked={mainImage === image.url}
                          onChange={() =>
                            handleSelectExistingMain(image.url)
                          }
                        />
                        <label className="ms-2 small">
                          Main Image
                        </label>
                      </div>

                      {mainImage === image.url && (
                        <span className="badge bg-success mt-1">
                          Main
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">No existing images</p>
              )}
            </div>

            {/* UPLOAD NEW IMAGES */}
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Add More Images
              </label>

              <input
                type="file"
                className="form-control"
                accept="image/*"
                multiple
                onChange={handleImageChange}
              />

              <small className="text-muted">
                Maximum 10 new images per update.
              </small>
            </div>

            {/* NEW IMAGE PREVIEW */}
            {newImages.length > 0 && (
              <div className="mb-4">
                <label className="form-label fw-semibold">
                  New Images
                </label>

                <div className="d-flex flex-wrap gap-3">
                  {newImages.map((image, index) => {
                    const imageUrl = URL.createObjectURL(image);

                    return (
                      <div
                        key={`${image.name}-${index}`}
                        className="border rounded p-2 text-center"
                        style={{ width: "130px" }}
                      >
                        <img
                          src={imageUrl}
                          alt={image.name}
                          style={{
                            width: "100%",
                            height: "100px",
                            objectFit: "contain",
                          }}
                        />

                        <div className="mt-2">
                          <input
                            type="radio"
                            name="mainImage"
                            checked={mainImage === imageUrl}
                            onChange={() => setMainImage(imageUrl)}
                          />
                          <label className="ms-2 small">
                            Main Image
                          </label>
                        </div>

                        <button
                          type="button"
                          className="btn btn-sm btn-danger mt-2"
                          onClick={() => handleRemoveNewImage(index)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* VIDEO URL */}
            <div className="mb-4">
              <label className="form-label fw-semibold">
                Product Video URL
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="Enter product video URL"
                value={video}
                onChange={(e) => setVideo(e.target.value)}
              />
            </div>

            {/* SUBMIT */}
            <div className="d-flex gap-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                <FontAwesomeIcon icon={faSave} className="me-2" />
                {submitting ? "Updating..." : "Update Media"}
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate("/product-media")}
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditProductMedia;