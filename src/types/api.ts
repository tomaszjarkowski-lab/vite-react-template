export type User = {
	id: string;
	email: string;
	authUserId: string | null;
};

export type MagicLinkRequest = {
	email: string;
};

export type MagicLinkResponse = {
	email: string;
	actionLink: string;
	hashedToken: string;
	emailOtp: string | null;
};

export type VerifyMagicLinkRequest = {
	hashedToken: string;
};

export type VerifyMagicLinkResponse = {
	accessToken: string;
	refreshToken: string;
	expiresIn: number;
	tokenType: string;
	userId: string;
	email: string;
};

export type Session = {
	accessToken: string;
	refreshToken?: string;
	email?: string;
	userId?: string;
};

export type AnalysisResult = {
	id: string;
	name: string;
	assetId: string;
	assetUrl: string;
	fileSize: string;
	fileType: string;
	userId: string;
};
