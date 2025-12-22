import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { developerAPI } from "../services/api";

function DeveloperAPI({ user }) {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKey, setNewKey] = useState(null);
  const [selectedKey, setSelectedKey] = useState(null);
  const [stats, setStats] = useState(null);
  const [usage, setUsage] = useState([]);
  const [activeTab, setActiveTab] = useState("keys"); // keys, stats, docs

  useEffect(() => {
    if (user) {
      loadAPIKeys();
    }
  }, [user]);

  const loadAPIKeys = async () => {
    try {
      setLoading(true);
      const keys = await developerAPI.listKeys();
      setApiKeys(keys);
    } catch (error) {
      console.error("Error loading API keys:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async (e) => {
    e.preventDefault();
    if (!newKeyName.trim()) {
      alert("Please enter a name for your API key");
      return;
    }

    try {
      setCreating(true);
      const result = await developerAPI.createKey(newKeyName);
      setNewKey(result);
      setNewKeyName("");
      await loadAPIKeys();
    } catch (error) {
      console.error("Error creating API key:", error);
      alert("Failed to create API key. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleRevokeKey = async (keyId) => {
    if (!confirm("Are you sure you want to revoke this API key? This action cannot be undone.")) {
      return;
    }

    try {
      await developerAPI.revokeKey(keyId);
      await loadAPIKeys();
      if (selectedKey === keyId) {
        setSelectedKey(null);
        setStats(null);
        setUsage([]);
      }
    } catch (error) {
      console.error("Error revoking API key:", error);
      alert("Failed to revoke API key. Please try again.");
    }
  };

  const handleViewStats = async (keyId) => {
    try {
      const [keyStats, keyUsage] = await Promise.all([
        developerAPI.getStats(keyId),
        developerAPI.getUsage(keyId),
      ]);
      setStats(keyStats);
      setUsage(keyUsage);
      setSelectedKey(keyId);
      setActiveTab("stats");
    } catch (error) {
      console.error("Error loading stats:", error);
      alert("Failed to load statistics. Please try again.");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6 py-12">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <svg
              className="w-16 h-16 text-gray-300 mx-auto mb-4"
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
            <h1 className="text-2xl font-light text-gray-900 mb-3">Developer API</h1>
            <p className="text-gray-600 mb-6 font-light">
              Please log in to access the Developer API and manage your API keys.
            </p>
            <Link
              to="/upload"
              className="inline-block px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-light"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="max-w-7xl mx-auto px-6 py-8 flex-1 overflow-y-auto w-full">
      <div className="mb-8">
        <h1 className="text-4xl font-light text-gray-900 mb-2">Developer API</h1>
        <p className="text-gray-600 font-light">
          Manage your API keys and integrate image compression into your applications
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded-lg mb-6">
        <nav className="flex gap-1 p-1">
          <button
            onClick={() => setActiveTab("keys")}
            className={`flex-1 py-3 px-4 text-sm font-light rounded-md transition-all duration-200 ${
              activeTab === "keys"
                ? "bg-gray-900 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            API Keys
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`flex-1 py-3 px-4 text-sm font-light rounded-md transition-all duration-200 ${
              activeTab === "stats"
                ? "bg-gray-900 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            Statistics
          </button>
          <button
            onClick={() => setActiveTab("docs")}
            className={`flex-1 py-3 px-4 text-sm font-light rounded-md transition-all duration-200 ${
              activeTab === "docs"
                ? "bg-gray-900 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            Documentation
          </button>
        </nav>
      </div>

      {/* New Key Modal */}
      {newKey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-light text-gray-900 mb-4">API Key Created</h2>
            <p className="text-sm text-gray-600 mb-4">
              ⚠️ <strong>Important:</strong> Save this API key now. You won't be able to see it again!
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">API Key:</span>
                <button
                  onClick={() => copyToClipboard(newKey.api_key)}
                  className="text-xs text-gray-600 hover:text-gray-900"
                >
                  Copy
                </button>
              </div>
              <code className="text-sm text-gray-900 break-all">{newKey.api_key}</code>
            </div>
            <button
              onClick={() => {
                setNewKey(null);
                copyToClipboard(newKey.api_key);
              }}
              className="w-full bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-light"
            >
              Copy & Close
            </button>
          </div>
        </div>
      )}

      {/* API Keys Tab */}
      {activeTab === "keys" && (
        <div>
          {/* Create New Key Form */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
            <h2 className="text-lg font-light text-gray-900 mb-4">Create New API Key</h2>
            <form onSubmit={handleCreateKey} className="flex gap-4">
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Enter a name for this API key (e.g., Production, Development)"
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                disabled={creating}
              />
              <button
                type="submit"
                disabled={creating || !newKeyName.trim()}
                className="px-8 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-light disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {creating ? "Creating..." : "Create Key"}
              </button>
            </form>
          </div>

          {/* API Keys List */}
          {loading ? (
            <div className="text-center py-16 bg-white border border-gray-200 rounded-lg">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm text-gray-500 font-light">Loading API keys...</p>
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-16 bg-white border border-gray-200 rounded-lg shadow-sm">
              <svg
                className="w-12 h-12 text-gray-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
              <p className="text-gray-900 mb-2 font-light">No API keys yet</p>
              <p className="text-sm text-gray-500 font-light">Create your first API key to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-light text-gray-900">{key.name}</h3>
                        {key.is_active ? (
                          <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-light">
                            Active
                          </span>
                        ) : (
                          <span className="text-xs bg-red-100 text-red-700 px-2.5 py-1 rounded-full font-light">
                            Revoked
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm mb-4">
                        <div>
                          <span className="text-gray-500 block mb-1">Key</span>
                          <code className="bg-gray-100 px-2 py-1 rounded text-xs">{key.key_prefix}...</code>
                        </div>
                        <div>
                          <span className="text-gray-500 block mb-1">Rate Limit</span>
                          <span className="text-gray-900">{key.rate_limit}/month</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block mb-1">Usage</span>
                          <span className="text-gray-900">{key.usage_count.toLocaleString()}</span>
                        </div>
                        {key.last_used_at && (
                          <div>
                            <span className="text-gray-500 block mb-1">Last Used</span>
                            <span className="text-gray-900">{new Date(key.last_used_at).toLocaleDateString()}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-500 block mb-1">Created</span>
                          <span className="text-gray-900">{new Date(key.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {key.is_active && (
                        <>
                          <button
                            onClick={() => handleViewStats(key.id)}
                            className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-light shadow-sm"
                          >
                            View Stats
                          </button>
                          <button
                            onClick={() => handleRevokeKey(key.id)}
                            className="px-4 py-2 text-sm text-red-600 hover:text-red-700 border border-red-300 rounded-lg hover:bg-red-50 transition-colors font-light shadow-sm"
                          >
                            Revoke
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Statistics Tab */}
      {activeTab === "stats" && selectedKey && stats && (
        <div>
          <div className="mb-6">
            <button
              onClick={() => {
                setSelectedKey(null);
                setStats(null);
                setUsage([]);
              }}
              className="text-sm text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2 font-light"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to API Keys
            </button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-sm text-gray-500 mb-2 font-light">Total Requests</div>
              <div className="text-3xl font-light text-gray-900">
                {stats.total_requests.toLocaleString()}
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-sm text-gray-500 mb-2 font-light">Success Rate</div>
              <div className="text-3xl font-light text-gray-900">
                {stats.total_requests > 0
                  ? Math.round((stats.successful_requests / stats.total_requests) * 100)
                  : 0}
                %
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-sm text-gray-500 mb-2 font-light">Avg Response Time</div>
              <div className="text-3xl font-light text-gray-900">
                {Math.round(stats.average_response_time_ms)}ms
              </div>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
            <h3 className="text-lg font-light text-gray-900 mb-6">Usage Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="text-sm text-gray-500 mb-1">Successful Requests</div>
                <div className="text-xl font-light text-green-600">
                  {stats.successful_requests.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Failed Requests</div>
                <div className="text-xl font-light text-red-600">
                  {stats.failed_requests.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Requests Today</div>
                <div className="text-xl font-light text-gray-900">
                  {stats.requests_today.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Requests This Month</div>
                <div className="text-xl font-light text-gray-900">
                  {stats.requests_this_month.toLocaleString()}
                </div>
              </div>
            </div>
            {stats.last_used_at && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-500 mb-1">Last Used</div>
                <div className="text-sm font-light text-gray-900">
                  {new Date(stats.last_used_at).toLocaleString()}
                </div>
              </div>
            )}
          </div>

          {/* Usage Logs */}
          {usage.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-light text-gray-900 mb-4">Recent Usage Logs</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 text-gray-500 font-light">Time</th>
                      <th className="text-left py-3 text-gray-500 font-light">Endpoint</th>
                      <th className="text-left py-3 text-gray-500 font-light">Status</th>
                      <th className="text-left py-3 text-gray-500 font-light">Response Time</th>
                      <th className="text-left py-3 text-gray-500 font-light">IP Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usage.slice(0, 20).map((log) => (
                      <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 text-gray-700 font-light">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="py-3 text-gray-700">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">{log.method} {log.endpoint}</code>
                        </td>
                        <td className="py-3">
                          <span
                            className={`px-2.5 py-1 rounded text-xs font-light ${
                              log.status >= 200 && log.status < 300
                                ? "bg-green-100 text-green-700"
                                : log.status >= 400 && log.status < 500
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="py-3 text-gray-700 font-light">{log.response_time_ms}ms</td>
                        <td className="py-3 text-gray-700 text-xs font-light">{log.ip_address}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Documentation Tab */}
      {activeTab === "docs" && (
        <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
          <div className="prose max-w-none">
            <h2 className="text-2xl font-light text-gray-900 mb-6">API Documentation</h2>

            <div className="mb-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-light text-gray-900 mb-3">Base URL</h3>
              <code className="bg-white px-4 py-3 rounded border border-gray-200 text-sm block">
                {import.meta.env.VITE_API_URL || "http://localhost:8081"}
              </code>
            </div>

            <div className="mb-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-light text-gray-900 mb-3">Authentication</h3>
              <p className="text-gray-600 mb-4 font-light">
                Include your API key in requests using one of these methods:
              </p>
              <div className="bg-white p-4 rounded-lg border border-gray-200 mb-3">
                <div className="text-xs text-gray-500 mb-2">Header Method 1:</div>
                <code className="text-sm text-gray-900">
                  X-API-Key: ipx_your_api_key_here
                </code>
              </div>
              <p className="text-sm text-gray-500 mb-3">or</p>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-xs text-gray-500 mb-2">Header Method 2:</div>
                <code className="text-sm text-gray-900">
                  Authorization: Bearer ipx_your_api_key_here
                </code>
              </div>
            </div>

            <div className="mb-8 bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-light text-gray-900 mb-3">Compress Image</h3>
              <p className="text-gray-600 mb-2 font-light">
                <strong>Endpoint:</strong> <code className="bg-gray-100 px-2 py-1 rounded text-sm">POST /api/v1/compress</code>
              </p>
              <p className="text-gray-600 mb-4 font-light">Compress an image file.</p>

              <h4 className="text-md font-light text-gray-900 mb-3 mt-6">Parameters:</h4>
              <ul className="list-none space-y-2 mb-6">
                <li className="bg-gray-50 p-3 rounded">
                  <code className="text-sm font-medium text-gray-900">file</code>
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded ml-2">required</span>
                  <p className="text-sm text-gray-600 mt-1">Image file (PNG or JPEG)</p>
                </li>
                <li className="bg-gray-50 p-3 rounded">
                  <code className="text-sm font-medium text-gray-900">quality</code>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded ml-2">optional</span>
                  <p className="text-sm text-gray-600 mt-1">Compression quality 1-100 (default: 75)</p>
                </li>
                <li className="bg-gray-50 p-3 rounded">
                  <code className="text-sm font-medium text-gray-900">scale</code>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded ml-2">optional</span>
                  <p className="text-sm text-gray-600 mt-1">Scale factor 0.1-1.0 (default: 0.8)</p>
                </li>
                <li className="bg-gray-50 p-3 rounded">
                  <code className="text-sm font-medium text-gray-900">targetReduction</code>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded ml-2">optional</span>
                  <p className="text-sm text-gray-600 mt-1">Target size reduction % (0-100)</p>
                </li>
              </ul>

              <h4 className="text-md font-light text-gray-900 mb-3">Example (cURL):</h4>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-6">
                <pre className="text-sm font-light">
{`curl -X POST ${import.meta.env.VITE_API_URL || "http://localhost:8081"}/api/v1/compress \\
  -H "X-API-Key: ipx_your_api_key_here" \\
  -F "file=@image.jpg" \\
  -F "quality=80" \\
  -o compressed.jpg`}
                </pre>
              </div>

              <h4 className="text-md font-light text-gray-900 mb-3">Example (JavaScript):</h4>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <pre className="text-sm font-light">
{`const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('quality', '80');

fetch('${import.meta.env.VITE_API_URL || "http://localhost:8081"}/api/v1/compress', {
  method: 'POST',
  headers: {
    'X-API-Key': 'ipx_your_api_key_here'
  },
  body: formData
})
.then(response => response.blob())
.then(blob => {
  // Handle compressed image
});`}
                </pre>
              </div>
            </div>

            <div className="mb-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-light text-gray-900 mb-4">Rate Limits</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-500 mb-1">Trial</div>
                  <div className="text-xl font-light text-gray-900">100</div>
                  <div className="text-xs text-gray-500">requests/month</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-500 mb-1">Professional</div>
                  <div className="text-xl font-light text-gray-900">10,000</div>
                  <div className="text-xs text-gray-500">requests/month</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-500 mb-1">Enterprise</div>
                  <div className="text-xl font-light text-gray-900">Custom</div>
                  <div className="text-xs text-gray-500">contact sales</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-light text-gray-900 mb-4">Error Codes</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3 bg-white p-3 rounded border border-gray-200">
                  <code className="text-sm font-medium bg-red-100 text-red-700 px-2 py-1 rounded">400</code>
                  <span className="text-sm text-gray-600">Bad Request - Invalid parameters</span>
                </div>
                <div className="flex items-center gap-3 bg-white p-3 rounded border border-gray-200">
                  <code className="text-sm font-medium bg-yellow-100 text-yellow-700 px-2 py-1 rounded">401</code>
                  <span className="text-sm text-gray-600">Unauthorized - Invalid API key</span>
                </div>
                <div className="flex items-center gap-3 bg-white p-3 rounded border border-gray-200">
                  <code className="text-sm font-medium bg-orange-100 text-orange-700 px-2 py-1 rounded">429</code>
                  <span className="text-sm text-gray-600">Too Many Requests - Rate limit exceeded</span>
                </div>
                <div className="flex items-center gap-3 bg-white p-3 rounded border border-gray-200">
                  <code className="text-sm font-medium bg-red-100 text-red-700 px-2 py-1 rounded">500</code>
                  <span className="text-sm text-gray-600">Internal Server Error</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default DeveloperAPI;

