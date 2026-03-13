import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createUrl } from "../api/url.api";
import Navbar from "../components/Navbar";

const features = [
  { icon: "⚡", title: "Fast", desc: "Links created instantly" },
  { icon: "📊", title: "Analytics", desc: "Track every click" },
  { icon: "🔒", title: "Secure", desc: "Your links, your data" },
];

const Home = () => {
  const [longUrl, setLongUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const { token } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!longUrl.trim()) return;
    setError(null);

    if (!token) {
      sessionStorage.setItem("pendingUrl", longUrl);
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const data = await createUrl(longUrl);
      if (data.shortUrl) {
        setResult(data);
        setLongUrl("");
      } else {
        setError(data.message || "Something went wrong");
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 pt-24 pb-16 text-center">

        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Shorten your URL
        </h1>
        <p className="text-gray-500 mb-10 text-lg">
          Fast, free, and trackable short links
        </p>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex gap-2 bg-white border border-gray-200 rounded-xl p-2 shadow-sm"
        >
          <input
            type="url"
            placeholder="Paste a long URL here..."
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            required
            className="flex-1 px-3 py-2 text-sm text-gray-800 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
          >
            {loading ? "Shortening..." : "Shorten"}
          </button>
        </form>

        {/* Error */}
        {error && (
          <p className="mt-3 text-sm text-red-500">{error}</p>
        )}

        {/* Result */}
        {result && (
          <div className="mt-4 bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
            <a
              href={result.shortUrl}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 font-medium text-sm hover:underline"
            >
              {result.shortUrl}
            </a>
            <button
              onClick={handleCopy}
              className="text-xs border border-gray-200 hover:bg-gray-50 text-gray-600 px-3 py-1.5 rounded-lg transition-colors"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        )}

        {/* Features
        <div className="mt-16 grid grid-cols-3 gap-6 text-center">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm"
            >
              <div className="text-2xl mb-2">{f.icon}</div>
              <div className="text-sm font-semibold text-gray-800">{f.title}</div>
              <div className="text-xs text-gray-400 mt-1">{f.desc}</div>
            </div>
          ))}
        </div> */}

      </div>
    </div>
  );
};

export default Home;