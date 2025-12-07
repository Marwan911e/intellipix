import { useNavigate } from "react-router-dom";
import { Crown } from "lucide-react";
import Payment from "../components/Payment";
import { useState } from "react";

function Pricing({ user, onUpgrade }) {
  const navigate = useNavigate();
  const [showPayment, setShowPayment] = useState(false);

  const handleGetStarted = () => {
    if (user) {
      setShowPayment(true);
    } else {
      navigate("/upload");
    }
  };

  if (showPayment) {
    return (
      <Payment
        onSuccess={() => {
          setShowPayment(false);
          if (onUpgrade) onUpgrade();
        }}
        onCancel={() => setShowPayment(false)}
      />
    );
  }

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-6xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-500 font-light">
              Choose the plan that works for you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Free Trial */}
            <div className="bg-gray-50 rounded-lg p-8 border border-gray-200 flex flex-col">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-light text-gray-900 mb-2">
                  Free Trial
                </h2>
                <div className="text-4xl font-light text-gray-900 mb-2">$0</div>
                <div className="text-sm text-gray-500">3 free compressions</div>
              </div>
              <ul className="space-y-3 mb-6 flex-1">
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
                  3 free image compressions
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
                  Watermarked images after trial
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
                  No credit card required
                </li>
              </ul>
              <button
                onClick={() => navigate("/upload")}
                className="w-full bg-white border border-gray-300 text-gray-900 py-3 px-6 rounded-lg text-sm font-light hover:bg-gray-50 transition-colors"
              >
                Start Free Trial
              </button>
            </div>

            {/* Pro Plan */}
            <div className="bg-gray-900 rounded-lg p-8 text-white flex flex-col">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Crown className="w-6 h-6 text-gray-300" />
                  <h2 className="text-2xl font-light">Pro</h2>
                </div>
                <div className="text-4xl font-light mb-2">$9.99</div>
                <div className="text-sm text-gray-400">per month</div>
              </div>
              <ul className="space-y-3 mb-6 flex-1">
                <li className="flex items-center text-sm">
                  <svg
                    className="w-5 h-5 text-green-400 mr-3"
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
                <li className="flex items-center text-sm">
                  <Crown className="w-5 h-5 text-gray-300 mr-3" />
                  No watermarks
                </li>
                <li className="flex items-center text-sm">
                  <svg
                    className="w-5 h-5 text-green-400 mr-3"
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
                <li className="flex items-center text-sm">
                  <svg
                    className="w-5 h-5 text-green-400 mr-3"
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
                <li className="flex items-center text-sm">
                  <svg
                    className="w-5 h-5 text-green-400 mr-3"
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
              <button
                onClick={handleGetStarted}
                className="w-full bg-white text-gray-900 py-3 px-6 rounded-lg text-sm font-light hover:bg-gray-100 transition-colors"
              >
                {user ? "Subscribe Now" : "Get Started"}
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center mt-8">
            Secure payment powered by Stripe
          </p>
        </div>
      </div>
    </div>
  );
}

export default Pricing;
