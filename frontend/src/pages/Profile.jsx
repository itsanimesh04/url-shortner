import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useUrls from "../hooks/useUrls";
import Navbar from "../components/Navbar";

const Profile = () => {
  const [copiedId, setCopiedId] = useState(null);
  const { user } = useAuth();
  const { urls, loading, error, handleCreateUrl, handleDeleteUrl } = useUrls();
  const navigate = useNavigate();

  const handleCopy = async (url) => {
    await navigator.clipboard.writeText(url.shortUrl);
    setCopiedId(url._id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // get initials for avatar
  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "U";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Profile card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6 flex items-center gap-4">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {initials}
          </div>
          {/* Info */}
          <div>
            <p className="font-semibold text-gray-900">{user?.username}</p>
            <p className="text-sm text-gray-400">{user?.email}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {urls.length} {urls.length === 1 ? "link" : "links"} created
            </p>
          </div>
        </div>

        {/* URLs heading */}
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Your Links
        </h2>

        {/* Loading */}
        {loading && (
          <p className="text-sm text-gray-400 text-center py-8">
            Loading your links...
          </p>
        )}

        {/* Error */}
        {error && (
          <p className="text-sm text-red-500 text-center py-4">{error}</p>
        )}

        {/* Empty */}
        {!loading && urls.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center">
            <p className="text-gray-400 text-sm">No links yet.</p>
            <button
              onClick={() => navigate("/")}
              className="mt-3 text-blue-600 text-sm hover:underline"
            >
              Create your first link →
            </button>
          </div>
        )}

        {/* URL list */}
        <div className="space-y-3">
          {urls.map((url) => (
            <div
              key={url._id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  {/* Short URL */}
                  <a
                    href={url.shortUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 font-medium text-sm hover:underline"
                  >
                    {url.shortUrl}
                  </a>
                  {/* Long URL */}
                  <p className="text-xs text-gray-400 mt-0.5 truncate">
                    {url.longUrl}
                  </p>
                </div>

                {/* Click count */}
                <div className="text-right flex-shrink-0">
                  <span className="text-lg font-bold text-gray-800">
                    {url.clickCount}
                  </span>
                  <p className="text-xs text-gray-400">clicks</p>
                </div>
              </div>

              {/* Bottom row — actions */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                <button
                  onClick={() => handleCopy(url)}
                  className="text-xs border border-gray-200 hover:bg-gray-50 text-gray-600 px-3 py-1.5 rounded-lg transition-colors"
                >
                  {copiedId === url._id ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={() => navigate(`/analytics/${url._id}`)}
                  className="text-xs border border-gray-200 hover:bg-gray-50 text-gray-600 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Analytics
                </button>
                <button
                  onClick={() => handleDeleteUrl(url._id)}
                  className="text-xs text-gray-400 hover:text-red-500 ml-auto transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Profile;