import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import DashboardPage from "../pages/DashboardPage";
import UniversitiesPage from "../pages/UniversitiesPage";
import ProgramsPage from "../pages/ProgramsPage";
import ScholarshipsPage from "../pages/ScholarshipsPage";
import ResearchPage from "../pages/ResearchPage";
import ResourcesPage from "../pages/ResourcesPage";
import ForumsPage from "../pages/ForumsPage";
import WebinarsPage from "../pages/WebinarsPage";
import ContactPage from "../pages/ContactPage";
import FaqPage from "../pages/FaqPage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/universities" element={<UniversitiesPage />} />
      <Route path="/programs" element={<ProgramsPage />} />
      <Route path="/scholarships" element={<ScholarshipsPage />} />
      <Route path="/research" element={<ResearchPage />} />
      <Route path="/resources" element={<ResourcesPage />} />
      <Route path="/forums" element={<ForumsPage />} />
      <Route path="/webinars" element={<WebinarsPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/faq" element={<FaqPage />} />
    </Routes>
  );
};

export default AppRoutes;
