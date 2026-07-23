/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle2, Loader2, MailX } from "lucide-react";
import { saveSession } from "../auth/session";
import { MedMetrixLogo } from "../components/MedMetrixLogo";

type CallbackState =
	| { kind: "loading"; message: string }
	| { kind: "success"; message: string }
	| { kind: "error"; title: string; message: string; hint?: string };

function parseAuthParams(
	hash: string,
	search: string,
): {
	accessToken?: string;
	refreshToken?: string;
	error?: string;
	errorCode?: string;
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
		errorCode: get("error_code"),
		errorDescription: get("error_description"),
	};
}

function mapAuthError(
	error: string,
	errorCode?: string,
	errorDescription?: string,
): { title: string; message: string; hint?: string } {
	const description = (errorDescription ?? "").toLowerCase();
	const code = (errorCode ?? "").toLowerCase();

	if (
		code === "otp_expired" ||
		description.includes("expired") ||
		description.includes("invalid")
	) {
		return {
			title: "Link wygasł lub jest nieprawidłowy",
			message:
				"Link logowania z e-maila został już użyty albo stracił ważność. Wygeneruj nowy link na stronie logowania.",
			hint: "Ze względów bezpieczeństwa każdy link działa tylko raz i przez ograniczony czas.",
		};
	}

	if (error === "access_denied") {
		return {
			title: "Nie udało się zalogować",
			message:
				"Dostęp został odrzucony. Spróbuj ponownie wygenerować link logowania.",
			hint: errorDescription
				? `Szczegóły: ${errorDescription}`
				: undefined,
		};
	}

	return {
		title: "Błąd logowania",
		message:
			errorDescription ||
			"Wystąpił problem podczas weryfikacji linku. Spróbuj zalogować się ponownie.",
		hint: error !== "access_denied" ? `Kod: ${error}` : undefined,
	};
}

export function AuthCallbackPage() {
	const navigate = useNavigate();
	const [state, setState] = useState<CallbackState>({
		kind: "loading",
		message: "Weryfikujemy link logowania…",
	});

	useEffect(() => {
		const { accessToken, refreshToken, error, errorCode, errorDescription } =
			parseAuthParams(window.location.hash, window.location.search);

		if (error) {
			setState({
				kind: "error",
				...mapAuthError(error, errorCode, errorDescription),
			});
			return;
		}

		if (!accessToken) {
			setState({
				kind: "error",
				title: "Brak danych sesji",
				message:
					"Nie znaleźliśmy tokenu w linku logowania. Upewnij się, że otworzyłeś pełny link z e-maila albo wygeneruj nowy.",
				hint: "Redirect URL powinien wskazywać na /callback.",
			});
			return;
		}

		saveSession({
			accessToken,
			refreshToken,
		});

		window.history.replaceState(null, "", "/callback");
		setState({
			kind: "success",
			message: "Zalogowano pomyślnie. Przekierowujemy do pulpitu…",
		});
		navigate("/dashboard", { replace: true });
	}, [navigate]);

	return (
		<main className="login-page">
			<div className="login-page__backdrop" aria-hidden="true" />

			<div className="login-shell">
				<section className="login-card" aria-live="polite">
					<header className="login-card__header">
						<MedMetrixLogo className="medmetrix-logo" size="lg" />
						<p className="login-card__eyebrow">Portal pacjenta</p>
						<h1 className="login-card__title">
							{state.kind === "loading" && "Logowanie…"}
							{state.kind === "success" && "Witamy z powrotem"}
							{state.kind === "error" && state.title}
						</h1>
					</header>

					{state.kind === "loading" && (
						<div className="flex flex-col items-center gap-4 py-4 text-center">
							<Loader2 className="h-10 w-10 animate-spin text-mm-teal" />
							<p className="text-sm text-[#3d5a66]">{state.message}</p>
						</div>
					)}

					{state.kind === "success" && (
						<div className="flex flex-col items-center gap-4 py-4 text-center">
							<span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#eef9f6]">
								<CheckCircle2 className="h-7 w-7 text-mm-teal-deep" />
							</span>
							<p className="text-sm text-[#3d5a66]">{state.message}</p>
						</div>
					)}

					{state.kind === "error" && (
						<div className="flex flex-col gap-4">
							<div className="flex flex-col items-center gap-3 text-center">
								<span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fef3f2]">
									{state.title.toLowerCase().includes("wygas") ? (
										<MailX className="h-7 w-7 text-[#b42318]" />
									) : (
										<AlertCircle className="h-7 w-7 text-[#b42318]" />
									)}
								</span>
								<p className="text-sm leading-relaxed text-[#3d5a66]">
									{state.message}
								</p>
							</div>

							{state.hint && (
								<div className="rounded-[10px] border border-[#d5e3e6] bg-[#f8fbfb] px-4 py-3 text-sm text-[#3d5a66]">
									{state.hint}
								</div>
							)}

							<Link to="/" className="login-submit no-underline">
								Wróć do logowania
							</Link>
						</div>
					)}
				</section>

				<p className="login-footer">
					Bezpieczne logowanie bez hasła · MedMetrix
				</p>
			</div>
		</main>
	);
}
