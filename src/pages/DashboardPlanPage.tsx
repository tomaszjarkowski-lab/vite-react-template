import { useDashboardContext } from "../components/dashboard/dashboardContext";
import { PlanView } from "../components/dashboard/PlanView";

export function DashboardPlanPage() {
	const { relatedPurchases, relatedOpinions, dataLoading, dataError } =
		useDashboardContext();

	return (
		<PlanView
			purchases={relatedPurchases}
			opinions={relatedOpinions}
			loading={dataLoading}
			error={dataError}
		/>
	);
}
