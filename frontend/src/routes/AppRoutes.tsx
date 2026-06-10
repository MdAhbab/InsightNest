import { Suspense, lazy } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { Loading } from "../components/AsyncStates";
import ProtectedRoute from "../components/ProtectedRoute";

const HomePage = lazy(() => import("../pages/HomePage"));
const LoginPage = lazy(() => import("../pages/LoginPage"));
const RegisterPage = lazy(() => import("../pages/RegisterPage"));
const DashboardPage = lazy(() => import("../pages/DashboardPage"));
const UniversitiesPage = lazy(() => import("../pages/UniversitiesPage"));
const ProgramsPage = lazy(() => import("../pages/ProgramsPage"));
const ScholarshipsPage = lazy(() => import("../pages/ScholarshipsPage"));
const ResearchPage = lazy(() => import("../pages/ResearchPage"));
const ResourcesPage = lazy(() => import("../pages/ResourcesPage"));
const ForumsPage = lazy(() => import("../pages/ForumsPage"));
const WebinarsPage = lazy(() => import("../pages/WebinarsPage"));
const ContactPage = lazy(() => import("../pages/ContactPage"));
const FaqPage = lazy(() => import("../pages/FaqPage"));

const NotFound = () => (
  <div className="not-found">
    <h2>404 — Page not found</h2>
    <p>The page you are looking for does not exist.</p>
    <Link to="/" className="btn btn-primary">
      Go home
    </Link>
  </div>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="/universities" element={<UniversitiesPage />} />
        <Route path="/programs" element={<ProgramsPage />} />
        <Route path="/scholarships" element={<ScholarshipsPage />} />
        <Route path="/research" element={<ResearchPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/forums" element={<ForumsPage />} />
        <Route path="/webinars" element={<WebinarsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
