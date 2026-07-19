import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError, requestMagicLink, verifyMagicLink } from "../api/client";
import { saveSession } from "../auth/session";
import type { MagicLinkResponse } from "../types/api";

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

export function LoginPage() {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [verifying, setVerifying] = useState(false);
	const [magicLink, setMagicLink] = useState<MagicLinkResponse | null>(null);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const trimmed = email.trim();
		if (!trimmed) {
			alert("Podaj email.");
			return;
		}

		setLoading(true);
		setMagicLink(null);
		try {
			const result = await requestMagicLink({ email: trimmed });
			setMagicLink(result);
		} catch (error) {
			showError(error);
		} finally {
			setLoading(false);
		}
	}

	async function handleVerifyHashedToken() {
		if (!magicLink?.hashedToken) return;

		setVerifying(true);
		try {
			const session = await verifyMagicLink({
				hashedToken: magicLink.hashedToken,
			});
			saveSession({
				accessToken: session.accessToken,
				refreshToken: session.refreshToken,
				email: session.email,
				userId: session.userId,
			});
			navigate("/dashboard", { replace: true });
		} catch (error) {
			showError(error);
		} finally {
			setVerifying(false);
		}
	}

	return (
		<main className="page">
			<h1>MedMetrix — Login</h1>
			<p className="muted">Zaloguj się emailem (magic link / hashedToken).</p>

			<form className="stack" onSubmit={handleSubmit}>
				<label htmlFor="email">Email</label>
				<input
					id="email"
					type="email"
					autoComplete="email"
					placeholder="user@example.com"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
				/>
				<button type="submit" disabled={loading}>
					{loading ? "Wysyłanie…" : "Wyślij magic link"}
				</button>
			</form>

			{magicLink && (
				<section className="result stack">
					<h2>Wynik magic link</h2>
					<p>
						<strong>Email:</strong> {magicLink.email}
					</p>
					{magicLink.emailOtp && (
						<p>
							<strong>emailOtp:</strong> {magicLink.emailOtp}
						</p>
					)}
					<div className="row">
						<a
							className="button"
							href={magicLink.actionLink}
							target="_blank"
							rel="noreferrer"
						>
							Otwórz link
						</a>
						<button
							type="button"
							onClick={handleVerifyHashedToken}
							disabled={verifying}
						>
							{verifying
								? "Weryfikacja…"
								: "Zaloguj przez hashedToken"}
						</button>
					</div>
					<details>
						<summary>hashedToken (debug)</summary>
						<code className="break">{magicLink.hashedToken}</code>
					</details>
				</section>
			)}
		</main>
	);
}
