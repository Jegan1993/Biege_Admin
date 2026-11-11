import React, { useState } from "react";
import frame2 from "../Assets/images/Frame-2.png";
import Profile from "../Assets/images/profile.png";
import { BsFillEyeFill, BsFillEyeSlashFill } from "react-icons/bs";
import { makeApiRequest } from "../AxiosServices/apiCall";
import { toast, ToastContainer } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate, useParams } from "react-router-dom";

function Resetpassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const togglePassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const formik = useFormik({
    initialValues: { email: "" },
    validationSchema: Yup.object({
      password: Yup.string("Enter your password")
        .required("Password is required")
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!"#$%&'()*+,-./:;<=>?@[\]^_`\{|}~\\])[A-Za-z\d!"#$%&'()*+,-./:;<=>?@[\]^_`\{|}~\\]{8,}$/,
          "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character",
        ),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password"), null], "Passwords does not Match")
        .required("Confirm Password is required"),
    }),

    onSubmit: async (values) => {
      const datas = new FormData();
      datas.append("password", values.password);
      datas.append("confirmPassword", values.confirmPassword);
      datas.append("token", token);
      try {
        let params = {
          url: "admin-reset-password",
          method: "POST",
          data: datas,
        };
        const response = await makeApiRequest(params);
        if (response.status == true) {
          toast.success(response.message);
          setTimeout(() => {
            navigate("/");
          }, 1000);
        } else {
          toast.success(response.message);
          localStorage.clear();
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
                      <p className="fw-bold">Reset Password</p>
                    </div>
                    <form onSubmit={formik.handleSubmit}>
                      <div class="mb-3 mt-3 position-relative">
                        <label
                          for="exampleInputPassword1"
                          class="form-label fw-bold"
                        >
                          New password
                        </label>
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          class="form-control custom-input"
                          id="exampleInputPassword1"
                          aria-describedby="emailHelp"
                          placeholder="New Password..."
                          value={formik.values.password}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                        <span
                          onClick={togglePasswordVisibility}
                          className="position-absolute"
                          style={{
                            right: "10px",
                            top: "39px",
                            cursor: "pointer",
                          }}
                        >
                          {showPassword ? (
                            <BsFillEyeFill />
                          ) : (
                            <BsFillEyeSlashFill />
                          )}
                        </span>
                        {formik.touched.password && formik.errors.password ? (
                          <div className="text-danger">
                            {formik.errors.password}
                          </div>
                        ) : null}
                      </div>
                      <div class="mb-3 mt-3 position-relative">
                        <label
                          for="exampleInputPassword1"
                          class="form-label fw-bold"
                        >
                          Confirm New Password
                        </label>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          class="form-control custom-input"
                          id="exampleInputPassword1"
                          aria-describedby="emailHelp"
                          placeholder="Confirm Password..."
                          value={formik.values.confirmPassword}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                        <span
                          onClick={togglePassword}
                          className="position-absolute"
                          style={{
                            right: "10px",
                            top: "39px",
                            cursor: "pointer",
                          }}
                        >
                          {showConfirmPassword ? (
                            <BsFillEyeFill />
                          ) : (
                            <BsFillEyeSlashFill />
                          )}
                        </span>
                        {formik.touched.confirmPassword &&
                        formik.errors.confirmPassword ? (
                          <div className="text-danger">
                            {formik.errors.confirmPassword}
                          </div>
                        ) : null}
                      </div>
                      <div className="text-center w-100 mt-4 mb-3">
                        <button type="submit" class="custom-sign-btn w-100">
                          Reset Password
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

export default Resetpassword;
