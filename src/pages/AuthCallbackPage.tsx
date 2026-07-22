import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserClaimsFromAccessToken } from "../auth/jwt";
import { saveSession } from "../auth/session";

function parseAuthParams(hash: string, search: string): {
	accessToken?: string;
	refreshToken?: string;
	error?: string;
	errorDescription?: string;
} {
	const fromHash = new URLSearchParams(hash.replace(/^#/, ""));
	const fromQuery = new URLSearchParams(search.replace(/^\?/, ""));

	const get = (key: string) =>
		fromHash.get(key) ?? fromQuery.get(key) ?? undefined;

	return {
		accessToken: get("access_token"),
		refreshToken: get("refresh_token"),
		error: get("error"),
		errorDescription: get("error_description"),
	};
}

export function AuthCallbackPage() {
	const navigate = useNavigate();
	const [status, setStatus] = useState("Sprawdzanie tokenów z URL…");

	useEffect(() => {
		const { accessToken, refreshToken, error, errorDescription } =
			parseAuthParams(window.location.hash, window.location.search);

		if (error) {
			setStatus(
				`Błąd auth: ${error}${errorDescription ? ` — ${errorDescription}` : ""}`,
			);
			return;
		}

		if (!accessToken) {
			setStatus(
				"Brak access_token w URL. Sprawdź redirect URL w Supabase (http://localhost:3000/callback) albo wygeneruj nowy link logowania.",
			);
			return;
		}

		const claims = getUserClaimsFromAccessToken(accessToken);

		saveSession({
			accessToken,
			refreshToken,
			email: claims.email,
			userId: claims.userId,
		});

		window.history.replaceState(null, "", "/callback");
		setStatus("Sesja zapisana — przekierowanie…");
		navigate("/dashboard", { replace: true });
	}, [navigate]);

	return (
		<main className="page">
			<h1>Auth callback</h1>
			<p>{status}</p>
			<p>
				<a href="/">Wróć do logowania</a>
			</p>
		</main>
	);
}
