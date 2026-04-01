import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const NGODashboard = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "NGO User";
  const userRole = localStorage.getItem("userRole") || "ngo";
  const token = localStorage.getItem("token");

  const [collaborations, setCollaborations] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({ project_name: "", ngo_name: "", contact_email: "" });
  const [formErrors, setFormErrors] = useState({});

  // Role guard
  useEffect(() => {
    if (userRole !== "ngo" && userRole !== "admin") {
      navigate("/dashboard");
    }
  }, [userRole, navigate]);

  const fetchCollaborations = () => {
    fetch("http://127.0.0.1:8000/api/v1/collaborations", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => { setCollaborations(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchCollaborations();

    fetch("http://127.0.0.1:8000/alerts")
      .then(res => res.json())
      .then(data => setAlerts(Array.isArray(data) ? data : []));

    fetch("http://127.0.0.1:8000/reports")
      .then(res => res.json())
      .then(data => setReports(Array.isArray(data) ? data : []));
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.project_name.trim()) errors.project_name = "Project name is required";
    else if (formData.project_name.length > 120) errors.project_name = "Max 120 characters";
    if (!formData.ngo_name.trim()) errors.ngo_name = "NGO name is required";
    if (!formData.contact_email.trim()) errors.contact_email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) errors.contact_email = "Invalid email format";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/collaborations", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        alert("✅ Collaboration project submitted successfully!");
        setShowForm(false);
        setFormData({ project_name: "", ngo_name: "", contact_email: "" });
        setFormErrors({});
        fetchCollaborations();
      } else {
        alert("Failed to submit. Please try again.");
      }
    } catch {
      alert("Cannot connect to server");
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this collaboration?")) return;
    try {
      await fetch(`http://127.0.0.1:8000/api/v1/collaborations/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCollaborations();
    } catch {
      alert("Cannot connect to server");
    }
  };

  const filteredCollabs = collaborations.filter(c =>
    c.project_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.ngo_name?.toLowerCase().includes(search.toLowerCase())
  );

  const activeProjects = collaborations.filter(c => c.status === "active").length;

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
          <li className="bg-white text-sky-600 p-3 rounded-lg cursor-pointer font-bold shadow-md flex items-center gap-2">🤝 NGO Portal</li>
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
            <h1 className="text-3xl font-bold text-sky-900">NGO Portal</h1>
            <p className="text-sky-600 font-medium italic">Manage collaboration projects and monitor water quality in your area.</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-500 text-white px-6 py-2 rounded-xl font-bold shadow-lg hover:bg-green-600 transition-all">
            {showForm ? "✕ Close Form" : "+ New Project"}
          </button>
        </header>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: "Active Projects", value: activeProjects, color: "text-sky-700", border: "border-sky-400", icon: "🤝" },
            { label: "Reports in System", value: reports.length, color: "text-green-600", border: "border-green-400", icon: "📊" },
            { label: "Active Alerts", value: alerts.length, color: "text-red-600", border: "border-red-400", icon: "🔔" },
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

        {/* Submit Collaboration Form */}
        {showForm && (
          <div className="bg-white border border-green-100 rounded-3xl p-6 shadow-sm mb-8">
            <h2 className="text-xl font-bold text-green-700 mb-4">Submit New Collaboration Project</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-sm font-bold text-gray-600 mb-1 block">Project Name *</label>
                <input
                  type="text"
                  maxLength={120}
                  placeholder="Enter project name..."
                  value={formData.project_name}
                  onChange={e => setFormData({ ...formData, project_name: e.target.value })}
                  className={`w-full p-3 rounded-xl border-2 outline-none ${formErrors.project_name ? "border-red-400" : "border-green-200 focus:border-green-400"}`} />
                {formErrors.project_name && <p className="text-red-500 text-xs mt-1">{formErrors.project_name}</p>}
              </div>
              <div>
                <label className="text-sm font-bold text-gray-600 mb-1 block">NGO Name *</label>
                <input
                  type="text"
                  placeholder="Enter NGO name..."
                  value={formData.ngo_name}
                  onChange={e => setFormData({ ...formData, ngo_name: e.target.value })}
                  className={`w-full p-3 rounded-xl border-2 outline-none ${formErrors.ngo_name ? "border-red-400" : "border-green-200 focus:border-green-400"}`} />
                {formErrors.ngo_name && <p className="text-red-500 text-xs mt-1">{formErrors.ngo_name}</p>}
              </div>
              <div>
                <label className="text-sm font-bold text-gray-600 mb-1 block">Contact Email *</label>
                <input
                  type="email"
                  placeholder="contact@ngo.org"
                  value={formData.contact_email}
                  onChange={e => setFormData({ ...formData, contact_email: e.target.value })}
                  className={`w-full p-3 rounded-xl border-2 outline-none ${formErrors.contact_email ? "border-red-400" : "border-green-200 focus:border-green-400"}`} />
                {formErrors.contact_email && <p className="text-red-500 text-xs mt-1">{formErrors.contact_email}</p>}
              </div>
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={`px-8 py-3 rounded-xl font-bold text-white transition ${submitting ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"}`}>
              {submitting ? "Submitting..." : "🤝 Submit Project"}
            </button>
          </div>
        )}

        {/* Collaborations List */}
        <div className="bg-white rounded-3xl shadow-sm border border-sky-100 overflow-hidden">
          <div className="p-6 border-b border-sky-50 flex justify-between items-center">
            <h2 className="text-xl font-bold text-sky-900">Collaboration Projects ({collaborations.length})</h2>
            <input
              type="text"
              placeholder="🔍 Search projects..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="p-2 px-4 rounded-xl border-2 border-sky-200 focus:border-sky-400 outline-none text-sm w-64" />
          </div>
          <table className="w-full text-left">
            <thead className="bg-sky-50 text-sky-700 uppercase text-xs font-black tracking-widest">
              <tr>
                <th className="p-5">ID</th>
                <th className="p-5">Project Name</th>
                <th className="p-5">NGO Name</th>
                <th className="p-5">Contact Email</th>
                <th className="p-5">Status</th>
                <th className="p-5">Date Added</th>
                <th className="p-5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-50">
              {loading ? (
                <tr><td colSpan="7" className="p-8 text-center text-gray-400">Loading projects...</td></tr>
              ) : filteredCollabs.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-gray-400">
                  {search ? "No projects match your search" : "No collaboration projects yet. Submit your first project!"}
                </td></tr>
              ) : (
                filteredCollabs.map(c => (
                  <tr key={c.id} className="hover:bg-sky-50/40 transition-colors">
                    <td className="p-5 font-bold text-sky-700">#{c.id}</td>
                    <td className="p-5 font-semibold text-slate-700">{c.project_name}</td>
                    <td className="p-5 text-slate-600">{c.ngo_name}</td>
                    <td className="p-5 text-slate-600">{c.contact_email}</td>
                    <td className="p-5">
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${c.status === "active" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                        {c.status || "active"}
                      </span>
                    </td>
                    <td className="p-5 text-slate-500">{c.created_at?.slice(0, 10)}</td>
                    <td className="p-5">
                      <button
                        onClick={() => handleDelete(c.id)}
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

        {/* Recent Alerts in Area */}
        <div className="mt-8 bg-white border border-red-50 rounded-3xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-sky-900 mb-4">🔔 Recent Alerts in Area</h2>
          {alerts.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No active alerts</p>
          ) : (
            <div className="space-y-3">
              {alerts.slice(0, 5).map(alert => (
                <div key={alert.id} className={`flex items-center gap-4 p-4 rounded-2xl border ${
                  alert.type === "contamination" ? "bg-red-50 border-red-100" :
                  alert.type === "boil_notice" ? "bg-amber-50 border-amber-100" :
                  "bg-gray-50 border-gray-100"}`}>
                  <span className="text-2xl">
                    {alert.type === "boil_notice" ? "🔥" : alert.type === "contamination" ? "☣️" : "⚡"}
                  </span>
                  <div className="flex-1">
                    <p className="font-bold text-slate-700">{alert.message}</p>
                    <p className="text-sm text-slate-500">📍 {alert.location} · {alert.issued_at?.slice(0, 10)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                    alert.type === "contamination" ? "bg-red-100 text-red-600" :
                    alert.type === "boil_notice" ? "bg-amber-100 text-amber-700" :
                    "bg-gray-100 text-gray-600"}`}>
                    {alert.type?.replace("_", " ")}
                  </span>
                </div>
              ))}
              {alerts.length > 5 && (
                <button onClick={() => navigate("/alerts")} className="text-sky-600 font-bold text-sm hover:underline">
                  View all {alerts.length} alerts →
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default NGODashboard;
