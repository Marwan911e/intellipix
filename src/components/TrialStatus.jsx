function TrialStatus({ trialStatus, onUpgrade }) {
  if (!trialStatus) return null;

  const { has_access, remaining, trial_images_used, subscription_status } =
    trialStatus;
  const isActive = subscription_status === "active";
  const isTrial = subscription_status === "trial";

  if (isActive) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-800">
              Active Subscription
            </p>
            <p className="text-xs text-green-600 mt-1">
              Unlimited compressions
            </p>
          </div>
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
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
          </div>
        </div>
      </div>
    );
  }

  if (!has_access && isTrial) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-800">
              Trial Limit Reached
            </p>
            <p className="text-xs text-yellow-600 mt-1">
              You've used all 3 free compressions. Upgrade to continue.
            </p>
          </div>
          <button
            onClick={onUpgrade}
            className="ml-4 px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Upgrade
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-blue-800">Free Trial</p>
        <span className="text-sm font-medium text-blue-600">
          {remaining > 0 ? `${remaining} remaining` : "0 remaining"}
        </span>
      </div>
      <div className="w-full bg-blue-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((3 - remaining) / 3) * 100}%` }}
        ></div>
      </div>
      <p className="text-xs text-blue-600 mt-2">
        {trial_images_used} of 3 images used
      </p>
    </div>
  );
}

export default TrialStatus;
