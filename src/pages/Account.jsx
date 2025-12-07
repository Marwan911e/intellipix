import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';

function Account({ user }) {
  const navigate = useNavigate();
  const [compressionHistory, setCompressionHistory] = useState([]);
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [history, details] = await Promise.all([
          userAPI.getCompressionHistory().catch(() => []),
          userAPI.getSubscriptionDetails().catch(() => null),
        ]);
        // Ensure history is always an array
        setCompressionHistory(Array.isArray(history) ? history : []);
        setSubscriptionDetails(details);
      } catch (err) {
        console.error('Error fetching account data:', err);
        setError('Failed to load account data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription? You will continue to have access until the end of your billing period.')) {
      return;
    }

    try {
      setCancelling(true);
      await userAPI.cancelSubscription();
      // Refresh subscription details
      const details = await userAPI.getSubscriptionDetails();
      setSubscriptionDetails(details);
      alert('Subscription cancelled successfully. You will continue to have access until the end of your billing period.');
    } catch (err) {
      console.error('Error cancelling subscription:', err);
      alert('Failed to cancel subscription. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateReduction = (original, compressed) => {
    if (!original || !compressed) return 'N/A';
    const reduction = ((original - compressed) / original) * 100;
    return `${reduction.toFixed(1)}%`;
  };

  // Group and paginate compression history by time
  const getPaginatedHistory = () => {
    if (!compressionHistory || compressionHistory.length === 0) {
      return { items: [], totalPages: 0 };
    }

    // Sort by timestamp (newest first)
    const sorted = [...compressionHistory].sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return dateB - dateA;
    });

    const totalPages = Math.ceil(sorted.length / itemsPerPage);
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const items = sorted.slice(startIndex, endIndex);

    return { items, totalPages };
  };

  const { items: paginatedItems, totalPages } = getPaginatedHistory();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Loading account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-light text-gray-900 mb-8">My Account</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Subscription Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-2xl font-light text-gray-900 mb-6">Subscription</h2>
            
            {subscriptionDetails && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">Status</label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      subscriptionDetails.subscription_status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : subscriptionDetails.subscription_status === 'trial'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {subscriptionDetails.subscription_status === 'active' ? 'Active' :
                       subscriptionDetails.subscription_status === 'trial' ? 'Trial' :
                       subscriptionDetails.subscription_status}
                    </span>
                  </div>
                </div>

                {subscriptionDetails.subscription_status === 'trial' && (
                  <div>
                    <label className="text-sm text-gray-500">Trial Images Used</label>
                    <p className="mt-1 text-lg text-gray-900">
                      {subscriptionDetails.trial_images_used} / 3
                    </p>
                  </div>
                )}

                {subscriptionDetails.subscription_status === 'active' && (
                  <>
                    {(subscriptionDetails.renewal_date || subscriptionDetails.current_period_end) && (
                      <div>
                        <label className="text-sm text-gray-500">Renewal Date</label>
                        <p className="mt-1 text-lg text-gray-900">
                          {formatDate(new Date((subscriptionDetails.renewal_date || subscriptionDetails.current_period_end) * 1000))}
                        </p>
                      </div>
                    )}

                    {subscriptionDetails.cancel_at_period_end && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          Your subscription will be cancelled at the end of the current billing period.
                        </p>
                      </div>
                    )}

                    {!subscriptionDetails.cancel_at_period_end && (
                      <button
                        onClick={handleCancelSubscription}
                        disabled={cancelling}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Compression History Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-light text-gray-900">Compression History</h2>
              {compressionHistory && compressionHistory.length > 0 && (
                <span className="text-sm text-gray-500">
                  {compressionHistory.length} total
                </span>
              )}
            </div>
            
            {!compressionHistory || compressionHistory.length === 0 ? (
              <p className="text-gray-500 text-sm">No compression history yet.</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-2 text-gray-500 font-normal">File</th>
                        <th className="text-right py-2 px-2 text-gray-500 font-normal">Original</th>
                        <th className="text-right py-2 px-2 text-gray-500 font-normal">Compressed</th>
                        <th className="text-right py-2 px-2 text-gray-500 font-normal">Reduction</th>
                        <th className="text-right py-2 px-2 text-gray-500 font-normal">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedItems.map((item, index) => (
                        <tr key={index} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-2 px-2">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-900 truncate max-w-[150px]" title={item.filename || 'Unknown'}>
                                {item.filename || 'Unknown'}
                              </span>
                              {item.is_trial && (
                                <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded flex-shrink-0">
                                  Trial
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="text-right py-2 px-2 text-gray-600">
                            {formatBytes(item.original_size)}
                          </td>
                          <td className="text-right py-2 px-2 text-gray-600">
                            {formatBytes(item.compressed_size)}
                          </td>
                          <td className="text-right py-2 px-2">
                            <span className="text-green-600 font-medium">
                              {calculateReduction(item.original_size, item.compressed_size)}
                            </span>
                          </td>
                          <td className="text-right py-2 px-2 text-gray-500 text-xs">
                            <div className="flex flex-col items-end">
                              <span>{formatDateTime(item.timestamp)}</span>
                              <span className="text-gray-400">{formatTime(item.timestamp)}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                      disabled={currentPage === 0}
                      className="text-sm text-gray-700 hover:text-gray-900 disabled:text-gray-400 disabled:cursor-not-allowed px-3 py-1.5 rounded hover:bg-gray-50 transition-colors"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage + 1} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                      disabled={currentPage >= totalPages - 1}
                      className="text-sm text-gray-700 hover:text-gray-900 disabled:text-gray-400 disabled:cursor-not-allowed px-3 py-1.5 rounded hover:bg-gray-50 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Account;

