import { getUserClaimsFromAccessToken } from "../auth/jwt";
import { useDashboardContext } from "../components/dashboard/dashboardContext";
import { TodayView } from "../components/dashboard/TodayView";

export function DashboardTodayPage() {
	const { session, selectedAnalysis, dataLoading, dataError } =
		useDashboardContext();
	const email = getUserClaimsFromAccessToken(session.accessToken).email;

	return (
		<TodayView
			email={email}
			result={selectedAnalysis}
			loading={dataLoading}
			error={dataError}
		/>
	);
}
