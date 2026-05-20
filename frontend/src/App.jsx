import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import AddProblem from "./pages/AddProblem";
import ProblemList from "./pages/ProblemList";
import ProblemDetail from "./pages/ProblemDetail";
import Statements from "./pages/Statements";
import EditProblem from "./pages/EditProblem";
import KnowledgeVault from "./pages/KnowledgeVault";
import RevisionMode from "./pages/RevisionMode";
import VerifyOtp from "./pages/VerifyOtp";

import Login from "./pages/Login";
import Signup from "./pages/Signup";

function AppLayout({ children }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        {children}
      </div>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />

        <Route
          path="/"
          element={
            <AppLayout>
              <Dashboard />
            </AppLayout>
          }
        />

        <Route
          path="/add-problem"
          element={
            <AppLayout>
              <AddProblem />
            </AppLayout>
          }
        />

        <Route
          path="/problems"
          element={
            <AppLayout>
              <ProblemList />
            </AppLayout>
          }
        />

        <Route
          path="/problems/:id"
          element={
            <AppLayout>
              <ProblemDetail />
            </AppLayout>
          }
        />

        <Route
          path="/problems/edit/:id"
          element={
            <AppLayout>
              <EditProblem />
            </AppLayout>
          }
        />

        <Route
          path="/statements"
          element={
            <AppLayout>
              <Statements />
            </AppLayout>
          }
        />

        <Route
          path="/knowledge"
          element={
            <AppLayout>
              <KnowledgeVault />
            </AppLayout>
          }
        />

        <Route
          path="/revision"
          element={
            <AppLayout>
              <RevisionMode />
            </AppLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;