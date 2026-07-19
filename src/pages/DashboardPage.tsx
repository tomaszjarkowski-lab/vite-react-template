import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	ApiError,
	getMyAnalysisResults,
	getUsers,
} from "../api/client";
import { clearSession, getSession } from "../auth/session";
import type { AnalysisResult, User } from "../types/api";

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

export function DashboardPage() {
	const navigate = useNavigate();
	const session = getSession();
	const [users, setUsers] = useState<User[] | null>(null);
	const [usersLoading, setUsersLoading] = useState(false);

	const [analysisResults, setAnalysisResults] = useState<
		AnalysisResult[] | null
	>(null);
	const [analysisLoading, setAnalysisLoading] = useState(false);
	const [analysisError, setAnalysisError] = useState<string | null>(null);

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

	async function fetchAnalysisResults() {
		setAnalysisLoading(true);
		setAnalysisError(null);
		try {
			const data = await getMyAnalysisResults();
			setAnalysisResults(data);
		} catch (error) {
			if (error instanceof ApiError && error.status === 401) {
				handleSessionExpired();
				return;
			}
			const message =
				error instanceof Error
					? error.message
					: "Nie udało się pobrać wyników analiz.";
			setAnalysisError(message);
			showError(error);
		} finally {
			setAnalysisLoading(false);
		}
	}

	useEffect(() => {
		if (!getSession()?.accessToken) return;
		void fetchAnalysisResults();
		// eslint-disable-next-line react-hooks/exhaustive-deps -- fetch once on mount for logged-in user
	}, []);

	if (!session?.accessToken) {
		return null;
	}

	async function handleFetchUsers() {
		setUsersLoading(true);
		try {
			const data = await getUsers();
			setUsers(data);
		} catch (error) {
			if (error instanceof ApiError && error.status === 401) {
				handleSessionExpired();
				return;
			}
			showError(error);
		} finally {
			setUsersLoading(false);
		}
	}

	function handleLogout() {
		clearSession();
		navigate("/", { replace: true });
	}

	return (
		<main className="page">
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

			<section className="stack">
				<div className="row space-between">
					<h2>Moje wyniki analiz</h2>
					<button
						type="button"
						onClick={() => void fetchAnalysisResults()}
						disabled={analysisLoading}
					>
						{analysisLoading ? "Pobieranie…" : "Odśwież wyniki"}
					</button>
				</div>

				{analysisLoading && analysisResults === null && (
					<p className="muted">Ładowanie wyników analiz…</p>
				)}

				{analysisError && <p className="error">{analysisError}</p>}

				{!analysisLoading && analysisResults?.length === 0 && (
					<p className="muted">Brak wyników analiz</p>
				)}

				{analysisResults && analysisResults.length > 0 && (
					<div className="table-wrap">
						<table>
							<thead>
								<tr>
									<th>name</th>
									<th>fileType</th>
									<th>fileSize</th>
									<th>plik</th>
								</tr>
							</thead>
							<tbody>
								{analysisResults.map((result) => (
									<tr key={result.id}>
										<td>{result.name}</td>
										<td>{result.fileType}</td>
										<td>{formatFileSize(result.fileSize)}</td>
										<td>
											<a
												href={result.assetUrl}
												target="_blank"
												rel="noreferrer"
											>
												Otwórz
											</a>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</section>

			<section className="stack">
				<button
					type="button"
					onClick={handleFetchUsers}
					disabled={usersLoading}
				>
					{usersLoading ? "Pobieranie…" : "Pobierz users"}
				</button>

				{users && (
					<div className="table-wrap">
						<table>
							<thead>
								<tr>
									<th>id</th>
									<th>email</th>
									<th>authUserId</th>
								</tr>
							</thead>
							<tbody>
								{users.length === 0 ? (
									<tr>
										<td colSpan={3}>Brak użytkowników</td>
									</tr>
								) : (
									users.map((user) => (
										<tr key={user.id}>
											<td>
												<code>{user.id}</code>
											</td>
											<td>{user.email}</td>
											<td>
												<code>{user.authUserId ?? "null"}</code>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				)}
			</section>
		</main>
	);
}
