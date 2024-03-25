import React, { useEffect, useState } from "react";
import Input from "../../../components/javascript/Input";
import Button from "../../../components/javascript/Button";
import { useNavigate } from "react-router-dom";
import logo from "../../../images/transparentlogo.png";
import "../../css/auth.css";
import { useSnackbar } from "notistack";

const Login = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const userid = localStorage.getItem("id");

  const [data, setData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState("");

  useEffect(() => {
    if (userid) {
      navigate("/");
    }
  }, []);

  const handleChange = (e) => {
    setData({ ...data, [e.target.id]: e.target.value });
  };

  const showsnackbar = () => {
    enqueueSnackbar("Invalid credentials", { variant: "error" });
  };

  const submit = async () => {
    setLoading("button");
    try {
      if (data.email === "") {
        enqueueSnackbar("Email is required", { variant: "error" });
      } else if (data.password === "") {
        enqueueSnackbar("Password is required", { variant: "error" });
      } else {
        const response = await fetch("https://lcbp-api.vercel.app/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        const res = await response.json();
        if (res.success) {
          localStorage.setItem("id", res.id);
          navigate("/chats");
          return;
        }
        showsnackbar();
      }
    } catch (error) {
      enqueueSnackbar("An error occurred during login", { variant: "error" });
    } finally {
      setLoading("");
    }
  };

  return (
    <div className="maincont">
      <section className="leftcont">
        <div className="welcomediv">
          <h1>LC Chat</h1>
          <p>Log into an existing account.</p>
        </div>
        <div>
          <div className="inputdiv">
            <Input
              label="Email"
              value={data.email}
              onchange={handleChange}
              placeholder="Enter your email"
              type="email"
              id="email"
            />
            <Input
              label="Password"
              placeholder="Enter your password"
              type="password"
              value={data.password}
              onchange={handleChange}
              id="password"
            />
          </div>
        </div>
        <div>
          <div className="buttonsdiv">
            <Button
              loading={loading === "button"}
              text="Login"
              theme="gradient"
              submit={submit}
            />
          </div>
          <div className="leftlastdiv">
            <p>
              Don't have an account ?{" "}
              <span
                onClick={() => {
                  navigate("/signup");
                }}
              >
                Sign up
              </span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Login;
