import { useEffect, useMemo, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
	ApiError,
	getMyAnalysisResults,
	getMyDoctorOpinions,
	getMyPurchases,
} from "../api/client";
import { clearSession, getSession } from "../auth/session";
import type { DashboardOutletContext } from "../components/dashboard/dashboardContext";
import { DashboardShell } from "../components/dashboard/DashboardShell";
import type {
	AnalysisResult,
	DoctorOpinion,
	Purchase,
} from "../types/api";

const SELECTED_ANALYSIS_KEY = "selectedAnalysisId";

function readStoredAnalysisId(): string | null {
	return sessionStorage.getItem(SELECTED_ANALYSIS_KEY);
}

function storeAnalysisId(id: string): void {
	sessionStorage.setItem(SELECTED_ANALYSIS_KEY, id);
}

export function DashboardPage() {
	const navigate = useNavigate();
	const session = getSession();

	const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>(
		[],
	);
	const [purchases, setPurchases] = useState<Purchase[]>([]);
	const [doctorOpinions, setDoctorOpinions] = useState<DoctorOpinion[]>([]);
	const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(
		null,
	);
	const [dataLoading, setDataLoading] = useState(false);
	const [dataError, setDataError] = useState<string | null>(null);

	useEffect(() => {
		if (!getSession()?.accessToken) {
			navigate("/", { replace: true });
		}
	}, [navigate]);

	function handleSessionExpired() {
		clearSession();
		toast.error("Sesja wygasła. Zaloguj się ponownie.");
		navigate("/", { replace: true });
	}

	async function fetchDashboardData() {
		setDataLoading(true);
		setDataError(null);
		try {
			const [results, purchaseList, opinionList] = await Promise.all([
				getMyAnalysisResults(),
				getMyPurchases(),
				getMyDoctorOpinions(),
			]);
			setAnalysisResults(results);
			setPurchases(purchaseList);
			setDoctorOpinions(opinionList);

			const storedId = readStoredAnalysisId();
			const nextId =
				(storedId && results.some((r) => r.id === storedId)
					? storedId
					: null) ??
				results[0]?.id ??
				null;

			setSelectedAnalysisId(nextId);
			if (nextId) storeAnalysisId(nextId);
		} catch (error) {
			if (error instanceof ApiError && error.status === 401) {
				handleSessionExpired();
				return;
			}
			const message =
				error instanceof Error
					? error.message
					: "Nie udało się pobrać danych.";
			setDataError(message);
		} finally {
			setDataLoading(false);
		}
	}

	useEffect(() => {
		if (!getSession()?.accessToken) return;
		void fetchDashboardData();
		// eslint-disable-next-line react-hooks/exhaustive-deps -- fetch once on mount
	}, []);

	const selectedAnalysis = useMemo(
		() =>
			analysisResults.find((r) => r.id === selectedAnalysisId) ??
			analysisResults[0] ??
			null,
		[analysisResults, selectedAnalysisId],
	);

	const relatedPurchases = useMemo(() => {
		if (!selectedAnalysis) return [];
		const fromList = purchases.filter(
			(p) => p.analysisResultId === selectedAnalysis.id,
		);
		if (
			selectedAnalysis.purchase &&
			!fromList.some((p) => p.id === selectedAnalysis.purchase?.id)
		) {
			return [selectedAnalysis.purchase, ...fromList];
		}
		return fromList;
	}, [purchases, selectedAnalysis]);

	const relatedOpinions = useMemo(() => {
		if (!selectedAnalysis) return [];
		const fromList = doctorOpinions.filter(
			(o) => o.analysisResultId === selectedAnalysis.id,
		);
		if (
			selectedAnalysis.doctorOpinion &&
			!fromList.some((o) => o.id === selectedAnalysis.doctorOpinion?.id)
		) {
			return [selectedAnalysis.doctorOpinion, ...fromList];
		}
		return fromList;
	}, [doctorOpinions, selectedAnalysis]);

	if (!session?.accessToken) {
		return null;
	}

	function handleLogout() {
		clearSession();
		sessionStorage.removeItem(SELECTED_ANALYSIS_KEY);
		navigate("/", { replace: true });
	}

	function handleSelectAnalysis(id: string) {
		setSelectedAnalysisId(id);
		storeAnalysisId(id);
		navigate("/dashboard");
	}

	const outletContext: DashboardOutletContext = {
		session,
		selectedAnalysis,
		relatedPurchases,
		relatedOpinions,
		dataLoading,
		dataError,
	};

	return (
		<DashboardShell
			onLogout={handleLogout}
			analyses={analysisResults}
			selectedAnalysisId={selectedAnalysis?.id ?? null}
			onSelectAnalysis={handleSelectAnalysis}
			purchases={purchases}
			opinions={doctorOpinions}
		>
			<Outlet context={outletContext} />
		</DashboardShell>
	);
}
