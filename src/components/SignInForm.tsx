"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);

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
                flow === "signIn" ? "Signed in!" : "Account created!"
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
        <input
          className="auth-input-field mb-6"
          type="password"
          name="password"
          placeholder="Password"
          required
          minLength={8}
        />
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
