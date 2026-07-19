/**
 * Decode JWT payload (no signature verification — display/session only).
 */
export function decodeJwtPayload(
	token: string,
): Record<string, unknown> | null {
	try {
		const parts = token.split(".");
		if (parts.length < 2) return null;

		const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
		const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
		const json = atob(padded);
		return JSON.parse(json) as Record<string, unknown>;
	} catch {
		return null;
	}
}

export function getUserClaimsFromAccessToken(accessToken: string): {
	userId?: string;
	email?: string;
} {
	const payload = decodeJwtPayload(accessToken);
	if (!payload) return {};

	const userId =
		typeof payload.sub === "string" ? payload.sub : undefined;
	const email =
		typeof payload.email === "string" ? payload.email : undefined;

	return { userId, email };
}
