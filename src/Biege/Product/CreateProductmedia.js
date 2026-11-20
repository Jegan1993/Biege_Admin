import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { makeApiRequest } from "../../AxiosServices/apiCall";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
  faArrowLeft,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

// ================= TAILWIND CLASS HELPERS =================

const btnPrimary =
  "rounded-md bg-[#e98d9d] px-[18px] py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#d97589] disabled:cursor-not-allowed disabled:opacity-60";

const btnGhost =
  "rounded-md border border-[#e3c8cc] bg-white px-[18px] py-2.5 text-[13px] font-semibold text-[#8c3d4e] transition hover:border-[#e98d9d] hover:bg-[#faf2f3]";

const btnRemove =
  "mt-2 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-600 hover:text-white";

const fieldClass =
  "w-full rounded-md border border-[#e3c8cc] bg-white px-3 py-2.5 text-[13px] text-[#26334a] outline-none transition focus:border-[#e98d9d] focus:ring-4 focus:ring-[#e98d9d]/30";

const labelClass = "text-xs font-semibold text-[#8c3d4e]";

const fileClass =
  "w-full rounded-md border border-dashed border-[#e98d9d] bg-[#faf2f3] p-2.5 text-xs file:mr-3 file:cursor-pointer file:rounded file:border-0 file:bg-[#e98d9d] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white";

const previewCard =
  "flex h-full flex-col overflow-hidden rounded-[13px] border border-[#edf0f5] bg-white shadow-[0_3px_12px_rgba(30,40,70,0.035)]";

const previewImg = "h-40 w-full object-contain p-2";

