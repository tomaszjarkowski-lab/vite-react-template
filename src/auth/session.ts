import type { Session } from "../types/api";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const EMAIL_KEY = "email";
const USER_ID_KEY = "userId";

export function getAccessToken(): string | null {
	return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getSession(): Session | null {
	const accessToken = getAccessToken();
	if (!accessToken) return null;

	return {
		accessToken,
		refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY) ?? undefined,
		email: localStorage.getItem(EMAIL_KEY) ?? undefined,
		userId: localStorage.getItem(USER_ID_KEY) ?? undefined,
	};
}

export function saveSession(session: Session): void {
	localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
	if (session.refreshToken) {
		localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
	}
	if (session.email) {
		localStorage.setItem(EMAIL_KEY, session.email);
	}
	if (session.userId) {
		localStorage.setItem(USER_ID_KEY, session.userId);
	}
}

export function clearSession(): void {
	localStorage.removeItem(ACCESS_TOKEN_KEY);
	localStorage.removeItem(REFRESH_TOKEN_KEY);
	localStorage.removeItem(EMAIL_KEY);
	localStorage.removeItem(USER_ID_KEY);
}
