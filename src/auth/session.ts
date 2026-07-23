import type { Session } from "../types/api";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

/** Legacy keys — removed on clear/save so old values don't linger. */
const LEGACY_EMAIL_KEY = "email";
const LEGACY_USER_ID_KEY = "userId";

export function getAccessToken(): string | null {
	return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getSession(): Session | null {
	const accessToken = getAccessToken();
	if (!accessToken) return null;

	return {
		accessToken,
		refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY) ?? undefined,
	};
}

export function saveSession(session: Session): void {
	localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
	if (session.refreshToken) {
		localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
	} else {
		localStorage.removeItem(REFRESH_TOKEN_KEY);
	}
	localStorage.removeItem(LEGACY_EMAIL_KEY);
	localStorage.removeItem(LEGACY_USER_ID_KEY);
}

export function clearSession(): void {
	localStorage.removeItem(ACCESS_TOKEN_KEY);
	localStorage.removeItem(REFRESH_TOKEN_KEY);
	localStorage.removeItem(LEGACY_EMAIL_KEY);
	localStorage.removeItem(LEGACY_USER_ID_KEY);
}
