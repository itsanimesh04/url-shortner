import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useUrls from "../hooks/useUrls";

const Dashboard = () => {
  const [longUrl, setLongUrl] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  const { urls, loading, error, handleCreateUrl, handleDeleteUrl } = useUrls();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!longUrl.trim()) return;
    await handleCreateUrl(longUrl);
    setLongUrl(""); // clear input after submit
  };

  const handleCopy = async (url) => {
    await navigator.clipboard.writeText(url.shortUrl);
    setCopiedId(url._id); // track which one was copied
    setTimeout(() => setCopiedId(null), 2000); // reset after 2 seconds
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div>
      {/* Header */}
      <div>
        <h2>Dashboard</h2>
        <button onClick={handleLogout}>Logout</button>
      </div>

      {/* Create URL form */}
      <form onSubmit={handleSubmit}>
        <input
          type="url"
          placeholder="Paste a long URL here..."
          value={longUrl}
          onChange={(e) => setLongUrl(e.target.value)}
          required
        />
        <button type="submit">Shorten</button>
      </form>

      {/* Error */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Loading */}
      {loading && <p>Loading your URLs...</p>}

      {/* Empty state */}
      {!loading && urls.length === 0 && (
        <p>No URLs yet. Paste one above to get started.</p>
      )}

      {/* URL list */}
      {!loading && urls.length > 0 && (
        <div>
          {urls.map((url) => (
            <div
              key={url._id}
              style={{
                border: "1px solid #ccc",
                padding: "12px",
                marginBottom: "8px",
              }}
            >
              {/* Short URL */}
              <a href={url.shortUrl} target="_blank" rel="noreferrer">
                {url.shortUrl}
              </a>

              {/* Original URL — truncated */}
              <p style={{ color: "gray", fontSize: "12px" }}>
                {url.longUrl.length > 60
                  ? url.longUrl.slice(0, 60) + "..."
                  : url.longUrl}
              </p>

              {/* Click count */}
              <p>Clicks: {url.clickCount}</p>

              {/* Actions */}
              <div>
                <button onClick={() => handleCopy(url)}>
                  {copiedId === url._id ? "Copied!" : "Copy"}
                </button>

                <button onClick={() => navigate(`/analytics/${url._id}`)}>
                  Analytics
                </button>

                <button onClick={() => handleDeleteUrl(url._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
