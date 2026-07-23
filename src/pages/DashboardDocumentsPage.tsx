import { useDashboardContext } from "../components/dashboard/dashboardContext";
import { DocumentsView } from "../components/dashboard/DocumentsView";

export function DashboardDocumentsPage() {
	const { selectedAnalysis, relatedPurchases, dataLoading, dataError } =
		useDashboardContext();

	return (
		<DocumentsView
			results={selectedAnalysis ? [selectedAnalysis] : []}
			purchases={relatedPurchases}
			loading={dataLoading}
			error={dataError}
		/>
	);
}
