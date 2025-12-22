import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { paymentAPI } from "../services/api";

function DeveloperAPILanding() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(null);

  const pricingTiers = [
    {
      id: "api-trial",
      name: "API Trial",
      price: "Free",
      period: "forever",
      rateLimit: "100 requests/month",
      features: [
        "100 API requests per month",
        "Image compression API",
        "Basic support",
        "API key management",
        "Usage analytics",
      ],
      popular: false,
      apiPrice: true,
    },
    {
      id: "api-pro",
      name: "API Professional",
      price: "$19.99",
      period: "per month",
      rateLimit: "10,000 requests/month",
      features: [
        "10,000 API requests per month",
        "Advanced compression options",
        "Priority support",
        "Unlimited API keys",
        "Advanced analytics",
        "Webhook support",
        "Custom integrations",
      ],
      popular: true,
      apiPrice: true,
    },
    {
      id: "api-enterprise",
      name: "API Enterprise",
      price: "Custom",
      period: "",
      rateLimit: "Unlimited",
      features: [
        "Unlimited API requests",
        "Dedicated support team",
        "99.99% SLA guarantee",
        "Custom rate limits",
        "On-premise deployment option",
        "White-label options",
        "24/7 premium support",
      ],
      popular: false,
      apiPrice: true,
    },
  ];

  const handleSubscribe = async (tierId) => {
    if (tierId === "api-trial") {
      navigate("/developer");
      return;
    }
    
    if (tierId === "api-enterprise") {
      window.location.href = "mailto:sales@intellipix.com?subject=Enterprise API Plan Inquiry";
      return;
    }

    // For API Pro plan
    try {
      setLoading(tierId);
      const { checkout_url } = await paymentAPI.createCheckout();
      if (checkout_url) {
        window.location.href = checkout_url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Please sign in to subscribe to an API plan");
      navigate("/upload");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-y-auto">
      {/* Hero Section */}
      <div className="min-h-[60vh] bg-gradient-to-b from-gray-50 to-white border-b border-gray-200 flex items-center">
        <div className="max-w-7xl mx-auto px-6 py-16 w-full">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-6">
              Developer API
            </h1>
            <p className="text-xl text-gray-600 mb-8 font-light">
              Integrate professional image compression into your applications
              with our simple, powerful API
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                to="/developer"
                className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-light"
              >
                Get Started
              </Link>
              <a
                href="#pricing"
                className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-light"
              >
                View Pricing
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-light text-gray-900 text-center mb-16">
            Why Choose IntelliPix API?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-900"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-light text-gray-900 mb-3">
                Fast & Reliable
              </h3>
              <p className="text-gray-600 text-sm font-light leading-relaxed">
                High-performance compression with sub-second response times and
                99.9% uptime SLA
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-900"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-light text-gray-900 mb-3">
                Secure & Private
              </h3>
              <p className="text-gray-600 text-sm font-light leading-relaxed">
                API key authentication, encrypted connections, and no data
                retention
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-900"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-light text-gray-900 mb-3">
                Easy Integration
              </h3>
              <p className="text-gray-600 text-sm font-light leading-relaxed">
                Simple REST API with comprehensive documentation and code examples
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="min-h-screen bg-gray-50 border-t border-gray-200 flex items-center py-20">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light text-gray-900 mb-4">
              API Pricing Plans
            </h2>
            <p className="text-gray-600">
              Choose the API plan that fits your needs. No hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingTiers.map((tier) => (
              <div
                key={tier.id}
                className={`bg-white rounded-lg border-2 p-8 transition-all duration-200 hover:shadow-xl ${
                  tier.popular
                    ? "border-gray-900 shadow-lg transform scale-105"
                    : "border-gray-200"
                }`}
              >
                {tier.popular && (
                  <div className="text-center mb-4">
                    <span className="text-xs bg-gray-900 text-white px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <h3 className="text-xl font-light text-gray-900 mb-2 text-center">
                  {tier.name}
                </h3>
                <div className="mb-6 text-center">
                  <span className="text-4xl font-light text-gray-900">
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className="text-gray-600 ml-2">{tier.period}</span>
                  )}
                </div>
                <div className="mb-6 text-center pb-6 border-b border-gray-100">
                  <div className="text-sm text-gray-500 mb-1">Rate Limit</div>
                  <div className="text-lg font-light text-gray-900">
                    {tier.rateLimit}
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg
                        className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
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
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleSubscribe(tier.id)}
                  disabled={loading === tier.id}
                  className={`block w-full text-center py-3 rounded-lg transition-all duration-200 text-sm font-light disabled:opacity-50 disabled:cursor-not-allowed ${
                    tier.popular
                      ? "bg-gray-900 text-white hover:bg-gray-800"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {loading === tier.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </span>
                  ) : tier.id === "api-enterprise" ? (
                    "Contact Sales"
                  ) : tier.id === "api-trial" ? (
                    "Start Free"
                  ) : (
                    "Subscribe Now"
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* CTA Section */}
      <div className="min-h-[50vh] bg-gray-900 text-white flex items-center">
        <div className="max-w-7xl mx-auto px-6 py-16 text-center w-full">
          <h2 className="text-3xl md:text-4xl font-light mb-4">Ready to Get Started?</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto font-light">
            Start compressing images with our API in minutes. No credit card
            required for the free trial.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/developer"
              className="px-8 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors text-sm font-light"
            >
              View Documentation
            </Link>
            <Link
              to="/upload"
              className="px-8 py-3 border border-white text-white rounded-lg hover:bg-white hover:text-gray-900 transition-colors text-sm font-light"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Start Section */}
      <div className="min-h-screen bg-white flex items-center py-20">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-4">
              Quick Start Guide
            </h2>
            <p className="text-gray-600 font-light">
              Get up and running in 5 minutes
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-light">
                  1
                </div>
                <div className="text-sm text-gray-600">Get your API key</div>
              </div>
              <pre className="text-sm text-gray-900 bg-white p-4 rounded border border-gray-200 overflow-x-auto">
                <code>{`curl -X POST https://api.intellipix.com/api/dev/keys \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{"name": "My API Key"}'`}</code>
              </pre>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-light">
                  2
                </div>
                <div className="text-sm text-gray-600">Compress an image</div>
              </div>
              <pre className="text-sm text-gray-900 bg-white p-4 rounded border border-gray-200 overflow-x-auto">
                <code>{`curl -X POST https://api.intellipix.com/api/v1/compress \\
  -H "X-API-Key: ipx_your_api_key" \\
  -F "file=@image.jpg" \\
  -F "quality=80" \\
  -o compressed.jpg`}</code>
              </pre>
            </div>

            <div className="text-center pt-4">
              <Link
                to="/developer"
                className="text-sm text-gray-600 hover:text-gray-900 font-light"
              >
                View full documentation →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeveloperAPILanding;

