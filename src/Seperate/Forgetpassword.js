import React from "react";
import frame2 from "../Assets/images/forgetpassword1.png";
import Profile from "../Assets/images/profile.png";
import { makeApiRequest } from "../AxiosServices/apiCall";
import { toast, ToastContainer } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";

function Forgetpassword() {
  const formik = useFormik({
    initialValues: { email: "" },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email").required("Email is required"),
    }),
    onSubmit: async (values) => {
      const datas = new FormData();
      datas.append("email", values.email);
      try {
        let params = {
          url: "admin-forget-password",
          method: "POST",
          data: datas,
        };
        const response = await makeApiRequest(params);
        if (response.status == true) {
          localStorage.setItem("setToken", response.usertoken);
          toast.success(response.message);
        } else {
          toast.error(response.message);
        }
      } catch (error) {
        toast.error("Something Went Wrong...");
      }
    },
  });

  return (
    <div className="App">
      <ToastContainer />
      <div className="container-fluid">
        <div className="custom-sign min-vh-100">
          <div className="row">
            <div className="col-lg-12">
              <div className="row align-items-center">
                <div className="col-lg-5">
                  <div className="custom-inside-sign">
                    <div className="text-center">
                      <img style={{ width: "50px" }} src={Profile}></img>
                      <p className="fw-bold">Email Address</p>
                    </div>
                    <form onSubmit={formik.handleSubmit}>
                      <div class="mb-3 mt-3">
                        {/* <label for="exampleInputEmail1" class="form-label fw-bold">Email</label> */}
                        <input
                          type="email"
                          name="email"
                          class="form-control custom-input"
                          id="exampleInputEmail1"
                          aria-describedby="emailHelp"
                          placeholder="Enter The Email.."
                          value={formik.values.email}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                        {formik.touched.email && formik.errors.email ? (
                          <div className="text-danger">
                            {formik.errors.email}
                          </div>
                        ) : null}
                      </div>
                      <div className="text-center w-100 mt-4 mb-3">
                        <button type="submit" class="custom-sign-btn w-100">
                          Forgot password
                        </button>
                      </div>
                    </form>
                    <div></div>
                  </div>
                </div>
                <div className="col-lg-7 animi">
                  <div className="custom-sign-right">
                    <img
                      src={frame2}
                      class="animated-image"
                      alt="Animated Image"
                      style={{ objectFit: "cover" }}
                    ></img>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Forgetpassword;
