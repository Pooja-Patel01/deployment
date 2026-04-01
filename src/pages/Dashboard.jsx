import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useEffect, useState } from "react";

const Dashboard = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "Rohan";
  const userRole = localStorage.getItem("userRole") || "Operator";

  const [alerts, setAlerts] = useState([]);
  const [stationData, setStationData] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/stations")
      .then(res => res.json())
      .then(data => setStationData(data));

    fetch("http://127.0.0.1:8000/alerts")
      .then(res => res.json())
      .then(data => setAlerts(data));
  }, []);

  const data = [
    { time: '00:00', ph: 7.0, turbidity: 1.1, chlorine: 0.5 },
    { time: '04:00', ph: 7.2, turbidity: 1.4, chlorine: 0.6 },
    { time: '08:00', ph: 6.9, turbidity: 1.8, chlorine: 0.8 },
    { time: '12:00', ph: 7.4, turbidity: 1.2, chlorine: 0.7 },
    { time: '16:00', ph: 7.1, turbidity: 1.5, chlorine: 0.9 },
    { time: '20:00', ph: 7.3, turbidity: 1.3, chlorine: 0.6 },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex bg-sky-50 text-slate-800 font-sans">
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
          <li onClick={() => navigate("/dashboard")} className="bg-white text-sky-600 p-3 rounded-lg cursor-pointer font-bold shadow-md flex items-center gap-2">🏠 Dashboard</li>
          <li onClick={() => navigate("/map")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-2">📍 Live Map View</li>
          <li onClick={() => navigate("/reports")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-2">📊 Analytics & Reports</li>
        </ul>
        <button onClick={handleLogout} className="mt-auto bg-white text-sky-600 hover:bg-sky-50 py-2.5 rounded-lg font-bold transition-all shadow-lg">Logout</button>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-sky-900">System Overview</h1>
            <p className="text-sky-600 font-medium tracking-tight italic">Welcome back, {userName} | Monitoring Plant Alpha</p>
          </div>
          <span className="bg-red-100 text-red-600 px-4 py-1 rounded-full text-xs font-bold border border-red-200">
            {alerts.length} Active Alerts
          </span>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'pH Level', value: '7.2', color: 'text-sky-700', border: 'border-sky-400' },
            { label: 'Turbidity', value: '1.5 NTU', color: 'text-amber-600', border: 'border-amber-400' },
            { label: 'Chlorine', value: '0.8 mg/L', color: 'text-sky-700', border: 'border-sky-400' },
            { label: 'Active Stations', value: stationData.length, color: 'text-sky-700', border: 'border-sky-400' }
          ].map((stat, i) => (
            <div key={i} className={`bg-white border-l-4 ${stat.border} rounded-2xl p-6 shadow-sm`}>
              <h3 className="text-slate-500 text-sm font-semibold">{stat.label}</h3>
              <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white border border-sky-100 rounded-3xl p-8 shadow-sm">
            <h2 className="text-xl font-bold text-sky-900 mb-6 italic">Multi-Parameter Line Chart</h2>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f9ff" />
                  <XAxis dataKey="time" stroke="#0ea5e9" fontSize={12} />
                  <YAxis stroke="#0ea5e9" fontSize={12} />
                  <Tooltip contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  <Legend iconType="circle" />
                  <Line type="monotone" dataKey="ph" stroke="#0284c7" strokeWidth={4} name="pH" />
                  <Line type="monotone" dataKey="turbidity" stroke="#f59e0b" strokeWidth={4} name="Turbidity" />
                  <Line type="monotone" dataKey="chlorine" stroke="#10b981" strokeWidth={4} name="Chlorine" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border border-sky-100 rounded-3xl p-8 shadow-sm flex flex-col items-center justify-center">
            <h2 className="text-xl font-bold text-sky-900 mb-8 self-start">Water Quality Index</h2>
            <div className="relative flex items-center justify-center">
              <svg className="w-48 h-48 rotate-[-90deg]">
                <circle cx="96" cy="96" r="80" stroke="#f0f9ff" strokeWidth="12" fill="transparent" />
                <circle cx="96" cy="96" r="80" stroke="#0284c7" strokeWidth="12" fill="transparent" strokeDasharray="502" strokeDashoffset="75" strokeLinecap="round" />
              </svg>
              <span className="absolute text-6xl font-black text-sky-900">85</span>
            </div>
            <p className="mt-4 text-green-600 font-black tracking-widest uppercase">Excellent</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;