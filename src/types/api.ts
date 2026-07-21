export type AnalysisResponsePrediction = {
	name?: string;
	diseaseName?: string;
	confidence?: number;
};

export type AnalysisDetailPrediction = {
	Name?: string;
	ClassificationName?: string;
	Icd?: string;
	Description?: string;
	ReadMoreUrl?: string;
	ConfidenceWithAiModel?: number;
};

export type AnalysisResultJson = {
	AlgorithmType?: string;
	ResponseMessage?: {
		success?: boolean;
		message?: string;
		predictions?: AnalysisResponsePrediction[];
	};
	Details?: {
		PhotoUrl?: string;
		Predictions?: AnalysisDetailPrediction[];
	};
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

export type Purchase = {
	id: string;
	paymentId: string;
	amount: string;
	amountBeforeDiscount: string;
	currency: string;
	paymentStatus: string;
	promoCode: string | null;
	receiptNumber: string | null;
	source: string | null;
	language: string;
	packAdded: boolean;
	isSubscriptionPurchased: boolean;
	purchaseCreationTime: string;
	userId: string;
	analysisResultId: string;
};

export type DoctorOpinion = {
	id: string;
	requiresDoctorOpinion: boolean;
	isOpinionFormCompleted: boolean;
	isDoctorOpinionSubmitted: boolean;
	medChartEventId: string | null;
	userId: string;
	analysisResultId: string;
};

export type AnalysisResult = {
	id: string;
	name: string;
	assetId: string;
	assetUrl: string;
	fileSize: string;
	fileType: string;
	userId: string;
	doctorOpinionId: string | null;
	purchaseId: string | null;
	analysisResultJson: AnalysisResultJson | null;
	doctorOpinion: DoctorOpinion | null;
	purchase: Purchase | null;
};
