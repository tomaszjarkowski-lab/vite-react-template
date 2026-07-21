import {
	Activity,
	Check,
	Clock,
	Download,
	HeartPulse,
	Stethoscope,
} from "lucide-react";
import type { AnalysisResult, DoctorOpinion, Purchase } from "../../types/api";
import {
	getConfidenceBars,
	getConfidenceLabel,
	getDisplayName,
	getMeaningText,
	normalizeSignalLevel,
	sortPredictions,
} from "../../lib/diseaseLogic";

type TodayViewProps = {
	email?: string;
	results: AnalysisResult[];
	loading: boolean;
	error: string | null;
};

function greetingName(email?: string): string {
	if (!email) return "";
	const local = email.split("@")[0] ?? "";
	const first = local.split(/[._-]/)[0] ?? local;
	if (!first) return "";
	return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}

function formatPolishDate(date = new Date()): string {
	return date.toLocaleDateString("pl-PL", {
		weekday: "long",
		day: "numeric",
		month: "long",
		year: "numeric",
	});
}

function resolveOpinion(
	result: AnalysisResult,
): DoctorOpinion | null {
	return result.doctorOpinion;
}

function resolvePurchase(result: AnalysisResult): Purchase | null {
	return result.purchase;
}

function AnalysisReportCard({ result }: { result: AnalysisResult }) {
	const json = result.analysisResultJson;
	const opinion = resolveOpinion(result);
	const purchase = resolvePurchase(result);
	const requiresDoctorOpinion = opinion?.requiresDoctorOpinion ?? false;
	const isDoctorOpinionSubmitted =
		opinion?.isDoctorOpinionSubmitted ?? false;
	const isSubscriptionActive =
		purchase?.isSubscriptionPurchased ?? false;

	if (!json) {
		return (
			<section className="rounded-3xl border border-mm-border bg-white p-6 shadow-sm">
				<h2 className="text-xl font-semibold text-mm-ink">{result.name}</h2>
				<p className="mt-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-mm-ink-soft">
					Szczegóły analizy są niedostępne
				</p>
				{result.assetUrl && (
					<a
						href={result.assetUrl}
						target="_blank"
						rel="noreferrer"
						className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-mm-teal bg-white py-3 text-md font-semibold text-mm-teal"
					>
						<Download className="h-5 w-5" />
						Pobierz wyniki (PDF)
					</a>
				)}
			</section>
		);
	}

	const predictions = sortPredictions(json.Details?.Predictions ?? []);
	const topPredictions = predictions.slice(0, 3);
	const meaningText = getMeaningText(predictions);

	return (
		<section className="rounded-3xl border border-mm-border bg-white p-5 shadow-sm sm:p-6">
			<h2 className="text-xl font-semibold text-mm-ink sm:text-2xl">
				Wynik analizy skóry
			</h2>
			<p className="mt-1 text-sm text-mm-muted">{result.name}</p>

			{isSubscriptionActive && (
				<div className="my-3 flex gap-3 rounded-xl border-2 border-[#10b9818c] bg-[#F3FBF8] p-3">
					<span className="flex h-6 w-6 min-h-6 min-w-6 items-center justify-center rounded-full border border-green-400 bg-white">
						<Activity className="h-4 w-4 text-green-400" />
					</span>
					<div>
						<h3 className="text-md font-medium text-green-500">
							Plan Opieki Ciągłej aktywny
						</h3>
						<p className="mt-1 text-sm text-mm-ink-soft">
							Twój Plan Opieki Ciągłej jest aktywny. Po przygotowaniu
							opinii lekarza wyślemy Ci spersonalizowany plan opieki.
						</p>
					</div>
				</div>
			)}

			{requiresDoctorOpinion && isDoctorOpinionSubmitted && (
				<div className="my-3 flex gap-3 rounded-xl border-2 border-[#10b9818c] bg-[#F3FBF8] p-3">
					<span className="flex h-6 w-6 min-h-6 min-w-6 items-center justify-center rounded-full border border-green-400 bg-white">
						<Check className="h-4 w-4 text-green-400" />
					</span>
					<div>
						<h3 className="text-md font-medium text-green-500">
							Opinia lekarza gotowa
						</h3>
						<p className="mt-1 text-sm text-mm-ink-soft">
							Lekarz zweryfikował wynik AI. Szczegóły znajdziesz w
							sekcji „Mój plan”.
						</p>
					</div>
				</div>
			)}

			{requiresDoctorOpinion && !isDoctorOpinionSubmitted && (
				<div className="my-3 flex gap-3 rounded-xl border-2 border-[#30b8b88c] bg-[#ECF9F8] p-3">
					<span className="flex h-6 w-6 min-h-6 min-w-6 items-center justify-center rounded-full bg-white">
						<Clock className="h-4 w-4 text-mm-teal" />
					</span>
					<div>
						<h3 className="text-md font-medium text-mm-teal">
							Opinia lekarza w przygotowaniu
						</h3>
						<p className="mt-1 text-sm text-mm-ink-soft">
							To wstępny wynik analizy skóry. Opinia lekarza będzie
							dostępna w ciągu 24 godzin.
						</p>
					</div>
				</div>
			)}

			<p className="mt-6 text-md font-semibold text-mm-ink-soft">
				Najbardziej prawdopodobne rozpoznania:
			</p>

			<div className="mt-3 space-y-3">
				{topPredictions.length === 0 ? (
					<p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-mm-muted">
						Brak predykcji w wyniku analizy.
					</p>
				) : (
					topPredictions.map((prediction, index) => {
						const isMain = index === 0;
						const signalLevel = normalizeSignalLevel(prediction);
						const confidenceBars = getConfidenceBars(signalLevel);

						return (
							<div
								key={`${prediction.Name ?? prediction.ClassificationName}-${index}`}
								className="rounded-3xl border border-mm-border bg-white p-5"
							>
								<div className="flex items-center justify-between gap-2">
									<div className="flex items-center gap-2">
										<span
											className={`flex h-8 w-8 min-h-8 min-w-8 items-center justify-center rounded-full ${
												isMain
													? "bg-mm-teal-soft"
													: "bg-mm-amber-soft"
											}`}
										>
											<Stethoscope
												className={`h-4 w-4 ${
													isMain
														? "text-mm-teal"
														: "text-mm-amber"
												}`}
											/>
										</span>
										<p className="text-sm font-semibold uppercase leading-6 text-mm-ink">
											{getDisplayName(prediction)}
										</p>
									</div>
									<div className="flex items-center gap-1">
										{confidenceBars.map((isActive, barIndex) => (
											<span
												key={barIndex}
												className={`h-2 w-5 rounded-md sm:h-3 sm:w-7 ${
													isActive
														? isMain
															? "bg-mm-teal-deep"
															: "bg-mm-amber"
														: "bg-[#e6e8ee]"
												}`}
											/>
										))}
									</div>
								</div>
								<p className="mt-1 text-sm leading-8 text-mm-ink-soft">
									zgodność objawów:{" "}
									<span className="font-semibold text-mm-ink">
										{getConfidenceLabel(signalLevel)}
									</span>
								</p>
							</div>
						);
					})
				)}
			</div>

			<div className="mt-6 rounded-3xl border border-mm-teal border-l-4 border-l-mm-teal bg-white p-6">
				<p className="text-lg font-semibold text-mm-teal">Co to oznacza?</p>
				<p className="mt-2 text-sm text-mm-ink-soft">{meaningText}</p>
				<p className="mt-4 text-xs font-bold text-gray-400">
					Pełny raport PDF znajdziesz poniżej.
				</p>
			</div>

			<div className="mt-6 rounded-3xl border border-mm-border bg-white p-4">
				<div className="flex items-center gap-3 py-3">
					<span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mm-teal-soft">
						<Check className="h-5 w-5 text-mm-teal" />
					</span>
					<div>
						<p className="text-md font-semibold leading-[1.1] text-mm-ink">
							Otrzymaliśmy Twoje zdjęcia
						</p>
					</div>
				</div>
				<div className="my-1 h-px bg-[#e9edf2]" />
				<div className="flex items-center gap-3 py-3">
					<span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mm-teal-soft">
						<Check className="h-5 w-5 text-mm-teal" />
					</span>
					<div>
						<p className="text-md font-semibold leading-[1.1] text-mm-ink">
							Wstępna analiza skóry gotowa
						</p>
						<p className="text-sm text-mm-muted">Wynik jest już dostępny</p>
					</div>
				</div>
				<div className="my-1 h-px bg-[#e9edf2]" />
				{requiresDoctorOpinion && isDoctorOpinionSubmitted ? (
					<div className="flex items-center gap-3 py-3">
						<span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mm-teal-soft">
							<Check className="h-5 w-5 text-mm-teal" />
						</span>
						<div>
							<p className="text-md font-semibold leading-[1.1] text-mm-ink">
								Opinia lekarza gotowa
							</p>
							<p className="text-sm text-mm-muted">
								Lekarz zweryfikował wynik AI
							</p>
						</div>
					</div>
				) : requiresDoctorOpinion ? (
					<div className="flex items-center gap-3 py-3 opacity-80">
						<span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-yellow-100">
							<Clock className="h-5 w-5 text-yellow-500" />
						</span>
						<div>
							<p className="text-md font-semibold leading-[1.1] text-mm-ink">
								Opinia lekarza
							</p>
							<p className="text-sm text-mm-muted">
								Twoja opinia lekarza pojawi się w ciągu 24 godzin.
							</p>
						</div>
					</div>
				) : (
					<div className="flex items-center gap-3 py-3 opacity-70">
						<span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#d9dfd9] bg-white text-md font-semibold text-[#a8b0ba]">
							3
						</span>
						<div>
							<p className="text-md font-semibold leading-[1.1] text-mm-ink">
								Opinia lekarza
							</p>
							<p className="text-sm text-mm-muted">
								Odblokuj w Planie opieki ciągłej
							</p>
						</div>
					</div>
				)}
				<div className="my-1 h-px bg-[#e9edf2]" />
				{isSubscriptionActive ? (
					<div className="flex items-center gap-3 py-3">
						<span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mm-teal-soft">
							<Check className="h-5 w-5 text-mm-teal" />
						</span>
						<div>
							<p className="text-md font-semibold leading-[1.1] text-mm-ink">
								Plan opieki ciągłej
							</p>
							<p className="text-sm text-mm-muted">Aktywny</p>
						</div>
					</div>
				) : (
					<div className="flex items-center gap-3 py-3 opacity-70">
						<span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#d9dfd9] bg-white text-md font-semibold text-[#a8b0ba]">
							4
						</span>
						<div>
							<p className="text-md font-semibold leading-[1.1] text-mm-ink">
								Plan opieki ciągłej
							</p>
							<p className="text-sm text-mm-muted">
								Odblokuj stałą opiekę dermatologiczną
							</p>
						</div>
					</div>
				)}
			</div>

			{result.assetUrl && (
				<a
					href={result.assetUrl}
					target="_blank"
					rel="noreferrer"
					className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-mm-teal bg-white py-3 text-md font-semibold text-mm-teal transition hover:bg-mm-teal-soft"
				>
					<Download className="h-5 w-5" />
					Pobierz wyniki (PDF)
				</a>
			)}

			<div className="mt-6 rounded-3xl border border-mm-border bg-white p-4">
				<div className="flex gap-2">
					<div className="text-mm-teal">
						<HeartPulse />
					</div>
					<p className="text-sm text-mm-ink-soft">
						To analiza wspomagana AI — pierwszy krok do zdrowia skóry.
						Ostateczne rozpoznanie zawsze stawia lekarz.
					</p>
				</div>
			</div>
		</section>
	);
}

export function TodayView({ email, results, loading, error }: TodayViewProps) {
	const name = greetingName(email);

	if (loading && results.length === 0) {
		return (
			<div className="mx-auto w-full max-w-3xl space-y-4">
				<div className="h-8 w-56 animate-pulse rounded-lg bg-slate-200" />
				<div className="h-64 animate-pulse rounded-3xl bg-slate-200" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="mx-auto w-full max-w-3xl rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
				{error}
			</div>
		);
	}

	return (
		<div className="mx-auto w-full max-w-3xl space-y-6">
			<header>
				<h1 className="text-2xl font-semibold text-mm-ink sm:text-3xl">
					{name ? `Dzień dobry, ${name}` : "Dzień dobry"}
				</h1>
				<p className="mt-1 capitalize text-mm-muted">
					{formatPolishDate()}
				</p>
			</header>

			{results.length === 0 ? (
				<section className="rounded-3xl border border-mm-border bg-white p-8 text-center shadow-sm">
					<p className="text-mm-ink-soft">Brak wyników analiz</p>
				</section>
			) : (
				results.map((result) => (
					<AnalysisReportCard key={result.id} result={result} />
				))
			)}
		</div>
	);
}
