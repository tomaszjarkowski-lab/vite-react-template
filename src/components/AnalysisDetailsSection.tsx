import type {
	AnalysisDetailPrediction,
	AnalysisResponsePrediction,
	AnalysisResult,
} from "../types/api";

export function formatConfidence(value: number | undefined): string {
	if (value === undefined || !Number.isFinite(value)) return "—";
	const percent = value <= 1 ? value * 100 : value;
	return `${percent.toFixed(2)}%`;
}

export function getPredictionLabel(
	prediction: AnalysisResponsePrediction | AnalysisDetailPrediction,
): string {
	if ("diseaseName" in prediction && prediction.diseaseName) {
		return prediction.diseaseName;
	}
	if ("name" in prediction && prediction.name) {
		return prediction.name;
	}
	if ("Name" in prediction && prediction.Name) {
		return prediction.Name;
	}
	if ("ClassificationName" in prediction && prediction.ClassificationName) {
		return prediction.ClassificationName;
	}
	return "Nieznana diagnoza";
}

export function getPredictionConfidence(
	prediction: AnalysisResponsePrediction | AnalysisDetailPrediction,
): number | undefined {
	if ("confidence" in prediction) return prediction.confidence;
	if ("ConfidenceWithAiModel" in prediction) {
		return prediction.ConfidenceWithAiModel;
	}
	return undefined;
}

export function getTopPredictions(
	predictions: AnalysisResponsePrediction[] | undefined,
	limit = 5,
): AnalysisResponsePrediction[] {
	if (!predictions?.length) return [];

	return [...predictions]
		.sort(
			(a, b) =>
				(getPredictionConfidence(b) ?? 0) -
				(getPredictionConfidence(a) ?? 0),
		)
		.slice(0, limit);
}

export function getMostLikelyDetailPrediction(
	details: AnalysisDetailPrediction[] | undefined,
): AnalysisDetailPrediction | null {
	if (!details?.length) return null;

	return [...details].sort(
		(a, b) =>
			(getPredictionConfidence(b) ?? 0) -
			(getPredictionConfidence(a) ?? 0),
	)[0];
}

export function getSortedDetailPredictions(
	details: AnalysisDetailPrediction[] | undefined,
): AnalysisDetailPrediction[] {
	if (!details?.length) return [];

	return [...details].sort(
		(a, b) =>
			(getPredictionConfidence(b) ?? 0) -
			(getPredictionConfidence(a) ?? 0),
	);
}

type AnalysisDetailCardProps = {
	result: AnalysisResult;
};

