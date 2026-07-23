import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError, requestMagicLink } from "../api/client";
import { getAccessToken } from "../auth/session";
import { MedMetrixLogo } from "../components/MedMetrixLogo";

function getErrorMessage(error: unknown): string {
	if (error instanceof ApiError) {
		if (error.status === 404) {
			return "Nie znaleziono konta dla podanego adresu e-mail.";
		}
		return error.message;
	}
	if (error instanceof Error) return error.message;
	return "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.";
}

function isValidEmail(value: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function LoginPage() {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [sentToEmail, setSentToEmail] = useState<string | null>(null);

	const isLoggedIn = Boolean(getAccessToken());

	useEffect(() => {
		if (isLoggedIn) {
			navigate("/dashboard", { replace: true });
		}
	}, [isLoggedIn, navigate]);

	const trimmedEmail = email.trim();
	const canSubmit = isValidEmail(trimmedEmail) && !loading;

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!canSubmit) return;

		setLoading(true);
		setError(null);
		setSentToEmail(null);

		try {
			const result = await requestMagicLink({ email: trimmedEmail });
			setSentToEmail(result.email || trimmedEmail);
		} catch (err) {
			setError(getErrorMessage(err));
		} finally {
			setLoading(false);
		}
	}

	function handleReset() {
		setSentToEmail(null);
		setError(null);
	}

	if (isLoggedIn) {
		return null;
	}

	return (
		<main className="login-page">
			<div className="login-page__backdrop" aria-hidden="true" />

			<div className="login-shell">
				<section className="login-card" aria-labelledby="login-title">
					<header className="login-card__header">
						<MedMetrixLogo className="medmetrix-logo" size="lg" />
						<p className="login-card__eyebrow">Portal pacjenta</p>
						<h1 id="login-title" className="login-card__title">
							{sentToEmail
								? "Sprawdź swoją skrzynkę"
								: "Zaloguj się do MedMetrix"}
						</h1>
						<p className="login-card__subtitle">
							{sentToEmail
								? "Wysłaliśmy Ci bezpieczny link do logowania."
								: "Wyślemy bezpieczny link logowania na Twój adres e-mail. Nie potrzebujesz hasła."}
						</p>
					</header>

					{!sentToEmail ? (
						<form className="login-form" onSubmit={handleSubmit} noValidate>
							<label className="login-field" htmlFor="email">
								<span>Adres e-mail</span>
								<input
									id="email"
									type="email"
									autoComplete="email"
									inputMode="email"
									placeholder="jan.kowalski@email.com"
									value={email}
									onChange={(e) => {
										setEmail(e.target.value);
										if (error) setError(null);
									}}
									disabled={loading}
									aria-invalid={Boolean(error)}
									aria-describedby={
										error ? "login-error" : "login-hint"
									}
								/>
							</label>

							<p id="login-hint" className="login-hint">
								Użyj adresu powiązanego z zakupioną analizą.
							</p>

							{error && (
								<div
									id="login-error"
									className="login-alert login-alert--error"
									role="alert"
								>
									{error}
								</div>
							)}

							<button
								type="submit"
								className="login-submit"
								disabled={!canSubmit}
							>
								{loading ? (
									<span className="login-submit__loading">
										<span
											className="login-spinner"
											aria-hidden="true"
										/>
										Wysyłanie linku…
									</span>
								) : (
									"Zaloguj się"
								)}
							</button>
						</form>
					) : (
						<section className="login-success" aria-live="polite">
							<div className="login-alert login-alert--success">
								<p>
									Jeśli konto istnieje, link trafił na adres{" "}
									<strong>{sentToEmail}</strong>.
								</p>
								<p>
									Otwórz wiadomość od MedMetrix i kliknij link,
									aby się zalogować. Link jest jednorazowy i może
									wygasnąć.
								</p>
							</div>

							<p className="login-hint">
								Nie widzisz maila? Sprawdź folder spam / oferty.
							</p>

							<button
								type="button"
								className="login-secondary"
								onClick={handleReset}
							>
								Użyj innego e-maila
							</button>
						</section>
					)}
				</section>

				<p className="login-footer">
					Bezpieczne logowanie bez hasła · MedMetrix
				</p>
			</div>
		</main>
	);
}