function CreateProductmedia() {
  const navigate = useNavigate();
  const { productId: wizardProductId, id } = useParams();

  // Create wizard: /add-product/:productId/media
  const isWizard = Boolean(wizardProductId);

  // Edit wizard: /edit-product/:id/media
  const isEditWizard = Boolean(id);

  const activeProductId = wizardProductId || id;

  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState(activeProductId || "");

  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const [mainImage, setMainImage] = useState("");
  const [video, setVideo] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  // =====================================
  // GET ALL PRODUCTS
  // =====================================

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

      toast.error(
        error?.response?.data?.message || "Failed to fetch products"
      );
    }
  };

  // =====================================
  // GET EXISTING PRODUCT MEDIA
  // =====================================

  const getProductMedia = async (selectedProductId) => {
    if (!selectedProductId) return;

    try {
      setLoading(true);

      const result = await makeApiRequest({
        url: `getproduct-media/${selectedProductId}`,
        method: "GET",
      });

      console.log("EXISTING PRODUCT MEDIA:", result);

      if (result?.status && result.data) {
        const media = result.data;

        setExistingImages(media.images || []);
        setVideo(media.video || "");

        const selectedMainImage = media.mainImage || "";

        setMainImage(
          selectedMainImage
            ? `existing-${(media.images || []).findIndex(
                (image) => image.url === selectedMainImage
              )}`
            : ""
        );

        if (
          selectedMainImage &&
          !(media.images || []).some(
            (image) => image.url === selectedMainImage
          )
        ) {
          setMainImage("");
        }
      } else {
        setExistingImages([]);
        setImages([]);
        setVideo("");
        setMainImage("");

        toast.error(result?.message || "Product media not found");
      }
    } catch (error) {
      console.log("Get product media error:", error);

      setExistingImages([]);
      setImages([]);
      setVideo("");
      setMainImage("");

      toast.error(
        error?.response?.data?.message || "Failed to fetch product media"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // INITIAL LOAD
  // =====================================

  useEffect(() => {
    getAllProducts();

    if (activeProductId) {
      setProductId(activeProductId);

      if (isEditWizard) {
        getProductMedia(activeProductId);
      }
    }
  }, [wizardProductId, id]);

  // =====================================
  // HANDLE IMAGE CHANGE
  // =====================================

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);

    const validFiles = selectedFiles.filter((file) =>
      file.type.startsWith("image/")
    );

    if (validFiles.length !== selectedFiles.length) {
      toast.error("Please select only image files");
    }

    if (existingImages.length + images.length + validFiles.length > 10) {
      toast.error("Maximum 10 images are allowed");
      e.target.value = "";
      return;
    }

    setImages((prev) => [...prev, ...validFiles]);

    e.target.value = "";
  };

  // =====================================
  // REMOVE NEW IMAGE
  // =====================================

  const handleRemoveImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);

    setImages(updatedImages);

    if (mainImage === `new-${index}`) {
      setMainImage(
        existingImages.length > 0
          ? "existing-0"
          : updatedImages.length > 0
          ? "new-0"
          : ""
      );
    } else if (mainImage.startsWith("new-")) {
      const selectedIndex = Number(mainImage.split("-")[1]);

      if (selectedIndex > index) {
        setMainImage(`new-${selectedIndex - 1}`);
      }
    }
  };

  // =====================================
  // SELECT MAIN IMAGE
  // =====================================

  const handleMainImageChange = (value) => {
    setMainImage(value);
  };

  // =====================================
  // SUBMIT CREATE / UPDATE MEDIA
  // =====================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!productId) {
      toast.error("Please select a product");
      return;
    }

    if (!isEditWizard && images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    if (isEditWizard && existingImages.length === 0 && images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    if (mainImage === "") {
      toast.error("Please select a main image");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();

      formData.append("productId", productId);
      formData.append("video", video);

      // Backend expects mainImage as the index
      // in the combined existing + newly uploaded image array.
      let selectedMainIndex = -1;

      if (mainImage.startsWith("existing-")) {
        selectedMainIndex = Number(mainImage.split("-")[1]);
      } else if (mainImage.startsWith("new-")) {
        selectedMainIndex =
          existingImages.length + Number(mainImage.split("-")[1]);
      }

      if (selectedMainIndex < 0) {
        toast.error("Please select a valid main image");
        return;
      }

      formData.append("mainImage", String(selectedMainIndex));

      images.forEach((image) => {
        formData.append("images", image);
      });

      const result = await makeApiRequest({
        url: isEditWizard
          ? `updateproduct-media/${productId}`
          : "createproduct-media",

        method: isEditWizard ? "PUT" : "POST",

        data: formData,
        header: "image",
      });

      if (result?.status) {
        toast.success(
          result.message ||
            (isEditWizard
              ? "Product media updated successfully"
              : "Product media created successfully")
        );

        // EDIT: Return to product list
        if (isEditWizard) {
          navigate("/view-product");
          return;
        }

        // CREATE: Move to variants
        if (isWizard) {
          navigate(`/add-product/${wizardProductId}/variants`);
          return;
        }

        navigate("/add-product/media");
      } else {
        toast.error(result?.message || "Failed to save product media");
      }
    } catch (error) {
      console.log("Save media error:", error);

      toast.error(
        error?.response?.data?.message || "Failed to save product media"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================
  // BACK
  // =====================================

  const handleBack = () => {
    if (isEditWizard) {
      navigate(`/edit-product/${id}/pricing`);
      return;
    }

    if (isWizard) {
      navigate(`/add-product/${wizardProductId}/pricing`);
      return;
    }

    navigate("/add-product/media");
  };

  // =====================================
  // MAIN IMAGE RADIO BUTTON
  // =====================================

  const renderMainImageRadio = (value) => (
    <label className="pointer-events-auto flex cursor-pointer items-center gap-2 text-[13px] text-[#26334a]">
      <input
        type="radio"
        name="mainImage"
        className="h-4 w-4 accent-[#e98d9d]"
        checked={mainImage === value}
        onChange={() => handleMainImageChange(value)}
      />
      Main Image
    </label>
  );

  // =====================================
  // UI
  // =====================================

  return (
    <div className="min-h-screen bg-[#f6f7fb] p-4 sm:p-7">
      {/* HEADER */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="mb-1.5 text-[28px] font-bold text-[#e9899d]">
            {isEditWizard ? "Update Product Media" : "Create Product Media"}
          </h3>
          <p className="text-sm text-[#8791a5]">
            Upload product images, choose the main image and add a video link.
          </p>
        </div>

        <button type="button" className={btnGhost} onClick={handleBack}>
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Back
        </button>
      </div>

      {/* CARD */}
      <div className="rounded-[13px] border border-[#edf0f5] bg-white p-5 shadow-[0_3px_12px_rgba(30,40,70,0.035)] sm:p-6">
        {loading ? (
          <div className="py-10 text-center text-[#8791a5]">
            <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-[3px] border-[#e3c8cc] border-t-[#e98d9d]" />
            <p className="text-sm">Loading product media...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-x-5 gap-y-[18px] md:grid-cols-2">
              {/* PRODUCT */}

              {!isWizard && !isEditWizard && (
                <div className="flex flex-col gap-[7px]">
                  <label className={labelClass}>
                    Product <span className="text-red-600">*</span>
                  </label>

                  <select
                    className={fieldClass}
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
              )}

              {/* VIDEO URL */}

              <div className="flex flex-col gap-[7px]">
                <label className={labelClass}>Video URL</label>

                <input
                  type="url"
                  className={fieldClass}
                  placeholder="Enter product video URL"
                  value={video}
                  onChange={(e) => setVideo(e.target.value)}
                />
              </div>

              {/* PRODUCT IMAGES */}

              <div className="flex flex-col gap-[7px] md:col-span-2">
                <label className={labelClass}>
                  Product Images <span className="text-red-600">*</span>
                </label>

                <input
                  type="file"
                  className={fileClass}
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                />

                <span className="text-[11px] text-[#8791a5]">
                  Maximum 10 images allowed.
                  {isEditWizard &&
                    " New images will be added to existing images."}
                </span>
              </div>
            </div>

            {/* EXISTING IMAGE PREVIEW */}

            {existingImages.length > 0 && (
              <div className="mt-6">
                <h6 className="mb-3 text-base font-bold text-[#26334a]">
                  Existing Product Images
                </h6>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {existingImages.map((image, index) => (
                    <div key={image.publicId || image.url || index} className={previewCard}>
                      <img
                        src={image.url}
                        alt={image.altText || "Product"}
                        className={previewImg}
                      />

                      <div className="mt-auto border-t border-[#edf0f5] p-3">
                        {renderMainImageRadio(`existing-${index}`)}

                        <span className="mt-1 block text-[11px] text-[#8791a5]">
                          Existing image
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* NEW IMAGE PREVIEW */}

            {images.length > 0 && (
              <div className="mt-6">
                <h6 className="mb-3 text-base font-bold text-[#26334a]">
                  Newly Selected Images
                </h6>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {images.map((image, index) => (
                    <div key={`${image.name}-${index}`} className={previewCard}>
                      <img
                        src={URL.createObjectURL(image)}
                        alt={image.name}
                        className={previewImg}
                      />

                      <div className="mt-auto border-t border-[#edf0f5] p-3">
                        {renderMainImageRadio(`new-${index}`)}

                        <button
                          type="button"
                          className={btnRemove}
                          onClick={() => handleRemoveImage(index)}
                        >
                          <FontAwesomeIcon icon={faTrash} className="mr-1.5" />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUBMIT */}

            <div className="mt-6 flex justify-end border-t border-[#edf0f5] pt-5">
              <button type="submit" className={btnPrimary} disabled={submitting}>
                <FontAwesomeIcon icon={faSave} className="mr-2" />

                {submitting
                  ? "Saving..."
                  : isEditWizard
                  ? "Update Media"
                  : "Create Media"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default CreateProductmedia;