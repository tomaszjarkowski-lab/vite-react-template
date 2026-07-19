import { getAccessToken } from "../auth/session";
import type {
	AnalysisResult,
	MagicLinkRequest,
	MagicLinkResponse,
	User,
	VerifyMagicLinkRequest,
	VerifyMagicLinkResponse,
} from "../types/api";

const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL ?? "https://test-nest-production-089c.up.railway.app";

export class ApiError extends Error {
	constructor(
		public status: number,
		message: string,
	) {
		super(message);
		this.name = "ApiError";
	}
}

function extractErrorMessage(data: unknown, fallback: string): string {
	if (!data || typeof data !== "object") return fallback;

	const record = data as Record<string, unknown>;
	const message = record.message ?? record.error ?? record.statusMessage;

	if (typeof message === "string") return message;
	if (Array.isArray(message)) return message.map(String).join(", ");

	return fallback;
}

export async function apiFetch<T>(
	path: string,
	options: RequestInit = {},
): Promise<T> {
	const headers = new Headers(options.headers);

	if (!headers.has("Content-Type")) {
		headers.set("Content-Type", "application/json");
	}

	const token = getAccessToken();
	if (token) {
		headers.set("Authorization", `Bearer ${token}`);
	}

	let response: Response;
	try {
		response = await fetch(`${API_BASE_URL}${path}`, {
			...options,
			headers,
		});
	} catch {
		throw new ApiError(
			0,
			`Nie udało się połączyć z API (${API_BASE_URL}). Sprawdź, czy backend działa i czy CORS jest włączony.`,
		);
	}

	if (!response.ok) {
		let message = response.statusText || `HTTP ${response.status}`;
		try {
			const data: unknown = await response.json();
			message = extractErrorMessage(data, message);
		} catch {
			// keep fallback message
		}
		throw new ApiError(response.status, message);
	}

	if (response.status === 204) {
		return undefined as T;
	}

	const contentType = response.headers.get("content-type") ?? "";
	if (contentType.includes("application/json")) {
		return (await response.json()) as T;
	}

	return (await response.text()) as T;
}

export function getHello(): Promise<string> {
	return apiFetch<string>("/");
}

export function getUsers(): Promise<User[]> {
	return apiFetch<User[]>("/users");
}

export function requestMagicLink(
	body: MagicLinkRequest,
): Promise<MagicLinkResponse> {
	return apiFetch<MagicLinkResponse>("/auth/magic-link", {
		method: "POST",
		body: JSON.stringify(body),
	});
}

export function verifyMagicLink(
	body: VerifyMagicLinkRequest,
): Promise<VerifyMagicLinkResponse> {
	return apiFetch<VerifyMagicLinkResponse>("/auth/verify-magic-link", {
		method: "POST",
		body: JSON.stringify(body),
	});
}

export function getMyAnalysisResults(): Promise<AnalysisResult[]> {
	return apiFetch<AnalysisResult[]>("/analysis-results");
}
