import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";

function Landing() {
  const navigate = useNavigate();

  const handleUploadClick = () => {
    navigate("/upload");
  };

  const handleSignUp = () => {
    authAPI.login();
  };

  return (
    <div className="bg-white">
      {/* Hero Section - 100vh */}
      <section className="h-screen max-w-7xl mx-auto px-6 flex items-center justify-center relative overflow-hidden">
        {/* Minimal Logo Background - Smaller */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
          <img
            src="/media/minimal-logo.png"
            alt=""
            className="w-full max-w-xl h-auto"
          />
        </div>

        <div className="text-center max-w-4xl mx-auto relative z-10 w-full">
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-6">
            Professional Image Compression
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 font-light mb-4 leading-relaxed">
            Reduce your image file sizes by up to 90% while maintaining
            excellent quality. Perfect for websites, apps, and digital content.
          </p>
          <p className="text-lg text-gray-500 font-light mb-12">
            Fast, secure, and easy to use. Get started in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleUploadClick}
              className="w-full sm:w-auto bg-gray-900 text-white px-8 py-4 rounded-lg text-base font-light tracking-wide hover:bg-gray-800 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
              Upload Image
            </button>
            <button
              onClick={handleSignUp}
              className="w-full sm:w-auto bg-white border border-gray-300 text-gray-900 px-8 py-4 rounded-lg text-base font-light tracking-wide hover:bg-gray-50 transition-all duration-200"
            >
              Get 3 Free Images
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-700"
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
              <h3 className="text-lg font-light text-gray-900 mb-2">
                Lightning Fast
              </h3>
              <p className="text-sm text-gray-500 font-light">
                Compress images in seconds with our optimized algorithms
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-light text-gray-900 mb-2">
                High Quality
              </h3>
              <p className="text-sm text-gray-500 font-light">
                Maintain excellent image quality while reducing file size
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-700"
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
              <h3 className="text-lg font-light text-gray-900 mb-2">
                Secure & Private
              </h3>
              <p className="text-sm text-gray-500 font-light">
                Your images are processed securely and never stored permanently
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-light text-gray-900 text-center mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-light text-gray-400 mb-4">1</div>
              <h3 className="text-lg font-light text-gray-900 mb-2">
                Upload Your Image
              </h3>
              <p className="text-sm text-gray-500 font-light">
                Select or drag and drop your PNG or JPEG image
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-light text-gray-400 mb-4">2</div>
              <h3 className="text-lg font-light text-gray-900 mb-2">
                Choose Compression
              </h3>
              <p className="text-sm text-gray-500 font-light">
                Adjust the compression level to balance size and quality
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-light text-gray-400 mb-4">3</div>
              <h3 className="text-lg font-light text-gray-900 mb-2">
                Download Result
              </h3>
              <p className="text-sm text-gray-500 font-light">
                Get your compressed image instantly, ready to use
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Landing;
