


import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { makeApiRequest } from "../../AxiosServices/apiCall";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faArrowLeft, faTrash } from "@fortawesome/free-solid-svg-icons";

function CreateProductmedia() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState("");
  const [images, setImages] = useState([]);
  const [mainImage, setMainImage] = useState("0");
  const [video, setVideo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const getAllProducts = async () => {
    try {
      const result = await makeApiRequest({
        url: "getproduct",
        method: "GET",
      });

      if (result?.status && Array.isArray(result.data)) {
        setProducts(result.data);
      } else {
        setProducts([]);
        toast.error(result?.message || "Products not found");
      }
    } catch (error) {
      console.log("Get products error:", error);
      toast.error(error?.response?.data?.message || "Failed to fetch products");
    }
  };

  useEffect(() => {
    getAllProducts();
  }, []);

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter((file) =>
      file.type.startsWith("image/")
    );

    if (validFiles.length !== selectedFiles.length) {
      toast.error("Please select only image files");
    }

    if (images.length + validFiles.length > 10) {
      toast.error("Maximum 10 images are allowed");
      e.target.value = "";
      return;
    }

    setImages((prev) => [...prev, ...validFiles]);
    e.target.value = "";
  };

  const handleRemoveImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);

    if (updatedImages.length === 0) {
      setMainImage("");
    } else if (Number(mainImage) === index) {
      setMainImage("0");
    } else if (Number(mainImage) > index) {
      setMainImage(String(Number(mainImage) - 1));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!productId) {
      toast.error("Please select a product");
      return;
    }

    if (images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    if (mainImage === "" || !images[Number(mainImage)]) {
      toast.error("Please select a main image");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();

      formData.append("productId", productId);
      formData.append("video", video);
      formData.append("mainImage", mainImage);

      images.forEach((image) => {
        formData.append("images", image);
      });

      const result = await makeApiRequest({
        url: "createproduct-media",
        method: "POST",
        data: formData,
        header: "image",
      });

      if (result?.status) {
        toast.success(result.message || "Product media created successfully");
        navigate("/add-product/media");
      } else {
        toast.error(result?.message || "Failed to create product media");
      }
    } catch (error) {
      console.log("Create media error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to create product media"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-fluid py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Create Product Media</h4>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate("/add-product/media")}
        >
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          Back
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Product <span className="text-danger">*</span>
                </label>

                <select
                  className="form-select"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  required
                >
                  <option value="">Select Product</option>
                  {products.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Video URL</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="Enter product video URL"
                  value={video}
                  onChange={(e) => setVideo(e.target.value)}
                />
              </div>

              <div className="col-md-12 mb-3">
                <label className="form-label">
                  Product Images <span className="text-danger">*</span>
                </label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                />
                <small className="text-muted">
                  Maximum 10 images allowed.
                </small>
              </div>
            </div>

            {images.length > 0 && (
              <div className="row mb-3">
                {images.map((image, index) => (
                  <div className="col-md-3 col-sm-6 mb-3" key={`${image.name}-${index}`}>
                    <div className="card h-100">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={image.name}
                        style={{
                          width: "100%",
                          height: "160px",
                          objectFit: "contain",
                          padding: "8px",
                        }}
                      />

                      <div className="card-body p-2">
                        <div className="form-check">
                          <input
                            type="radio"
                            className="form-check-input"
                            name="mainImage"
                            checked={mainImage === String(index)}
                            onChange={() => setMainImage(String(index))}
                          />
                          <label className="form-check-label">
                            Main Image
                          </label>
                        </div>

                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger mt-2"
                          onClick={() => handleRemoveImage(index)}
                        >
                          <FontAwesomeIcon icon={faTrash} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-success"
              disabled={submitting}
            >
              <FontAwesomeIcon icon={faSave} className="me-2" />
              {submitting ? "Saving..." : "Create Media"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateProductmedia;