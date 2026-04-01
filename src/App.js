import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import MapView from "./pages/MapView";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Reports from "./pages/Reports";
import WaterData from "./pages/WaterData";
import Search from "./pages/Search";
import Profile from "./pages/Profile";
import StationReadings from "./pages/StationReadings";
import AuthLayout from "./components/AuthLayout";
import Alerts from "./pages/Alerts";
import NGODashboard from "./pages/NGODashboard";
import AuthorityDashboard from "./pages/AuthorityDashboard";
import PredictiveAlertBanner from "./components/PredictiveAlertBanner";

function App() {
  const token = localStorage.getItem("token");

  return (
    <BrowserRouter>
      {token && <PredictiveAlertBanner />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<AuthLayout><Dashboard /></AuthLayout>} />
        <Route path="/map" element={<AuthLayout><MapView /></AuthLayout>} />
        <Route path="/reports" element={<AuthLayout><Reports /></AuthLayout>} />
        <Route path="/water-data" element={<AuthLayout><WaterData /></AuthLayout>} />
        <Route path="/search" element={<AuthLayout><Search /></AuthLayout>} />
        <Route path="/profile" element={<AuthLayout><Profile /></AuthLayout>} />
        <Route path="/readings" element={<AuthLayout><StationReadings /></AuthLayout>} />
        <Route path="/alerts" element={<AuthLayout><Alerts /></AuthLayout>} />
        <Route path="/ngo/dashboard" element={<AuthLayout><NGODashboard /></AuthLayout>} />
        <Route path="/authority/dashboard" element={<AuthLayout><AuthorityDashboard /></AuthLayout>} />
        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
