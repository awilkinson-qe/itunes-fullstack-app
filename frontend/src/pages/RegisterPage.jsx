// RegisterPage.jsx - Page for user registration
// This page allows users to create an account with username, email, and password.
// It uses Formik for form handling and Yup for validation.
// On successful registration, the user is logged in and redirected to the home page.

import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

// Validation schema for registration form
const registerSchema = Yup.object({
  username: Yup.string()
    .min(3, "Username must be at least 3 characters.")
    .required("Please enter a username."),
  email: Yup.string()
    .email("Please enter a valid email address.")
    .required("Please enter your email address."),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters.")
    .matches(/[a-z]/, "Must include at least one lowercase letter.")
    .matches(/[A-Z]/, "Must include at least one uppercase letter.")
    .matches(/[0-9]/, "Must include at least one number.")
    .matches(/[^A-Za-z0-9]/, "Must include at least one special character.")
    .test(
      "not-common",
      "Password is too common. Please choose a stronger password.",
      (value) => {
        if (!value) return false;

        const common = [
          "password",
          "password123",
          "123456",
          "12345678",
          "qwerty",
          "abc123",
        ];

        return !common.includes(value.toLowerCase());
      }
    )
    .required("Please enter a password."),
});

// Clear previous session state
const clearSearchSessionState = () => {
  sessionStorage.removeItem("searchTerm");
  sessionStorage.removeItem("searchMedia");
  sessionStorage.removeItem("searchResults");
  sessionStorage.removeItem("hasSearched");
  sessionStorage.removeItem("searchOffset");
  sessionStorage.removeItem("hasMore");
};

// Password strength helper
const getPasswordStrength = (password) => {
  if (!password) {
    return { label: "Enter a password", className: "strength-empty" };
  }

  let score = 0;

  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  const common = [
    "password",
    "password123",
    "123456",
    "12345678",
    "qwerty",
    "abc123",
  ];

  if (common.includes(password.toLowerCase())) {
    return { label: "Too weak", className: "strength-weak" };
  }

  if (score <= 2) return { label: "Weak", className: "strength-weak" };
  if (score <= 4) return { label: "Medium", className: "strength-medium" };

  return { label: "Strong", className: "strength-strong" };
};

// Generate strong password
const generateStrongPassword = (length = 14) => {
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const special = "!@#$%^&*()-_=+[]{};:,.?/";

  const allChars = lowercase + uppercase + numbers + special;

  const getRandomChar = (chars) =>
    chars[Math.floor(Math.random() * chars.length)];

  const passwordChars = [
    getRandomChar(lowercase),
    getRandomChar(uppercase),
    getRandomChar(numbers),
    getRandomChar(special),
  ];

  while (passwordChars.length < length) {
    passwordChars.push(getRandomChar(allChars));
  }

  // Shuffle
  for (let i = passwordChars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [passwordChars[i], passwordChars[j]] = [
      passwordChars[j],
      passwordChars[i],
    ];
  }

  return passwordChars.join("");
};

function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [serverMessage, setServerMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="container py-4 py-md-5">
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-5">
          <div className="card p-4 p-md-5 auth-card">
            {/* Header */}
            <div className="text-center mb-4">
              <h1 className="h3 fw-bold mb-2">Create your account</h1>
              <p className="text-white-50 mb-0">
                Register to search media and save favourites.
              </p>
            </div>

            {/* Server error */}
            {serverMessage && (
              <div className="alert alert-danger alert-dismissible fade show">
                {serverMessage}
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setServerMessage("")}
                />
              </div>
            )}

            <Formik
              initialValues={{ username: "", email: "", password: "" }}
              validationSchema={registerSchema}
              onSubmit={async (values, { setSubmitting }) => {
                setServerMessage("");

                try {
                  const response = await api.post("/auth/register", values);

                  clearSearchSessionState();
                  login(response.data.token, response.data.user);
                  navigate("/");
                } catch (error) {
                  setServerMessage(
                    error.response?.data?.message || "Registration failed."
                  );
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({
                isSubmitting,
                errors,
                touched,
                values,
                setFieldValue,
                setFieldTouched,
              }) => {
                const passwordStrength = getPasswordStrength(values.password);

                const handleSuggestPassword = async () => {
                  const suggested = generateStrongPassword();
                  setFieldValue("password", suggested);
                  setFieldTouched("password", true, false);

                  try {
                    await navigator.clipboard.writeText(suggested);
                  } catch {
                    // Ignore clipboard errors
                  }
                };

                return (
                  <Form noValidate>
                    {/* Username */}
                    <div className="mb-3">
                      <label className="form-label">Username</label>

                      <Field
                        name="username"
                        className={`form-control auth-input ${
                          touched.username && errors.username
                            ? "is-invalid"
                            : ""
                        }`}
                        placeholder="Choose a username"
                      />

                      <div className="invalid-feedback d-block">
                        <ErrorMessage name="username" />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="mb-3">
                      <label className="form-label">Email</label>

                      <Field
                        name="email"
                        type="email"
                        className={`form-control auth-input ${
                          touched.email && errors.email ? "is-invalid" : ""
                        }`}
                        placeholder="Enter your email"
                      />

                      <div className="invalid-feedback d-block">
                        <ErrorMessage name="email" />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="mb-4">
                      <label className="form-label">Password</label>

                      <div className="input-group">
                        <Field
                          name="password"
                          type={showPassword ? "text" : "password"}
                          className={`form-control auth-input ${
                            touched.password && errors.password
                              ? "is-invalid"
                              : ""
                          }`}
                          placeholder="Create a password"
                        />

                        <button
                          type="button"
                          className="btn btn-outline-light"
                          onClick={() =>
                            setShowPassword((prev) => !prev)
                          }
                        >
                          {showPassword ? "Hide" : "Show"}
                        </button>
                      </div>

                      <div className="mt-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-info rounded-pill"
                          onClick={handleSuggestPassword}
                        >
                          Suggest strong password
                        </button>
                      </div>

                      <div className={`small mt-2 ${passwordStrength.className}`}>
                        Password strength: {passwordStrength.label}
                      </div>

                      <div className="invalid-feedback d-block">
                        <ErrorMessage name="password" />
                      </div>
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      className="btn btn-success w-100 rounded-pill py-2"
                      disabled={isSubmitting}
                    >
                      {isSubmitting
                        ? "Creating account..."
                        : "Create account"}
                    </button>
                  </Form>
                );
              }}
            </Formik>

            {/* Footer */}
            <p className="mt-4 mb-0 text-center text-white-50">
              Already have an account?{" "}
              <Link to="/login" className="auth-link">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;