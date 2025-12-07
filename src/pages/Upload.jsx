import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Crown } from "lucide-react";
import TrialStatus from "../components/TrialStatus";
import Payment from "../components/Payment";
import { userAPI, compressAPI } from "../services/api";

function Upload({ user }) {
  const navigate = useNavigate();
  const [trialStatus, setTrialStatus] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [originalSize, setOriginalSize] = useState(null);
  const [compressedSize, setCompressedSize] = useState(null);
  const [loading, setLoading] = useState(false);
  const [compressedBlobUrl, setCompressedBlobUrl] = useState(null);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [targetReduction, setTargetReduction] = useState(40);
  const [displayReduction, setDisplayReduction] = useState(40);
  const [showPayment, setShowPayment] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const compressionTimeoutRef = useRef(null);
  const isCompressingRef = useRef(false);
  const lastCompressedRef = useRef({ file: null, reduction: null });

  const loadTrialStatus = useCallback(async (userData) => {
    if (!userData) return;
    try {
      const status = await userAPI.getTrialStatus();
      setTrialStatus(status);
    } catch (error) {
      console.error("Failed to load trial status:", error);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadTrialStatus(user);
    }
  }, [user, loadTrialStatus]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    if (!file.type.match(/^image\/(png|jpeg|jpg)$/)) {
      setError("Please select a PNG or JPEG image");
      return;
    }

    lastCompressedRef.current = { file: null, reduction: null };
    setSelectedFile(file);
    setOriginalSize(file.size);
    setCompressedSize(null);
    setCompressedBlobUrl(null);
    setError(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleCompress = useCallback(async () => {
    if (!selectedFile || !originalSize) {
      setError("Please select an image first");
      return;
    }

    const fileKey = `${selectedFile.name}-${selectedFile.size}-${targetReduction}`;
    if (
      lastCompressedRef.current.file === fileKey &&
      isCompressingRef.current === false
    ) {
      return;
    }

    if (isCompressingRef.current) {
      return;
    }

    isCompressingRef.current = true;
    lastCompressedRef.current = { file: fileKey, reduction: targetReduction };
    setLoading(true);
    setError(null);

    if (compressedBlobUrl) {
      URL.revokeObjectURL(compressedBlobUrl);
      setCompressedBlobUrl(null);
    }

    try {
      const blob = await compressAPI.compress(selectedFile, targetReduction);
      const blobUrl = URL.createObjectURL(blob);
      setCompressedSize(blob.size);
      setCompressedBlobUrl(blobUrl);

      if (user) {
        setTimeout(() => {
          loadTrialStatus(user);
        }, 100);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data ||
        err.message ||
        "An error occurred during compression";
      if (
        typeof errorMessage === "string" &&
        errorMessage.includes("Trial limit exceeded")
      ) {
        setError(
          "Trial limit exceeded. Images will be watermarked. Upgrade to remove watermark."
        );
      } else {
        setError(errorMessage);
      }
      lastCompressedRef.current = { file: null, reduction: null };
    } finally {
      setLoading(false);
      isCompressingRef.current = false;
    }
  }, [
    selectedFile,
    originalSize,
    targetReduction,
    user,
    loadTrialStatus,
    compressedBlobUrl,
  ]);

  useEffect(() => {
    if (!selectedFile || !originalSize || loading || isCompressingRef.current)
      return;

    const fileKey = `${selectedFile.name}-${selectedFile.size}-${targetReduction}`;
    if (lastCompressedRef.current.file === fileKey) {
      return;
    }

    if (compressionTimeoutRef.current) {
      clearTimeout(compressionTimeoutRef.current);
    }

    const delay = compressedSize !== null ? 500 : 0;

    compressionTimeoutRef.current = setTimeout(() => {
      if (
        !isCompressingRef.current &&
        lastCompressedRef.current.file !== fileKey
      ) {
        handleCompress();
      }
    }, delay);

    return () => {
      if (compressionTimeoutRef.current) {
        clearTimeout(compressionTimeoutRef.current);
      }
    };
  }, [
    selectedFile,
    originalSize,
    targetReduction,
    handleCompress,
    loading,
    compressedSize,
  ]);

  const handleDownload = () => {
    if (compressedBlobUrl) {
      setShowDownloadModal(true);
    }
  };

  const handleDownloadChoice = (preferNoWatermark) => {
    setShowDownloadModal(false);

    if (preferNoWatermark) {
      // Check if user has access to no-watermark version
      const hasAccess = user && trialStatus && trialStatus.has_access;

      if (!hasAccess) {
        // Redirect to pricing page
        navigate("/pricing");
        return;
      }
    }

    // Download the image (backend already determined watermark based on user status)
    if (compressedBlobUrl) {
      const link = document.createElement("a");
      link.href = compressedBlobUrl;
      link.download = "compressed.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getCompressionRatio = () => {
    if (!originalSize || !compressedSize) return null;
    const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(1);
    return ratio;
  };

  if (showPayment) {
    return (
      <Payment
        onSuccess={() => {
          setShowPayment(false);
          loadTrialStatus(user);
        }}
        onCancel={() => setShowPayment(false)}
      />
    );
  }

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12 py-8">
          <div
            className={`flex flex-col ${
              selectedFile
                ? "lg:flex-row items-start"
                : "items-center justify-center"
            } gap-8 lg:gap-12`}
          >
            {/* Left Column - Upload & Controls */}
            <div
              className={`w-full ${
                selectedFile ? "lg:w-1/2 lg:max-w-lg" : "max-w-md"
              }`}
            >
              {/* Trial Status for authenticated users */}
              {user && (
                <TrialStatus
                  trialStatus={trialStatus}
                  onUpgrade={() => setShowPayment(true)}
                />
              )}

              {/* File Upload Area */}
              <div className="mb-6">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border border-gray-200 rounded-lg p-8 md:p-12 text-center transition-all duration-300 ${
                    isDragging
                      ? "border-gray-400 bg-gray-50"
                      : selectedFile
                      ? "border-gray-300"
                      : "hover:border-gray-300"
                  }`}
                >
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center justify-center"
                  >
                    <svg
                      className="w-10 h-10 text-gray-400 mb-4"
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
                    <span className="text-gray-600 text-sm font-light mb-1">
                      {selectedFile
                        ? "Change Image"
                        : "Drop image here or click to browse"}
                    </span>
                    <span className="text-gray-400 text-xs font-light">
                      PNG or JPEG
                    </span>
                  </label>
                </div>

                {selectedFile && (
                  <div className="mt-4 flex items-center justify-between py-3 px-4 border-b border-gray-100">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 font-light truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-500 font-light mt-0.5">
                        {formatFileSize(originalSize)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Size Reduction Control */}
              {selectedFile && originalSize && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm text-gray-600 font-light">
                      Compression
                    </label>
                    <span className="text-sm text-gray-900 font-light">
                      {displayReduction}%
                    </span>
                  </div>
                  <div className="mb-2">
                    <input
                      type="range"
                      min="0"
                      max="90"
                      step="5"
                      value={displayReduction}
                      onChange={(e) => {
                        const newReduction = parseInt(e.target.value);
                        setDisplayReduction(newReduction);
                        setTargetReduction(newReduction);
                      }}
                      className="w-full h-0.5 bg-gray-200 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #1d1d1f 0%, #1d1d1f ${
                          (displayReduction / 90) * 100
                        }%, #e5e7eb ${
                          (displayReduction / 90) * 100
                        }%, #e5e7eb 100%)`,
                      }}
                      disabled={loading}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 font-light">
                    <span>0% - Max Quality</span>
                    <span>90% - Max Compression</span>
                  </div>
                </div>
              )}

              {/* Loading Indicator */}
              {loading && (
                <div className="mb-6 flex items-center justify-center py-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"></div>
                    <div
                      className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-6 py-3 px-4 border-l-2 border-red-500 bg-red-50/30">
                  <p className="text-sm text-red-700 font-light">{error}</p>
                </div>
              )}
            </div>

            {/* Right Column - Results */}
            {selectedFile && (
              <div className="w-full lg:w-1/2 lg:max-w-lg">
                {/* Compression Results */}
                {compressedSize && (
                  <div className="mb-6 space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <span className="text-sm text-gray-600 font-light">
                        Original
                      </span>
                      <span className="text-sm text-gray-900 font-light">
                        {formatFileSize(originalSize)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <span className="text-sm text-gray-600 font-light">
                        Compressed
                      </span>
                      <span className="text-sm text-gray-900 font-light">
                        {formatFileSize(compressedSize)}
                      </span>
                    </div>
                    {getCompressionRatio() && (
                      <div className="flex items-center justify-between py-4">
                        <span className="text-sm text-gray-600 font-light">
                          Reduction
                        </span>
                        <span className="text-lg text-gray-900 font-light">
                          {getCompressionRatio()}%
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Download Button */}
                {compressedBlobUrl && (
                  <button
                    onClick={handleDownload}
                    className="w-full bg-gray-900 text-white py-3.5 px-6 rounded-lg
                  text-sm font-light tracking-wide hover:bg-gray-800
                  transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <svg
                      className="w-4 h-4"
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
                    <span>Download</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Download Modal */}
      {showDownloadModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowDownloadModal(false)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-light text-gray-900 mb-4">
              Choose Download Option
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => handleDownloadChoice(false)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 py-3 px-6 rounded-lg
                  text-sm font-light hover:bg-gray-100 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <svg
                  className="w-4 h-4"
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
                <span>Download with watermark</span>
              </button>
              <button
                onClick={() => handleDownloadChoice(true)}
                className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg
                  text-sm font-light tracking-wide hover:bg-gray-800
                  transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Crown className="w-4 h-4 text-gray-300" />
                <span>Download without watermark</span>
              </button>
            </div>
            <button
              onClick={() => setShowDownloadModal(false)}
              className="mt-4 w-full text-sm text-gray-500 hover:text-gray-700 font-light"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Upload;
