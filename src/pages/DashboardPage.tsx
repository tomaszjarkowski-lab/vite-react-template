import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	ApiError,
	getMyAnalysisResults,
	getMyDoctorOpinions,
	getMyPurchases,
} from "../api/client";
import { clearSession, getSession } from "../auth/session";
import type {
	AnalysisResult,
	DoctorOpinion,
	Purchase,
} from "../types/api";
import { AnalysisDetailsSection } from "../components/AnalysisDetailsSection";

function showError(error: unknown): void {
	if (error instanceof ApiError) {
		alert(error.message);
		return;
	}
	if (error instanceof Error) {
		alert(error.message);
		return;
	}
	alert("Wystąpił nieoczekiwany błąd.");
}

function formatFileSize(size: string): string {
	const bytes = Number(size);
	if (!Number.isFinite(bytes) || bytes < 0) return size;

	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatAmount(amount: string, currency: string): string {
	const value = Number(amount);
	if (!Number.isFinite(value)) return `${amount} ${currency}`;
	return `${value.toFixed(2)} ${currency}`;
}

function formatDate(iso: string): string {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return iso;
	return date.toLocaleString("pl-PL");
}

function formatOpinionStatus(opinion: DoctorOpinion | null | undefined): string {
	if (!opinion) return "—";
	if (opinion.isDoctorOpinionSubmitted) return "Opinia złożona";
	if (opinion.isOpinionFormCompleted) return "Formularz uzupełniony";
	if (opinion.requiresDoctorOpinion) return "Wymaga opinii lekarza";
	return "Brak wymogu";
}

function formatPurchaseSummary(purchase: Purchase | null | undefined): string {
	if (!purchase) return "—";
	return `${formatAmount(purchase.amount, purchase.currency)} · ${purchase.paymentStatus}`;
}

function shortId(id: string): string {
	return id.length > 8 ? `${id.slice(0, 8)}…` : id;
}

export function DashboardPage() {
	const navigate = useNavigate();
	const session = getSession();

	const [analysisResults, setAnalysisResults] = useState<
		AnalysisResult[] | null
	>(null);
	const [purchases, setPurchases] = useState<Purchase[] | null>(null);
	const [doctorOpinions, setDoctorOpinions] = useState<
		DoctorOpinion[] | null
	>(null);

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

	function handleApiError(error: unknown, fallback: string): boolean {
		if (error instanceof ApiError && error.status === 401) {
			handleSessionExpired();
			return true;
		}
		const message =
			error instanceof Error ? error.message : fallback;
		setDataError(message);
		showError(error);
		return false;
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
			handleApiError(error, "Nie udało się pobrać danych.");
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

	const purchasesByAnalysis = new Map(
		(purchases ?? []).map((p) => [p.analysisResultId, p]),
	);
	const opinionsByAnalysis = new Map(
		(doctorOpinions ?? []).map((o) => [o.analysisResultId, o]),
	);

	return (
		<main className="page page-dashboard">
			<header className="row space-between">
				<h1>Dashboard</h1>
				<button type="button" onClick={handleLogout}>
					Logout
				</button>
			</header>

			<section className="stack">
				<p>
					<strong>Email:</strong> {session.email ?? "—"}
				</p>
				<p>
					<strong>userId:</strong> {session.userId ?? "—"}
				</p>
			</section>

			<div className="dashboard-grid">
				<section className="stack panel">
					<div className="row space-between">
						<h2>Moje wyniki analiz</h2>
						<button
							type="button"
							onClick={() => void fetchDashboardData()}
							disabled={dataLoading}
						>
							{dataLoading ? "Pobieranie…" : "Odśwież"}
						</button>
					</div>

					{dataLoading &&
						analysisResults === null &&
						purchases === null &&
						doctorOpinions === null && (
							<p className="muted">Ładowanie danych…</p>
						)}

					{dataError && <p className="error">{dataError}</p>}

					{!dataLoading && analysisResults?.length === 0 && (
						<p className="muted">Brak wyników analiz</p>
					)}

					{analysisResults && analysisResults.length > 0 && (
						<div className="table-wrap">
							<table>
								<thead>
									<tr>
										<th>Analiza</th>
										<th>Plik</th>
										<th>Płatność</th>
										<th>Opinia lekarza</th>
									</tr>
								</thead>
								<tbody>
									{analysisResults.map((result) => {
										const purchase =
											result.purchase ??
											purchasesByAnalysis.get(result.id) ??
											null;
										const opinion =
											result.doctorOpinion ??
											opinionsByAnalysis.get(result.id) ??
											null;

										return (
											<tr key={result.id}>
												<td>
													<strong>{result.name}</strong>
													<div className="muted small">
														{result.fileType} ·{" "}
														{formatFileSize(result.fileSize)}
													</div>
												</td>
												<td>
													<a
														href={result.assetUrl}
														target="_blank"
														rel="noreferrer"
													>
														Otwórz PDF
													</a>
												</td>
												<td>{formatPurchaseSummary(purchase)}</td>
												<td>{formatOpinionStatus(opinion)}</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					)}
				</section>

				<section className="stack panel">
					<h2>Moje płatności i opinie lekarza</h2>

					<h3 className="subsection-title">Płatności</h3>
					{!dataLoading && purchases?.length === 0 && (
						<p className="muted">Brak płatności</p>
					)}
					{purchases && purchases.length > 0 && (
						<div className="table-wrap">
							<table>
								<thead>
									<tr>
										<th>Data</th>
										<th>Kwota</th>
										<th>Status</th>
										<th>Analiza</th>
										<th>Szczegóły</th>
									</tr>
								</thead>
								<tbody>
									{purchases.map((purchase) => (
										<tr key={purchase.id}>
											<td>
												{formatDate(purchase.purchaseCreationTime)}
											</td>
											<td>
												{formatAmount(
													purchase.amount,
													purchase.currency,
												)}
												{purchase.promoCode && (
													<div className="muted small">
														Promo: {purchase.promoCode}
													</div>
												)}
											</td>
											<td>{purchase.paymentStatus}</td>
											<td>
												<code title={purchase.analysisResultId}>
													{shortId(purchase.analysisResultId)}
												</code>
											</td>
											<td className="small">
												<div>
													Paragon:{" "}
													{purchase.receiptNumber ?? "—"}
												</div>
												<div>
													Subskrypcja:{" "}
													{purchase.isSubscriptionPurchased
														? "tak"
														: "nie"}
												</div>
												<div>
													Pack:{" "}
													{purchase.packAdded ? "tak" : "nie"}
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}

					<h3 className="subsection-title">Opinie lekarza</h3>
					{!dataLoading && doctorOpinions?.length === 0 && (
						<p className="muted">Brak opinii lekarza</p>
					)}
					{doctorOpinions && doctorOpinions.length > 0 && (
						<div className="table-wrap">
							<table>
								<thead>
									<tr>
										<th>Analiza</th>
										<th>Status</th>
										<th>Formularz</th>
										<th>Złożona</th>
										<th>MedChart</th>
									</tr>
								</thead>
								<tbody>
									{doctorOpinions.map((opinion) => (
										<tr key={opinion.id}>
											<td>
												<code title={opinion.analysisResultId}>
													{shortId(opinion.analysisResultId)}
												</code>
											</td>
											<td>
												{opinion.requiresDoctorOpinion
													? "Wymagana"
													: "Niewymagana"}
											</td>
											<td>
												{opinion.isOpinionFormCompleted
													? "Uzupełniony"
													: "Nie uzupełniony"}
											</td>
											<td>
												{opinion.isDoctorOpinionSubmitted
													? "Tak"
													: "Nie"}
											</td>
											<td>
												{opinion.medChartEventId ? (
													<code title={opinion.medChartEventId}>
														{shortId(opinion.medChartEventId)}
													</code>
												) : (
													"—"
												)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</section>
			</div>

			<AnalysisDetailsSection
				results={analysisResults}
				loading={dataLoading}
				error={dataError}
			/>
		</main>
	);
}
