import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	ApiError,
	getMyAnalysisResults,
	getMyDoctorOpinions,
	getMyPurchases,
} from "../api/client";
import { clearSession, getSession } from "../auth/session";
import {
	DashboardShell,
	type DashboardTab,
} from "../components/dashboard/DashboardShell";
import { DocumentsView } from "../components/dashboard/DocumentsView";
import { PlanView } from "../components/dashboard/PlanView";
import { TodayView } from "../components/dashboard/TodayView";
import type {
	AnalysisResult,
	DoctorOpinion,
	Purchase,
} from "../types/api";

export function DashboardPage() {
	const navigate = useNavigate();
	const session = getSession();
	const [activeTab, setActiveTab] = useState<DashboardTab>("today");

	const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>(
		[],
	);
	const [purchases, setPurchases] = useState<Purchase[]>([]);
	const [doctorOpinions, setDoctorOpinions] = useState<DoctorOpinion[]>([]);
	const [dataLoading, setDataLoading] = useState(false);
	const [dataError, setDataError] = useState<string | null>(null);

	useEffect(() => {
		if (!getSession()?.accessToken) {
			navigate("/", { replace: true });
		}
	}, [navigate]);

	function handleSessionExpired() {
		clearSession();
		alert("Sesja wygasła. Zaloguj się ponownie.");
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

	if (!session?.accessToken) {
		return null;
	}

	function handleLogout() {
		clearSession();
		navigate("/", { replace: true });
	}

	return (
		<DashboardShell
			activeTab={activeTab}
			onTabChange={setActiveTab}
			onLogout={handleLogout}
		>
			{activeTab === "today" && (
				<TodayView
					email={session.email}
					results={analysisResults}
					loading={dataLoading}
					error={dataError}
				/>
			)}
			{activeTab === "plan" && (
				<PlanView
					purchases={purchases}
					opinions={doctorOpinions}
					loading={dataLoading}
					error={dataError}
				/>
			)}
			{activeTab === "documents" && (
				<DocumentsView
					results={analysisResults}
					purchases={purchases}
					loading={dataLoading}
					error={dataError}
				/>
			)}
		</DashboardShell>
	);
}
