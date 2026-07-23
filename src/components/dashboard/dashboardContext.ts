import { useOutletContext } from "react-router-dom";
import type {
	AnalysisResult,
	DoctorOpinion,
	Purchase,
	Session,
} from "../../types/api";

export type DashboardOutletContext = {
	session: Session;
	selectedAnalysis: AnalysisResult | null;
	relatedPurchases: Purchase[];
	relatedOpinions: DoctorOpinion[];
	dataLoading: boolean;
	dataError: string | null;
};

export function useDashboardContext(): DashboardOutletContext {
	return useOutletContext<DashboardOutletContext>();
}
