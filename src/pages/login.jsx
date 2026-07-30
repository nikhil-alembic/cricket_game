import { useState } from "react";
import { useNavigate } from "react-router";

export default function Login() {
  const [employeeId, setEmployeeId] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const next = {};
    if (!employeeId.trim()) next.employeeId = "Employee ID is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch(
        "https://alembicdigilabs.com/corporate_com/ho_cricket_activity/backend/login.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emp_code: employeeId }),
        },
      );

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      const data = await res.json();

      if (data.status) {
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        navigate("/");
      } else {
        setErrors({ employeeId: data.message || "Invalid employee ID" });
      }
    } catch (err) {
      console.error("Login failed:", err);
      setErrors({ employeeId: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-dvh w-full flex-col overflow-hidden bg-black">
      {/* Background */}
      <div className="absolute inset-0 bg-[url('/bg_02.png')] bg-cover bg-center bg-no-repeat blur-xs" />
      <div className="absolute inset-0 bg-black/20" />

      {/* Logo */}
      <div className="absolute left-4 top-4 z-10 sm:left-8 sm:top-6 lg:left-12">
        <img
          src="/alembic_white_logo.svg"
          alt="Alembic"
          className="w-28 sm:w-36 md:w-44"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex w-full flex-1 flex-col items-center justify-center gap-8 px-4 py-24 sm:py-28 lg:flex-row lg:justify-center lg:gap-16 lg:py-16">
        {/* Hero mark */}
        <img
          src="/game_logo.png"
          alt="Hit the Century"
          className="w-56 sm:w-72 md:w-80 lg:w-[420px]"
        />

        {/* Login card */}
        <div className="w-full max-w-xs rounded-3xl border border-white/30 bg-white/10 p-6 shadow-2xl backdrop-blur-md sm:max-w-sm sm:p-8">
          <h1 className="mb-6 text-center text-xl font-bold text-white sm:text-2xl">
            Registor Employee
          </h1>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              s
              <input
                id="employeeId"
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="Employee code"
                className={`w-full rounded-full border bg-white/90 px-5 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:ring-2 focus:ring-blue-400 ${
                  errors.employeeId ? "border-red-400" : "border-white/40"
                }`}
              />
              {errors.employeeId && (
                <p className="mt-1.5 pl-2 text-xs text-red-300">
                  {errors.employeeId}
                </p>
              )}
            </div>

            <div className="flex justify-center pt-2">
              <button
                type="submit"
                disabled={loading}
                aria-label="Sign in"
                className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-b from-blue-500 to-blue-700 shadow-lg transition hover:from-blue-400 hover:to-blue-600 disabled:opacity-60 disabled:cursor-not-allowed sm:h-20 sm:w-20"
              >
                {loading ? (
                  <svg
                    className="h-5 w-5 animate-spin text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                ) : (
                  <img src="/playbtn.svg" />
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
