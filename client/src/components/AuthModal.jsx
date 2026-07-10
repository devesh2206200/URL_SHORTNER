import React, { useState } from "react";
import { X, Lock, Mail, ArrowRight, Loader2 } from "lucide-react";

export default function AuthModal({
  isOpen,
  onClose,
  onAuthSuccess,
}) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const apiUrl =
    process.env.REACT_APP_API_URL || "http://localhost:5000";

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const endpoint = isLogin
        ? "/api/auth/login"
        : "/api/auth/register";

      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      console.log("Backend Response:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Authentication failed"
        );
      }

      // Backend Response:
      // {
      //   statusCode: 200,
      //   data: {
      //      user: {...},
      //      accessToken: "..."
      //   },
      //   message: "...",
      //   success: true
      // }

      const accessToken = data.data.accessToken;
      const user = data.data.user;

      onAuthSuccess(accessToken, user);

      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setError("");

      onClose();
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-overlay">
      <div className="auth-modal-card">
        <button
          className="auth-close-btn"
          onClick={onClose}
        >
          <X size={20} />
        </button>

        <div className="auth-header">
          <h2>
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>

          <p>
            {isLogin
              ? "Sign in to access your dashboard and track links."
              : "Get started to manage links, customize URLs, and view detailed analytics."}
          </p>
        </div>

        {error && (
          <div className="auth-error-badge">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="auth-form"
        >
          <div className="auth-input-group">
            <label htmlFor="email">
              Email Address
            </label>

            <div className="auth-input-wrapper">
              <Mail
                className="auth-input-icon"
                size={18}
              />

              <input
                type="email"
                id="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />
            </div>
          </div>

          <div className="auth-input-group">
            <label htmlFor="password">
              Password
            </label>

            <div className="auth-input-wrapper">
              <Lock
                className="auth-input-icon"
                size={18}
              />

              <input
                type="password"
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />
            </div>
          </div>

          {!isLogin && (
            <div className="auth-input-group">
              <label htmlFor="confirmPassword">
                Confirm Password
              </label>

              <div className="auth-input-wrapper">
                <Lock
                  className="auth-input-icon"
                  size={18}
                />

                <input
                  type="password"
                  id="confirmPassword"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <Loader2
                className="animate-spin"
                size={18}
              />
            ) : (
              <>
                {isLogin ? "Sign In" : "Sign Up"}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <span>
            {isLogin
              ? "Don't have an account?"
              : "Already have an account?"}
          </span>

          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setEmail("");
              setPassword("");
              setConfirmPassword("");
            }}
          >
            {isLogin
              ? "Create one now"
              : "Sign in instead"}
          </button>
        </div>
      </div>
    </div>
  );
}