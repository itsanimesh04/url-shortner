import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAnalytics } from "../api/url.api";
import Navbar from "../components/Navbar";

const Analytics = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getAnalytics(id);
        if (result.url) {
          setData(result);
        } else {
          setError(result.message || "Failed to load analytics");
        }
      } catch (err) {
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-10">

        <button
          onClick={() => navigate("/profile")}
          className="text-sm text-gray-400 hover:text-gray-600 mb-6 flex items-center gap-1 transition-colors"
        >
          ← Back to Profile
        </button>

        {loading && <p className="text-sm text-gray-400 text-center py-8">Loading analytics...</p>}
        {error && <p className="text-sm text-red-500 text-center py-4">{error}</p>}

        {data && (() => {
          const { url, analytics } = data;
          return (
            <div className="space-y-4">

              {/* URL card */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <a
                  href={url.shortUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 font-semibold text-lg hover:underline"
                >
                  {url.shortUrl}
                </a>
                <p className="text-xs text-gray-400 mt-1 break-all">{url.longUrl}</p>
                <p className="text-xs text-gray-400 mt-2">
                  Created {new Date(url.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Total clicks */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center">
                <p className="text-5xl font-bold text-gray-900">{analytics.totalClicks}</p>
                <p className="text-sm text-gray-400 mt-1">Total Clicks</p>
              </div>

              {/* Breakdowns */}
              <div className="grid grid-cols-2 gap-4">

                {/* Device */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    By Device
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(analytics.deviceBreakdown).map(([device, count]) => (
                      <div key={device} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 capitalize">{device}</span>
                        <span className="text-sm font-semibold text-gray-900">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Browser */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    By Browser
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(analytics.browserBreakdown).map(([browser, count]) => (
                      <div key={browser} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{browser}</span>
                        <span className="text-sm font-semibold text-gray-900">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Recent clicks */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Recent Clicks
                </h4>
                {analytics.recentClicks.length === 0 ? (
                  <p className="text-sm text-gray-400">No clicks yet.</p>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {analytics.recentClicks.map((click) => (
                      <div key={click._id} className="flex justify-between py-2.5">
                        <span className="text-sm text-gray-600 capitalize">
                          {click.device} · {click.browser}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(click.createdAt).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          );
        })()}

      </div>
    </div>
  );
};

export default Analytics;