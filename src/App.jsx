import React, { useState, useEffect } from "react";

function App() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [shortUrls, setShortUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState("dashboard"); // dashboard, stats, health
  const [selectedCode, setSelectedCode] = useState("");
  const [statsData, setStatsData] = useState(null);
  const [healthData, setHealthData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all URLs
  const fetchUrls = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/links");
      const data = await res.json();
      setShortUrls(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUrls();
    const interval = setInterval(fetchUrls, 5000);
    return () => clearInterval(interval);
  }, []);

  // Create short URL
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!originalUrl) return;

    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalUrl, code: customCode || undefined }),
      });

      if (res.status === 409) {
        setError("Custom code already exists!");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setShortUrls([...shortUrls, data]);
      setOriginalUrl("");
      setCustomCode("");
    } catch (err) {
      console.error(err);
      setError("Failed to shorten URL.");
    }
    setLoading(false);
  };

  // Delete URL
  const handleDelete = async (code) => {
    if (!window.confirm("Delete this link?")) return;
    try {
      await fetch(`http://localhost:5000/api/links/${code}`, {
        method: "DELETE",
      });
      setShortUrls(shortUrls.filter((u) => !u.shortUrl.endsWith(code)));
    } catch (err) {
      console.error(err);
    }
  };

  // View stats
  const viewStats = async (code) => {
    setSelectedCode(code);
    setView("stats");
    try {
      const res = await fetch(`http://localhost:5000/api/links/${code}`);
      const data = await res.json();
      setStatsData(data);
    } catch (err) {
      console.error(err);
    }
  };

  // View health
  const viewHealth = async () => {
    setView("health");
    try {
      const res = await fetch("http://localhost:5000/healthz");
      const data = await res.json();
      setHealthData(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Filter URLs
  const filteredUrls = shortUrls.filter(
    (u) =>
      u.originalUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.shortUrl.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>TinyLink - URL Shortener</h1>

      <div style={{ marginBottom: "1rem" }}>
        <button onClick={() => setView("dashboard")} style={{ marginRight: "1rem" }}>
          Dashboard
        </button>
        <button onClick={viewHealth}>Health Check</button>
      </div>

      {view === "dashboard" && (
        <>
          <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
            <input
              type="url"
              placeholder="Enter URL (e.g., https://google.com)"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              required
              style={{ marginRight: "0.5rem" }}
            />
            <input
              type="text"
              placeholder="Custom code (optional)"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              style={{ marginRight: "0.5rem" }}
            />
            <button type="submit" disabled={loading}>
              {loading ? "Shortening..." : "Shorten"}
            </button>
          </form>
          {error && <div style={{ color: "red" }}>{error}</div>}

          <input
            type="text"
            placeholder="Search by URL or code"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ marginBottom: "1rem" }}
          />

          <table border="1" cellPadding="10" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f2f2f2" }}>
                <th>Original URL</th>
                <th>Short URL</th>
                <th>Clicks</th>
                <th>Last Clicked</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUrls.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    No URLs yet
                  </td>
                </tr>
              ) : (
                filteredUrls.map((url, i) => {
                  const code = url.shortUrl.split("/").pop();
                  return (
                    <tr key={i}>
                      <td>{url.originalUrl}</td>
                      <td>
                        <a href={url.shortUrl} target="_blank" rel="noreferrer">
                          {url.shortUrl}
                        </a>
                        <br />
                        <button onClick={() => viewStats(code)}>Stats</button>
                      </td>
                      <td>{url.clicks}</td>
                      <td>{url.lastClicked || "-"}</td>
                      <td>
                        <button onClick={() => handleDelete(code)}>Delete</button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </>
      )}

      {view === "stats" && statsData && (
        <div>
          <h2>Stats for {selectedCode}</h2>
          <p>
            <strong>Original URL:</strong> {statsData.originalUrl}
          </p>
          <p>
            <strong>Short URL:</strong>{" "}
            <a href={statsData.shortUrl} target="_blank" rel="noreferrer">
              {statsData.shortUrl}
            </a>
          </p>
          <p>
            <strong>Clicks:</strong> {statsData.clicks}
          </p>
          <p>
            <strong>Last Clicked:</strong> {statsData.lastClicked || "-"}
          </p>
          <button onClick={() => setView("dashboard")}>Back to Dashboard</button>
        </div>
      )}

      {view === "health" && healthData && (
        <div>
          <h2>Health Check</h2>
          <pre>{JSON.stringify(healthData, null, 2)}</pre>
          <button onClick={() => setView("dashboard")}>Back to Dashboard</button>
        </div>
      )}
    </div>
  );
}

export default App;
