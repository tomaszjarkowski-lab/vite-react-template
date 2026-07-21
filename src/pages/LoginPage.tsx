import { useState, type FormEvent } from "react";
import { ApiError, requestMagicLink } from "../api/client";
import { MedMetrixLogo } from "../components/MedMetrixLogo";
import type { MagicLinkResponse } from "../types/api";

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
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [magicLink, setMagicLink] = useState<MagicLinkResponse | null>(null);

	const trimmedEmail = email.trim();
	const canSubmit = isValidEmail(trimmedEmail) && !loading;

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!canSubmit) return;

		setLoading(true);
		setError(null);
		setMagicLink(null);

		try {
			const result = await requestMagicLink({ email: trimmedEmail });
			setMagicLink(result);
		} catch (err) {
			setError(getErrorMessage(err));
		} finally {
			setLoading(false);
		}
	}

	function handleReset() {
		setMagicLink(null);
		setError(null);
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
							Zaloguj się do MedMetrix
						</h1>
						<p className="login-card__subtitle">
							Wyślemy bezpieczny link logowania na Twój adres
							e-mail. Nie potrzebujesz hasła.
						</p>
					</header>

					{!magicLink ? (
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
						<section className="email-sim" aria-live="polite">
							<div className="email-sim__banner">
								<span className="email-sim__badge">
									Tryb deweloperski
								</span>
								<p>
									Poniżej symulujemy wiadomość e-mail. W
									produkcji link trafiłby na skrzynkę — teraz
									kliknij go poniżej, aby się zalogować.
								</p>
							</div>

							<article className="email-preview">
								<header className="email-preview__meta">
									<div className="email-preview__from">
										<span className="email-preview__avatar">
											M
										</span>
										<div>
											<strong>MedMetrix</strong>
											<p>noreply@medmetrix.app</p>
										</div>
									</div>
									<p className="email-preview__to">
										Do: <strong>{magicLink.email}</strong>
									</p>
									<p className="email-preview__subject">
										Twój link do logowania
									</p>
								</header>

								<div className="email-preview__body">
									<p>Witaj,</p>
									<p>
										Kliknij poniższy przycisk, aby bezpiecznie
										zalogować się do portalu MedMetrix.
									</p>
									<a
										className="email-preview__cta"
										href={magicLink.actionLink}
										rel="noreferrer"
									>
										Zaloguj się przez link
									</a>
									<p className="email-preview__note">
										Link jest jednorazowy i może wygasnąć.
										Jeśli go nie użyjesz, wygeneruj nowy.
									</p>
								</div>
							</article>

							<div className="email-sim__actions">
								<button
									type="button"
									className="login-secondary"
									onClick={handleReset}
								>
									Użyj innego e-maila
								</button>
							</div>
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