export function AnalysisDetailCard({ result }: AnalysisDetailCardProps) {
	const json = result.analysisResultJson;

	if (!json) {
		return (
			<article className="analysis-card analysis-card--empty">
				<header className="analysis-card__header">
					<h3>{result.name}</h3>
				</header>
				<p className="analysis-card__fallback">
					Szczegóły analizy są niedostępne
				</p>
			</article>
		);
	}

	const topPredictions = getTopPredictions(json.ResponseMessage?.predictions);
	const detailPredictions = getSortedDetailPredictions(
		json.Details?.Predictions,
	);
	const mostLikely = getMostLikelyDetailPrediction(json.Details?.Predictions);

	return (
		<article className="analysis-card">
			<header className="analysis-card__header">
				<div>
					<h3>{result.name}</h3>
					{json.AlgorithmType && (
						<p className="muted small">
							Algorytm: {json.AlgorithmType}
						</p>
					)}
				</div>
			</header>

			{json.ResponseMessage?.message && (
				<p className="analysis-card__message">
					{json.ResponseMessage.message}
				</p>
			)}

			{mostLikely && (
				<section className="analysis-highlight">
					<p className="analysis-highlight__label">
						Najbardziej prawdopodobna diagnoza
					</p>
					<p className="analysis-highlight__title">
						{getPredictionLabel(mostLikely)}
					</p>
					<div className="analysis-highlight__meta">
						{mostLikely.Icd && <span>ICD: {mostLikely.Icd}</span>}
						<span>
							Pewność:{" "}
							{formatConfidence(
								getPredictionConfidence(mostLikely),
							)}
						</span>
					</div>
					{mostLikely.Description && (
						<p className="muted small">{mostLikely.Description}</p>
					)}
				</section>
			)}

			{topPredictions.length > 0 && (
				<section className="analysis-section">
					<h4>Top 5 predykcji</h4>
					<ul className="prediction-list">
						{topPredictions.map((prediction, index) => (
							<li key={`${getPredictionLabel(prediction)}-${index}`}>
								<div className="prediction-list__row">
									<span>{getPredictionLabel(prediction)}</span>
									<strong>
										{formatConfidence(
											getPredictionConfidence(prediction),
										)}
									</strong>
								</div>
								<div className="progress-bar">
									<div
										className="progress-bar__fill"
										style={{
											width: formatConfidence(
												getPredictionConfidence(prediction),
											),
										}}
									/>
								</div>
							</li>
						))}
					</ul>
				</section>
			)}

			{detailPredictions.length > 0 && (
				<section className="analysis-section">
					<h4>Szczegółowe predykcje</h4>
					<div className="detail-predictions">
						{detailPredictions.map((prediction, index) => {
							const isMostLikely =
								mostLikely === prediction ||
								(mostLikely?.Name &&
									mostLikely.Name === prediction.Name);

							return (
								<div
									key={`${prediction.Name ?? prediction.ClassificationName}-${index}`}
									className={`detail-prediction${isMostLikely ? " detail-prediction--top" : ""}`}
								>
									<div className="detail-prediction__header">
										<div>
											<strong>
												{prediction.Name ??
													prediction.ClassificationName}
											</strong>
											{prediction.ClassificationName &&
												prediction.Name &&
												prediction.ClassificationName !==
													prediction.Name && (
													<p className="muted small">
														{
															prediction.ClassificationName
														}
													</p>
												)}
										</div>
										{isMostLikely && (
											<span className="top-badge">
												Najbardziej prawdopodobna
											</span>
										)}
									</div>

									<div className="detail-prediction__meta">
										{prediction.Icd && (
											<span>ICD: {prediction.Icd}</span>
										)}
										<span>
											Pewność:{" "}
											{formatConfidence(
												prediction.ConfidenceWithAiModel,
											)}
										</span>
									</div>

									<div className="progress-bar">
										<div
											className="progress-bar__fill"
											style={{
												width: formatConfidence(
													prediction.ConfidenceWithAiModel,
												),
											}}
										/>
									</div>

									{prediction.Description && (
										<p className="detail-prediction__description">
											{prediction.Description}
										</p>
									)}

									{prediction.ReadMoreUrl && (
										<a
											href={prediction.ReadMoreUrl}
											target="_blank"
											rel="noreferrer"
										>
											Czytaj więcej
										</a>
									)}
								</div>
							);
						})}
					</div>
				</section>
			)}
		</article>
	);
}

type AnalysisDetailsSectionProps = {
	results: AnalysisResult[] | null;
	loading: boolean;
	error: string | null;
};

export function AnalysisDetailsSection({
	results,
	loading,
	error,
}: AnalysisDetailsSectionProps) {
	if (loading && results === null) {
		return (
			<section className="stack panel analysis-details-section">
				<h2>Szczegóły analiz</h2>
				<div className="analysis-skeleton">
					<div className="analysis-skeleton__line" />
					<div className="analysis-skeleton__line analysis-skeleton__line--short" />
					<div className="analysis-skeleton__block" />
				</div>
			</section>
		);
	}

	if (error) {
		return (
			<section className="stack panel analysis-details-section">
				<h2>Szczegóły analiz</h2>
				<p className="error">{error}</p>
			</section>
		);
	}

	if (!results || results.length === 0) {
		return (
			<section className="stack panel analysis-details-section">
				<h2>Szczegóły analiz</h2>
				<p className="muted">Brak wyników analiz</p>
			</section>
		);
	}

	return (
		<section className="stack panel analysis-details-section">
			<h2>Szczegóły analiz</h2>
			<div className="analysis-cards">
				{results.map((result) => (
					<AnalysisDetailCard key={result.id} result={result} />
				))}
			</div>
		</section>
	);
}
