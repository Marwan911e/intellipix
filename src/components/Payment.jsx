import { useState, useEffect } from "react";
import { Crown } from "lucide-react";
import { paymentAPI } from "../services/api";

function Payment({ onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const { checkout_url } = await paymentAPI.createCheckout();
      if (checkout_url) {
        window.location.href = checkout_url;
      } else {
        setError("Failed to create checkout session");
        setLoading(false);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to start checkout");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Crown className="w-8 h-8 text-gray-400" />
            <h2 className="text-3xl font-light text-gray-900">
              Upgrade to Pro
            </h2>
          </div>
          <p className="text-gray-500 text-sm font-light">
            Get unlimited image compressions
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-8 mb-6">
          <div className="text-center mb-6">
            <div className="text-4xl font-light text-gray-900 mb-2">$9.99</div>
            <div className="text-sm text-gray-500">per month</div>
          </div>

          <ul className="space-y-3 mb-6">
            <li className="flex items-center text-sm text-gray-700">
              <svg
                className="w-5 h-5 text-green-500 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Unlimited image compressions
            </li>
            <li className="flex items-center text-sm text-gray-700">
              <svg
                className="w-5 h-5 text-green-500 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              High-quality compression
            </li>
            <li className="flex items-center text-sm text-gray-700">
              <svg
                className="w-5 h-5 text-green-500 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Priority support
            </li>
            <li className="flex items-center text-sm text-gray-700">
              <svg
                className="w-5 h-5 text-green-500 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Cancel anytime
            </li>
          </ul>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-gray-900 text-white py-3.5 px-6 rounded-lg text-sm font-light tracking-wide hover:bg-gray-800 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </>
            ) : (
              <span>Subscribe Now</span>
            )}
          </button>

          {onCancel && (
            <button
              onClick={onCancel}
              className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          )}
        </div>

        <p className="text-xs text-gray-400 text-center">
          Secure payment powered by Stripe
        </p>
      </div>
    </div>
  );
}

export default Payment;
