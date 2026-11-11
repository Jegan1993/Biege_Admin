import React, { useState } from "react";
import OtpInput from "react-otp-input";
import frame2 from "../Assets/images/Frame-2.png";
import Profile from "../Assets/images/profile.png";

function Otp() {
  const [otp, setOtp] = useState("");

  return (
    <div className="App">
      <div className="container-fluid">
        <div className="custom-sign min-vh-100 ">
          <div className="row">
            <div className="col-lg-12">
              <div className="row align-items-center">
                <div className="col-lg-5">
                  <div className="custom-inside-sign">
                    <div className="text-center">
                      <img style={{ width: "50px" }} src={Profile}></img>
                      <p className="fw-bold">OTP</p>
                    </div>

                    <form>
                      <div className="mt-3 text-center justify-content-center align-items-center d-flex custom-otp-1">
                        <OtpInput
                          value={otp}
                          onChange={setOtp}
                          numInputs={4}
                          renderSeparator={<span>-</span>}
                          renderInput={(props) => <input {...props} />}
                        />
                      </div>

                      <div className="text-center w-100 mt-3 mb-3">
                        <button type="submit" class="custom-sign-btn w-100">
                          Submit
                        </button>
                      </div>
                    </form>
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

export default Otp;
