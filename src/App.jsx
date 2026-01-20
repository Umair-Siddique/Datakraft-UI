import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import SigninPage from "./pages/Signin";
import ChatPage from "./pages/ChatPage";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes - Available to all users */}
        <Route element={<Outlet />}>
          {/* Informational pages */}
          {/* <Route path="/about" element={<h1>About Page</h1>} /> */}

          {/* Public Only Routes - Only for non-authenticated users */}
          <Route element={<PublicRoute />}>
            {/* <Route path="/" element={<h1>Landing Page</h1>} /> */}
            <Route path="/Signin" element={<SigninPage />} />
            
            {/* <Route
              path="/forgot-password"
              element={<h1>Forgot Password Page</h1>}
            /> */}
          </Route>

          {/* Protected Routes - Only for authenticated users */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<ChatPage />} />
          </Route>

          {/* Catch-All Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
