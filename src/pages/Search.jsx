import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Search = () => {
  const navigate = useNavigate();
  const [stations, setStations] = useState([]);
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/stations")
      .then(res => res.json())
      .then(data => {
        setStations(data);
        setFiltered(data);
      });
  }, []);

  const handleSearch = (e) => {
    const val = e.target.value;
    setQuery(val);
    const results = stations.filter(s =>
      s.name.toLowerCase().includes(val.toLowerCase()) ||
      (s.managed_by && s.managed_by.toLowerCase().includes(val.toLowerCase()))
    );
    setFiltered(results);
    if (val.length > 2) {
      fetch(`http://127.0.0.1:8000/searches?user_id=1&parameter=Water Station Name&value=${val}`, { method: "POST" });
    }
  };

  return (
    <div className="min-h-screen flex bg-sky-50 font-sans">
      <div className="w-64 bg-sky-600 text-white flex flex-col p-6 shadow-xl">
        <h2 className="text-2xl font-bold mb-8 italic">💧 WQM</h2>
        <ul className="space-y-2 flex-1">
          <li onClick={() => navigate("/dashboard")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer">🏠 Dashboard</li>
          <li onClick={() => navigate("/map")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer">📍 Live Map</li>
          <li onClick={() => navigate("/reports")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer">📊 Reports</li>
          <li onClick={() => navigate("/water-data")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer">🌊 Water Data</li>
          <li className="bg-white text-sky-600 p-3 rounded-lg font-bold shadow-md">🔍 Search</li>
          <li onClick={() => navigate("/readings")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer">📈 Readings</li>
          <li onClick={() => navigate("/profile")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer">👤 Profile</li>
        </ul>
      </div>
      <div className="flex-1 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-sky-900">Search Stations</h1>
          <p className="text-sky-600">Search by station name or managing authority</p>
        </header>
        <div className="mb-6">
          <input type="text" value={query} onChange={handleSearch}
            placeholder="🔍 Search station name or authority..."
            className="w-full p-4 rounded-2xl border-2 border-sky-200 focus:border-sky-500 outline-none text-lg shadow-sm" />
        </div>
        <p className="text-sky-600 mb-4 font-medium">{filtered.length} station(s) found</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filtered.map((station, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-sky-100 p-6">
              <h3 className="font-bold text-sky-800 text-lg mb-3">{station.name}</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Managed By</span>
                  <span className="font-bold text-slate-700">{station.managed_by || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Latitude</span>
                  <span className="text-slate-500">{station.latitude}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Longitude</span>
                  <span className="text-slate-500">{station.longitude}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Station ID</span>
                  <span className="bg-sky-100 text-sky-600 px-2 py-1 rounded-full text-xs font-bold">#{station.id}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center text-gray-400 mt-20 text-xl">No stations found for "{query}"</div>
        )}
      </div>
    </div>
  );
};

export default Search;
