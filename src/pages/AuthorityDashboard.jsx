import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine
} from "recharts";

const WHO_THRESHOLDS = {
  ph: { min: 6.5, max: 8.5, label: "pH", unit: "" },
  turbidity: { max: 4, label: "Turbidity", unit: "NTU" },
  do: { min: 6, label: "Dissolved Oxygen", unit: "mg/L" },
  lead: { max: 0.01, label: "Lead", unit: "mg/L" },
  arsenic: { max: 0.01, label: "Arsenic", unit: "mg/L" },
};

const AuthorityDashboard = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "Authority User";
  const userRole = localStorage.getItem("userRole") || "authority";
  const token = localStorage.getItem("token");

  const [pendingReports, setPendingReports] = useState([]);
  const [allReports, setAllReports] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [users, setUsers] = useState([]);
  const [aggregateData, setAggregateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("moderation");
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [newAlert, setNewAlert] = useState({ type: "contamination", message: "", location: "" });
  const [submitting, setSubmitting] = useState(false);
  const [updatingRole, setUpdatingRole] = useState({});

  // Role guard
  useEffect(() => {
    if (userRole !== "authority" && userRole !== "admin") {
      navigate("/dashboard");
    }
  }, [userRole, navigate]);

  const fetchPendingReports = () => {
    fetch("http://127.0.0.1:8000/reports/pending", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setPendingReports(Array.isArray(data) ? data : []))
      .catch(() => {
        // Fallback: filter from all reports
        fetch("http://127.0.0.1:8000/reports")
          .then(r => r.json())
          .then(d => setPendingReports((Array.isArray(d) ? d : []).filter(r => r.status === "pending")));
      });
  };

  useEffect(() => {
    fetchPendingReports();

    fetch("http://127.0.0.1:8000/reports")
      .then(res => res.json())
      .then(data => { setAllReports(Array.isArray(data) ? data : []); setLoading(false); });

    fetch("http://127.0.0.1:8000/alerts")
      .then(res => res.json())
      .then(data => setAlerts(Array.isArray(data) ? data : []));

    fetch("http://127.0.0.1:8000/stations/readings/aggregate?days=30", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setAggregateData(data))
      .catch(() => {});

    if (userRole === "admin") {
      fetch("http://127.0.0.1:8000/users", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setUsers(Array.isArray(data) ? data : []))
        .catch(() => {});
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleModerate = async (reportId, status) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/reports/${reportId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setPendingReports(prev => prev.filter(r => r.id !== reportId));
        fetchPendingReports();
      } else {
        alert("Failed to update report status");
      }
    } catch {
      alert("Cannot connect to server");
    }
  };

  const handleCreateAlert = async () => {
    if (!newAlert.message || !newAlert.location) {
      alert("Please fill all fields");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(newAlert),
      });
      if (res.ok) {
        alert("✅ Alert issued successfully!");
        setShowAlertForm(false);
        setNewAlert({ type: "contamination", message: "", location: "" });
        fetch("http://127.0.0.1:8000/alerts").then(r => r.json()).then(d => setAlerts(Array.isArray(d) ? d : []));
      }
    } catch {
      alert("Cannot connect to server");
    }
    setSubmitting(false);
  };

  const handleDeleteAlert = async (id) => {
    if (!window.confirm("Delete this alert?")) return;
    try {
      await fetch(`http://127.0.0.1:8000/alerts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlerts(prev => prev.filter(a => a.id !== id));
    } catch {
      alert("Cannot connect to server");
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingRole(prev => ({ ...prev, [userId]: true }));
    try {
      const res = await fetch(`http://127.0.0.1:8000/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      }
    } catch {
      alert("Cannot connect to server");
    }
    setUpdatingRole(prev => ({ ...prev, [userId]: false }));
  };

  const verifiedThisMonth = allReports.filter(r => {
    const d = new Date(r.created_at);
    const now = new Date();
    return r.status === "verified" && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const getTypeBadge = (type) => {
    const styles = { boil_notice: "bg-amber-100 text-amber-700", contamination: "bg-red-100 text-red-600", outage: "bg-gray-100 text-gray-600" };
    const icons = { boil_notice: "🔥", contamination: "☣️", outage: "⚡" };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${styles[type] || "bg-sky-100 text-sky-600"}`}>
        {icons[type]} {type?.replace("_", " ")}
      </span>
    );
  };

  // Build chart data for each parameter from aggregate
  const buildChartData = (param) => {
    if (!aggregateData?.data?.[param]) return [];
    return aggregateData.data[param].map(d => ({
      date: d.date?.slice(5), // Show MM-DD
      avg_value: parseFloat(d.avg_value?.toFixed(3) || 0),
    }));
  };

  const PARAM_COLORS = { ph: "#0284c7", turbidity: "#f59e0b", do: "#10b981", lead: "#8b5cf6", arsenic: "#ef4444" };

  const tabs = [
    { id: "moderation", label: "📋 Moderation Queue" },
    { id: "charts", label: "📊 Water Quality Charts" },
    { id: "alerts", label: "🔔 Alert Management" },
    ...(userRole === "admin" ? [{ id: "users", label: "👥 User Management" }] : []),
  ];

  return (
    <div className="min-h-screen flex bg-sky-50 text-slate-800 font-sans">

      {/* Sidebar */}
      <div className="w-64 bg-sky-600 text-white flex flex-col p-6 shadow-xl">
        <h2 className="text-2xl font-bold mb-8 italic">💧 WQM</h2>
        <div className="mb-8 p-4 bg-sky-700/40 rounded-xl border border-sky-400/30">
          <p className="text-[10px] uppercase tracking-widest text-sky-200">Session</p>
          <p className="font-bold text-lg leading-tight">{userName}</p>
          <span className="mt-2 inline-block bg-white text-sky-600 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
            {userRole}
          </span>
        </div>
        <ul className="space-y-2 flex-1">
          <li onClick={() => navigate("/dashboard")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-2">🏠 Dashboard</li>
          <li onClick={() => navigate("/map")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-2">📍 Live Map View</li>
          <li onClick={() => navigate("/reports")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-2">📊 Reports</li>
          <li onClick={() => navigate("/water-data")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-2">🌊 Water Data</li>
          <li onClick={() => navigate("/search")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-2">🔍 Search</li>
          <li onClick={() => navigate("/readings")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-2">📈 Readings</li>
          <li onClick={() => navigate("/alerts")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-2">🔔 Alerts</li>
          <li className="bg-white text-sky-600 p-3 rounded-lg cursor-pointer font-bold shadow-md flex items-center gap-2">🛡️ Authority Portal</li>
          <li onClick={() => navigate("/profile")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-2">👤 Profile</li>
        </ul>
        <button onClick={handleLogout} className="mt-auto bg-white text-sky-600 hover:bg-sky-50 py-2.5 rounded-lg font-bold transition-all shadow-lg">
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">

        {/* Header */}
        <header className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-sky-900">Authority Portal</h1>
            <p className="text-sky-600 font-medium italic">Moderate reports, manage alerts, and monitor water quality across all stations.</p>
          </div>
        </header>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Pending Reports", value: pendingReports.length, color: "text-amber-600", border: "border-amber-400", icon: "📋" },
            { label: "Active Alerts", value: alerts.length, color: "text-red-600", border: "border-red-400", icon: "🔔" },
            { label: "Total Reports", value: allReports.length, color: "text-sky-700", border: "border-sky-400", icon: "📊" },
            { label: "Verified This Month", value: verifiedThisMonth, color: "text-green-600", border: "border-green-400", icon: "✅" },
          ].map((stat, i) => (
            <div key={i} className={`bg-white border-l-4 ${stat.border} rounded-2xl p-6 shadow-sm`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-slate-500 text-sm font-semibold">{stat.label}</h3>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2 rounded-xl font-bold transition ${activeTab === tab.id ? "bg-sky-600 text-white shadow" : "bg-white text-sky-600 border border-sky-200 hover:bg-sky-50"}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Moderation Queue */}
        {activeTab === "moderation" && (
          <div className="bg-white rounded-3xl shadow-sm border border-sky-100 overflow-hidden">
            <div className="p-6 border-b border-sky-50">
              <h2 className="text-xl font-bold text-sky-900">Pending Reports ({pendingReports.length})</h2>
              <p className="text-sm text-slate-500">Review and verify or reject citizen-submitted reports.</p>
            </div>
            <table className="w-full text-left">
              <thead className="bg-sky-50 text-sky-700 uppercase text-xs font-black tracking-widest">
                <tr>
                  <th className="p-5">ID</th>
                  <th className="p-5">Description</th>
                  <th className="p-5">Location</th>
                  <th className="p-5">Water Source</th>
                  <th className="p-5">Date</th>
                  <th className="p-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-50">
                {loading ? (
                  <tr><td colSpan="6" className="p-8 text-center text-gray-400">Loading reports...</td></tr>
                ) : pendingReports.length === 0 ? (
                  <tr><td colSpan="6" className="p-8 text-center text-gray-400">✅ No pending reports — queue is clear!</td></tr>
                ) : (
                  pendingReports.map(report => (
                    <tr key={report.id} className="hover:bg-sky-50/40 transition-colors">
                      <td className="p-5 font-bold text-sky-700">#{report.id}</td>
                      <td className="p-5 text-slate-600 max-w-xs">
                        <p className="truncate">{report.description}</p>
                      </td>
                      <td className="p-5 text-slate-600">{report.location}</td>
                      <td className="p-5 text-slate-600">{report.water_source || "N/A"}</td>
                      <td className="p-5 text-slate-500">{report.created_at?.slice(0, 10)}</td>
                      <td className="p-5">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleModerate(report.id, "verified")}
                            className="bg-green-100 text-green-600 hover:bg-green-200 px-3 py-1.5 rounded-lg text-xs font-black transition">
                            ✅ Verify
                          </button>
                          <button
                            onClick={() => handleModerate(report.id, "rejected")}
                            className="bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1.5 rounded-lg text-xs font-black transition">
                            ❌ Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Water Quality Charts */}
        {activeTab === "charts" && (
          <div>
            <p className="text-sm text-slate-500 mb-6">Daily average readings across all stations — last 30 days. Reference lines show WHO safe thresholds.</p>
            {!aggregateData ? (
              <div className="bg-white rounded-3xl p-12 text-center text-gray-400 border border-sky-100">
                Loading chart data... (Make sure backend is running)
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {Object.entries(WHO_THRESHOLDS).map(([param, threshold]) => {
                  const chartData = buildChartData(param);
                  return (
                    <div key={param} className="bg-white border border-sky-100 rounded-3xl p-6 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-sky-900">{threshold.label}</h3>
                          <p className="text-xs text-slate-500">
                            WHO Safe: {threshold.min ? `${threshold.min}–${threshold.max}` : threshold.max ? `< ${threshold.max}` : `> ${threshold.min}`} {threshold.unit}
                          </p>
                        </div>
                        <span className="w-4 h-4 rounded-full" style={{ backgroundColor: PARAM_COLORS[param] }}></span>
                      </div>
                      {chartData.length === 0 ? (
                        <p className="text-gray-400 text-center py-8 text-sm">No data for this parameter</p>
                      ) : (
                        <div className="h-52">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f0f9ff" />
                              <XAxis dataKey="date" stroke="#0ea5e9" fontSize={10} />
                              <YAxis stroke="#0ea5e9" fontSize={10} />
                              <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }} />
                              {threshold.max && <ReferenceLine y={threshold.max} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "WHO Max", fill: "#ef4444", fontSize: 10 }} />}
                              {threshold.min && <ReferenceLine y={threshold.min} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "WHO Min", fill: "#ef4444", fontSize: 10 }} />}
                              <Line type="monotone" dataKey="avg_value" stroke={PARAM_COLORS[param]} strokeWidth={3} dot={{ r: 3 }} name={threshold.label} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Alert Management */}
        {activeTab === "alerts" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-sky-900">Alert Management</h2>
              <button
                onClick={() => setShowAlertForm(!showAlertForm)}
                className="bg-red-500 text-white px-6 py-2 rounded-xl font-bold shadow-lg hover:bg-red-600 transition-all">
                {showAlertForm ? "✕ Close" : "+ Issue Alert"}
              </button>
            </div>

            {showAlertForm && (
              <div className="bg-white border border-red-100 rounded-3xl p-6 shadow-sm mb-6">
                <h3 className="text-lg font-bold text-red-700 mb-4">Issue New Alert</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-bold text-gray-600 mb-1 block">Alert Type</label>
                    <select
                      value={newAlert.type}
                      onChange={e => setNewAlert({ ...newAlert, type: e.target.value })}
                      className="w-full p-3 rounded-xl border-2 border-red-100 focus:border-red-400 outline-none">
                      <option value="contamination">☣️ Contamination</option>
                      <option value="boil_notice">🔥 Boil Notice</option>
                      <option value="outage">⚡ Outage</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-600 mb-1 block">Message</label>
                    <input
                      type="text"
                      placeholder="Alert message..."
                      value={newAlert.message}
                      onChange={e => setNewAlert({ ...newAlert, message: e.target.value })}
                      className="w-full p-3 rounded-xl border-2 border-red-100 focus:border-red-400 outline-none" />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-600 mb-1 block">Location</label>
                    <input
                      type="text"
                      placeholder="Affected area..."
                      value={newAlert.location}
                      onChange={e => setNewAlert({ ...newAlert, location: e.target.value })}
                      className="w-full p-3 rounded-xl border-2 border-red-100 focus:border-red-400 outline-none" />
                  </div>
                </div>
                <button
                  onClick={handleCreateAlert}
                  disabled={submitting}
                  className={`px-8 py-3 rounded-xl font-bold text-white transition ${submitting ? "bg-gray-400" : "bg-red-500 hover:bg-red-600"}`}>
                  {submitting ? "Issuing..." : "🔔 Issue Alert"}
                </button>
              </div>
            )}

            <div className="bg-white rounded-3xl shadow-sm border border-sky-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-sky-50 text-sky-700 uppercase text-xs font-black tracking-widest">
                  <tr>
                    <th className="p-5">ID</th>
                    <th className="p-5">Type</th>
                    <th className="p-5">Message</th>
                    <th className="p-5">Location</th>
                    <th className="p-5">Issued At</th>
                    <th className="p-5">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sky-50">
                  {alerts.length === 0 ? (
                    <tr><td colSpan="6" className="p-8 text-center text-gray-400">No alerts found</td></tr>
                  ) : (
                    alerts.map(alert => (
                      <tr key={alert.id} className="hover:bg-sky-50/40 transition-colors">
                        <td className="p-5 font-bold text-sky-700">#{alert.id}</td>
                        <td className="p-5">{getTypeBadge(alert.type)}</td>
                        <td className="p-5 text-slate-600 max-w-xs truncate">{alert.message}</td>
                        <td className="p-5 text-slate-600">{alert.location}</td>
                        <td className="p-5 text-slate-500">{alert.issued_at?.slice(0, 16).replace("T", " ")}</td>
                        <td className="p-5">
                          <button
                            onClick={() => handleDeleteAlert(alert.id)}
                            className="text-red-400 hover:text-red-600 font-bold text-sm transition">
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* User Management (Admin Only) */}
        {activeTab === "users" && userRole === "admin" && (
          <div className="bg-white rounded-3xl shadow-sm border border-sky-100 overflow-hidden">
            <div className="p-6 border-b border-sky-50">
              <h2 className="text-xl font-bold text-sky-900">User Management ({users.length} users)</h2>
              <p className="text-sm text-slate-500">Manage user roles across the platform.</p>
            </div>
            <table className="w-full text-left">
              <thead className="bg-sky-50 text-sky-700 uppercase text-xs font-black tracking-widest">
                <tr>
                  <th className="p-5">ID</th>
                  <th className="p-5">Name</th>
                  <th className="p-5">Email</th>
                  <th className="p-5">Role</th>
                  <th className="p-5">Location</th>
                  <th className="p-5">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-50">
                {users.length === 0 ? (
                  <tr><td colSpan="6" className="p-8 text-center text-gray-400">No users found</td></tr>
                ) : (
                  users.map(user => (
                    <tr key={user.id} className="hover:bg-sky-50/40 transition-colors">
                      <td className="p-5 font-bold text-sky-700">#{user.id}</td>
                      <td className="p-5 font-semibold text-slate-700">{user.name}</td>
                      <td className="p-5 text-slate-600">{user.email}</td>
                      <td className="p-5">
                        <select
                          value={user.role}
                          onChange={e => handleRoleChange(user.id, e.target.value)}
                          disabled={updatingRole[user.id]}
                          className="p-2 rounded-lg border-2 border-sky-200 focus:border-sky-400 outline-none text-sm font-bold text-sky-700 bg-sky-50">
                          <option value="citizen">Citizen</option>
                          <option value="ngo">NGO</option>
                          <option value="authority">Authority</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="p-5 text-slate-600">{user.location || "N/A"}</td>
                      <td className="p-5 text-slate-500">{user.created_at?.slice(0, 10)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};

export default AuthorityDashboard;
