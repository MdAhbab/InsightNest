import AppRoutes from "./routes/AppRoutes";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import { AuthProvider } from "./context/AuthContext";

const App = () => {
  return (
    <AuthProvider>
      <div className="app-shell">
        <NavBar />
        <main className="app-main">
          <AppRoutes />
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
};

export default App;
