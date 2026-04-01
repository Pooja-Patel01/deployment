import { useEffect, useState } from "react";

const PredictiveAlertBanner = () => {
  const [alerts, setAlerts] = useState([]);
  const [dismissed, setDismissed] = useState(false);
  const userLocation = localStorage.getItem("userLocation") || "";
  const token = localStorage.getItem("token");

  useEffect(() => {
    const wasDismissed = sessionStorage.getItem("predictiveBannerDismissed");
    if (wasDismissed) { setDismissed(true); return; }

    fetch(`http://127.0.0.1:8000/alerts/predictive?location=${encodeURIComponent(userLocation)}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setAlerts(data); })
      .catch(() => {});
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem("predictiveBannerDismissed", "true");
    setDismissed(true);
  };

  if (dismissed || alerts.length === 0) return null;

  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 50,
      backgroundColor: "#0e7490", color: "white",
      padding: "12px 24px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ fontSize: "20px" }}>&#9888;</span>
        <div>
          <span style={{ fontWeight: "700", fontSize: "14px" }}>
            Predictive Alert: {alerts[0]?.message}
          </span>
          <span style={{ fontSize: "12px", marginLeft: "12px", opacity: 0.85 }}>
            Location: {alerts[0]?.location}
          </span>
        </div>
        {alerts.length > 1 && (
          <span style={{
            backgroundColor: "rgba(255,255,255,0.2)", borderRadius: "999px",
            padding: "2px 10px", fontSize: "12px", fontWeight: "700"
          }}>
            +{alerts.length - 1} more
          </span>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <a href="/alerts" style={{
          color: "white", fontSize: "13px", fontWeight: "700",
          textDecoration: "underline", cursor: "pointer"
        }}>
          View Details &rarr;
        </a>
        <button
          onClick={handleDismiss}
          style={{
            background: "rgba(255,255,255,0.2)", border: "none",
            color: "white", borderRadius: "8px", padding: "4px 12px",
            cursor: "pointer", fontSize: "13px", fontWeight: "700"
          }}>
          X Dismiss
        </button>
      </div>
    </div>
  );
};

export default PredictiveAlertBanner;