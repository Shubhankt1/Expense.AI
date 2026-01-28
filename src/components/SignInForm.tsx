"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full">
      <form
        className="flex flex-col gap-form-field items-center"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitting(true);
          const formData = new FormData(e.target as HTMLFormElement);
          formData.set("flow", flow);

          void signIn("password", formData)
            .then(() => {
              toast.success(
                flow === "signIn" ? "Signed in!" : "Account created!",
              );
            })
            .catch((error) => {
              console.error("Auth error:", error);

              let toastTitle = "";

              if (error.message.includes("Invalid password")) {
                toastTitle = "Incorrect password.";
              } else if (error.message.includes("already exists")) {
                toastTitle = "Email already exists. Try signing in instead.";
              } else if (error.message.includes("not found")) {
                toastTitle = "Account not found. Try signing up instead.";
              } else {
                toastTitle =
                  flow === "signIn"
                    ? "Could not sign in, did you mean to sign up?"
                    : "Could not sign up, did you mean to sign in?";
              }

              toast.error(toastTitle);
              setSubmitting(false);
            });
        }}
      >
        <input
          className="auth-input-field mb-2"
          type="email"
          name="email"
          placeholder="Email"
          required
        />
        <div className="relative w-full mb-6">
          <input
            className="auth-input-field pr-10"
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            required
            minLength={8}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            style={{ transform: "translateY(-50%)" }}
          >
            {showPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
        {flow === "signUp" && (
          <p className="text-xs text-secondary">
            Password must contain: 8+ characters, uppercase, lowercase, and
            number
          </p>
        )}
        <button
          className="auth-button max-w-[256px] mb-2"
          type="submit"
          disabled={submitting}
        >
          {submitting
            ? "Loading..."
            : flow === "signIn"
              ? "Sign in"
              : "Sign up"}
        </button>
        <div className="text-center text-sm text-secondary">
          <span>
            {flow === "signIn"
              ? "Don't have an account? "
              : "Already have an account? "}
          </span>
          <button
            type="button"
            className="text-primary hover:text-primary-hover hover:underline font-medium cursor-pointer"
            onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
          >
            {flow === "signIn" ? "Sign up instead" : "Sign in instead"}
          </button>
        </div>
      </form>
      <div className="flex items-center justify-center my-3">
        <hr className="my-4 grow border-gray-200" />
        <span className="mx-4 text-secondary">or</span>
        <hr className="my-4 grow border-gray-200" />
      </div>
      <div className="flex justify-center">
        <button
          className="auth-button max-w-[256px] !bg-blue-400"
          onClick={() => void signIn("anonymous")}
        >
          Sign in anonymously
        </button>
      </div>
    </div>
  );
}
