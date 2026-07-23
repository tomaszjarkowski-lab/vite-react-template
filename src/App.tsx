import { Navigate, Route, Routes } from "react-router-dom";
import { AuthCallbackPage } from "./pages/AuthCallbackPage";
import { DashboardDocumentsPage } from "./pages/DashboardDocumentsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DashboardPlanPage } from "./pages/DashboardPlanPage";
import { DashboardTodayPage } from "./pages/DashboardTodayPage";
import { LoginPage } from "./pages/LoginPage";

export default function App() {
	return (
		<Routes>
			<Route path="/" element={<LoginPage />} />
			<Route path="/dashboard" element={<DashboardPage />}>
				<Route index element={<DashboardTodayPage />} />
				<Route path="plan" element={<DashboardPlanPage />} />
				<Route path="dokumenty" element={<DashboardDocumentsPage />} />
			</Route>
			<Route path="/callback" element={<AuthCallbackPage />} />
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	);
}
