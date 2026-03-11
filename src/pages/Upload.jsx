import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Crown, X, Layers } from "lucide-react";
import TrialStatus from "../components/TrialStatus";
import Payment from "../components/Payment";
import { userAPI, compressAPI } from "../services/api";

function Upload({ user }) {
  const navigate = useNavigate();
  const [trialStatus, setTrialStatus] = useState(null);
  
  // Mode selection
  const [isBatchMode, setIsBatchMode] = useState(false);
  
  // Single file mode states
  const [selectedFile, setSelectedFile] = useState(null);
  const [originalSize, setOriginalSize] = useState(null);
  const [compressedSize, setCompressedSize] = useState(null);
  const [compressedBlobUrl, setCompressedBlobUrl] = useState(null);
  
  // Batch mode states
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [batchOriginalSize, setBatchOriginalSize] = useState(0);
  const [batchCompressedBlobUrl, setBatchCompressedBlobUrl] = useState(null);
  
  // Common states
  const [loading, setLoading] = useState(false);
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
    if (isBatchMode) {
      const files = Array.from(e.target.files);
      if (files.length > 0) {
        processFiles(files);
      }
    } else {
      const file = e.target.files[0];
      if (file) {
        processFile(file);
      }
    }
  };

  const processFile = (file) => {
    if (!file.type.match(/^image\/(png|jpeg|jpg|webp|bmp)$/)) {
      setError("Please select a PNG, JPEG, WebP, or BMP image");
      return;
    }

    lastCompressedRef.current = { file: null, reduction: null };
    setSelectedFile(file);
    setOriginalSize(file.size);
    setCompressedSize(null);
    setCompressedBlobUrl(null);
    setError(null);
  };

  const processFiles = (files) => {
    // Filter valid image files
    const validFiles = files.filter((file) =>
      file.type.match(/^image\/(png|jpeg|jpg|webp|bmp)$/)
    );

    if (validFiles.length === 0) {
      setError("Please select valid PNG, JPEG, WebP, or BMP images");
      return;
    }

    if (validFiles.length !== files.length) {
      setError(
        `${
          files.length - validFiles.length
        } file(s) skipped (only PNG/JPEG/WebP/BMP supported)`
      );
    }

    lastCompressedRef.current = { file: null, reduction: null };
    setSelectedFiles(validFiles);
    const totalSize = validFiles.reduce((sum, file) => sum + file.size, 0);
    setBatchOriginalSize(totalSize);
    setBatchCompressedBlobUrl(null);
    if (validFiles.length === files.length) {
      setError(null);
    }
  };

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    const totalSize = newFiles.reduce((sum, file) => sum + file.size, 0);
    setBatchOriginalSize(totalSize);
    if (newFiles.length === 0) {
      setBatchCompressedBlobUrl(null);
      setError(null);
    }
  };

  const switchMode = (batch) => {
    setIsBatchMode(batch);
    // Reset states
    setSelectedFile(null);
    setSelectedFiles([]);
    setOriginalSize(null);
    setBatchOriginalSize(0);
    setCompressedSize(null);
    setCompressedBlobUrl(null);
    setBatchCompressedBlobUrl(null);
    setError(null);
    lastCompressedRef.current = { file: null, reduction: null };
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
    if (isBatchMode) {
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        processFiles(files);
      }
    } else {
      const file = e.dataTransfer.files[0];
      if (file) {
        processFile(file);
      }
    }
  };

  const handleCompress = useCallback(async () => {
    if (isBatchMode) {
      return handleBatchCompress();
    }

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
      // Ensure errorMessage is always a string, not a Blob
      let errorMessage = err.message || "An error occurred during compression";
      
      // If response data is a Blob, ignore it and use error message
      if (err.response?.data && !(err.response.data instanceof Blob)) {
        errorMessage = err.response.data;
      }
      
      if (
        typeof errorMessage === "string" &&
        errorMessage.includes("Trial limit exceeded")
      ) {
        setError(
          "Trial limit exceeded. Images will be watermarked. Upgrade to remove watermark."
        );
      } else {
        setError(typeof errorMessage === "string" ? errorMessage : "An error occurred during compression");
      }
      lastCompressedRef.current = { file: null, reduction: null };
    } finally {
      setLoading(false);
      isCompressingRef.current = false;
    }
  }, [
    isBatchMode,
    selectedFile,
    originalSize,
    targetReduction,
    user,
    loadTrialStatus,
    compressedBlobUrl,
  ]);

  const handleBatchCompress = useCallback(async () => {
    if (selectedFiles.length === 0) {
      setError("Please select images first");
      return;
    }

    const fileKey = selectedFiles.map((f) => f.name).join(",") + "-" + targetReduction;
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

    if (batchCompressedBlobUrl) {
      URL.revokeObjectURL(batchCompressedBlobUrl);
      setBatchCompressedBlobUrl(null);
    }

    try {
      const blob = await compressAPI.compressBatch(selectedFiles, targetReduction);
      const blobUrl = URL.createObjectURL(blob);
      setBatchCompressedBlobUrl(blobUrl);

      if (user) {
        setTimeout(() => {
          loadTrialStatus(user);
        }, 100);
      }
    } catch (err) {
      // Ensure errorMessage is always a string, not a Blob
      let errorMessage = err.message || "An error occurred during batch compression";
      
      // If response data is a Blob, ignore it and use error message
      if (err.response?.data && !(err.response.data instanceof Blob)) {
        errorMessage = err.response.data;
      }
      
      if (
        typeof errorMessage === "string" &&
        errorMessage.includes("Trial limit exceeded")
      ) {
        setError(
          "Trial limit exceeded. Images will be watermarked. Upgrade to remove watermark."
        );
      } else {
        setError(typeof errorMessage === "string" ? errorMessage : "An error occurred during batch compression");
      }
      lastCompressedRef.current = { file: null, reduction: null };
    } finally {
      setLoading(false);
      isCompressingRef.current = false;
    }
  }, [
    selectedFiles,
    targetReduction,
    user,
    loadTrialStatus,
    batchCompressedBlobUrl,
  ]);

  useEffect(() => {
    // Single file mode
    if (
      !isBatchMode &&
      (!selectedFile || !originalSize || loading || isCompressingRef.current)
    ) {
      return;
    }

    // Batch mode
    if (
      isBatchMode &&
      (selectedFiles.length === 0 || loading || isCompressingRef.current)
    ) {
      return;
    }

    const fileKey = isBatchMode
      ? selectedFiles.map((f) => f.name).join(",") + "-" + targetReduction
      : `${selectedFile.name}-${selectedFile.size}-${targetReduction}`;
      
    if (lastCompressedRef.current.file === fileKey) {
      return;
    }

    if (compressionTimeoutRef.current) {
      clearTimeout(compressionTimeoutRef.current);
    }

    const delay = 
      (!isBatchMode && compressedSize !== null) || 
      (isBatchMode && batchCompressedBlobUrl !== null) 
        ? 500 
        : 0;

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
    isBatchMode,
    selectedFile,
    selectedFiles,
    originalSize,
    targetReduction,
    handleCompress,
    loading,
    compressedSize,
    batchCompressedBlobUrl,
  ]);

  const handleDownload = () => {
    if (isBatchMode && batchCompressedBlobUrl) {
      setShowDownloadModal(true);
    } else if (!isBatchMode && compressedBlobUrl) {
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

    // Download the file (backend already determined watermark based on user status)
    if (isBatchMode && batchCompressedBlobUrl) {
      const link = document.createElement("a");
      link.href = batchCompressedBlobUrl;
      link.download = "compressed_images.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (!isBatchMode && compressedBlobUrl) {
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
              selectedFile || selectedFiles.length > 0
                ? "lg:flex-row items-start"
                : "items-center justify-center"
            } gap-8 lg:gap-12`}
          >
            {/* Left Column - Upload & Controls */}
            <div
              className={`w-full ${
                selectedFile || selectedFiles.length > 0 ? "lg:w-1/2 lg:max-w-lg" : "max-w-md"
              }`}
            >
              {/* Trial Status for authenticated users */}
              {user && (
                <TrialStatus
                  trialStatus={trialStatus}
                  onUpgrade={() => setShowPayment(true)}
                />
              )}

              {/* Mode Toggle */}
              <div className="mb-6 flex items-center justify-center gap-2 p-1 bg-gray-100 rounded-lg">
                <button
                  onClick={() => switchMode(false)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-light transition-all ${
                    !isBatchMode
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Single Image
                </button>
                <button
                  onClick={() => switchMode(true)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-light transition-all flex items-center justify-center gap-2 ${
                    isBatchMode
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  Batch Upload
                </button>
              </div>

              {/* File Upload Area */}
              <div className="mb-6">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border border-gray-200 rounded-lg p-8 md:p-12 text-center transition-all duration-300 ${
                    isDragging
                      ? "border-gray-400 bg-gray-50"
                      : selectedFile || selectedFiles.length > 0
                      ? "border-gray-300"
                      : "hover:border-gray-300"
                  }`}
                >
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/bmp"
                    multiple={isBatchMode}
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center justify-center"
                  >
                    {isBatchMode ? (
                      <Layers className="w-10 h-10 text-gray-400 mb-4" />
                    ) : (
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
                    )}
                    <span className="text-gray-600 text-sm font-light mb-1">
                      {isBatchMode
                        ? selectedFiles.length > 0
                          ? "Add More Images"
                          : "Drop images here or click to browse"
                        : selectedFile
                        ? "Change Image"
                        : "Drop image here or click to browse"}
                    </span>
                    <span className="text-gray-400 text-xs font-light">
                      PNG, JPEG, WebP, or BMP {isBatchMode && "(multiple files)"}
                    </span>
                  </label>
                </div>

                {/* Single file display */}
                {!isBatchMode && selectedFile && (
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

                {/* Batch files display */}
                {isBatchMode && selectedFiles.length > 0 && (
                  <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2 px-3 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors"
                      >
                        <div className="flex-1 min-w-0 mr-3">
                          <p className="text-sm text-gray-900 font-light truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500 font-light mt-0.5">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-sm text-gray-600 font-light">
                        Total: {selectedFiles.length} file(s) •{" "}
                        {formatFileSize(batchOriginalSize)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Size Reduction Control */}
              {((selectedFile && originalSize) || (isBatchMode && selectedFiles.length > 0)) && (
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
            {(selectedFile || selectedFiles.length > 0) && (
              <div className="w-full lg:w-1/2 lg:max-w-lg">
                {/* Compression Results - Single Mode */}
                {!isBatchMode && compressedSize && (
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

                {/* Compression Results - Batch Mode */}
                {isBatchMode && batchCompressedBlobUrl && (
                  <div className="mb-6 space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <span className="text-sm text-gray-600 font-light">
                        Files Processed
                      </span>
                      <span className="text-sm text-gray-900 font-light">
                        {selectedFiles.length} file(s)
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <span className="text-sm text-gray-600 font-light">
                        Original Size
                      </span>
                      <span className="text-sm text-gray-900 font-light">
                        {formatFileSize(batchOriginalSize)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-4">
                      <span className="text-sm text-gray-600 font-light">
                        Status
                      </span>
                      <span className="text-sm text-green-600 font-light flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Ready
                      </span>
                    </div>
                  </div>
                )}

                {/* Download Button - Single Mode */}
                {!isBatchMode && compressedBlobUrl && (
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

                {/* Download Button - Batch Mode */}
                {isBatchMode && batchCompressedBlobUrl && (
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
                        d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25-2.25M12 13.875l-2.25-2.25M12 13.875V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                      />
                    </svg>
                    <span>Download ZIP</span>
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
