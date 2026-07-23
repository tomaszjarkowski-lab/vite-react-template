import { ChevronDown } from "lucide-react";
import { useMemo } from "react";
import type {
	AnalysisResult,
	DoctorOpinion,
	Purchase,
} from "../../types/api";

type AnalysisSwitcherProps = {
	analyses: AnalysisResult[];
	selectedId: string | null;
	onSelect: (id: string) => void;
	purchases?: Purchase[];
	opinions?: DoctorOpinion[];
	compact?: boolean;
};

type AnalysisKind = "ai" | "opinion" | "subscription";

function resolvePurchase(
	result: AnalysisResult,
	purchases: Purchase[],
): Purchase | null {
	return (
		result.purchase ??
		purchases.find((p) => p.analysisResultId === result.id) ??
		null
	);
}

function resolveOpinion(
	result: AnalysisResult,
	opinions: DoctorOpinion[],
): DoctorOpinion | null {
	return (
		result.doctorOpinion ??
		opinions.find((o) => o.analysisResultId === result.id) ??
		null
	);
}

function getAnalysisKind(
	result: AnalysisResult,
	purchases: Purchase[],
	opinions: DoctorOpinion[],
): AnalysisKind {
	const purchase = resolvePurchase(result, purchases);
	const opinion = resolveOpinion(result, opinions);

	if (purchase?.isSubscriptionPurchased) return "subscription";
	if (opinion?.requiresDoctorOpinion) return "opinion";
	return "ai";
}

function buildAnalysisLabels(
	analyses: AnalysisResult[],
	purchases: Purchase[],
	opinions: DoctorOpinion[],
): Map<string, string> {
	const kinds = analyses.map((analysis) => ({
		id: analysis.id,
		kind: getAnalysisKind(analysis, purchases, opinions),
	}));

	const counts: Record<AnalysisKind, number> = {
		ai: 0,
		opinion: 0,
		subscription: 0,
	};
	for (const item of kinds) {
		counts[item.kind] += 1;
	}

	const indexes: Record<AnalysisKind, number> = {
		ai: 0,
		opinion: 0,
		subscription: 0,
	};

	const labels = new Map<string, string>();

	for (const item of kinds) {
		indexes[item.kind] += 1;
		const n = indexes[item.kind];
		const total = counts[item.kind];

		if (item.kind === "subscription") {
			labels.set(
				item.id,
				total > 1 ? `Subskrypcja (${n})` : "Subskrypcja",
			);
		} else if (item.kind === "opinion") {
			labels.set(item.id, total > 1 ? `Opinia (${n})` : "Opinia");
		} else {
			labels.set(item.id, total > 1 ? `Analiza AI (${n})` : "Analiza AI");
		}
	}

	return labels;
}

export function AnalysisSwitcher({
	analyses,
	selectedId,
	onSelect,
	purchases = [],
	opinions = [],
	compact = false,
}: AnalysisSwitcherProps) {
	const labels = useMemo(
		() => buildAnalysisLabels(analyses, purchases, opinions),
		[analyses, purchases, opinions],
	);

	if (analyses.length === 0) return null;

	const selected =
		analyses.find((a) => a.id === selectedId) ?? analyses[0];
	const selectedLabel = labels.get(selected.id) ?? "Analiza AI";

	if (analyses.length === 1) {
		return (
			<div
				className={`rounded-xl border border-mm-border bg-slate-50 ${
					compact ? "px-2.5 py-1.5" : "px-3 py-2"
				}`}
			>
				<p className="text-[10px] font-bold uppercase tracking-wide text-mm-teal">
					Twoja analiza
				</p>
				<p
					className={`truncate font-medium text-mm-ink ${
						compact ? "text-xs" : "text-sm"
					}`}
					title={selectedLabel}
				>
					{selectedLabel}
				</p>
			</div>
		);
	}

	return (
		<label className="block">
			<span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-mm-teal">
				Twoje analizy ({analyses.length})
			</span>
			<div className="relative">
				<select
					value={selected.id}
					onChange={(e) => onSelect(e.target.value)}
					aria-label="Wybierz analizę"
					className={`w-full cursor-pointer appearance-none rounded-xl border border-mm-border bg-white font-medium text-mm-ink outline-none transition focus:border-mm-teal focus:ring-2 focus:ring-mm-teal/20 ${
						compact
							? "py-2 pr-8 pl-2.5 text-xs"
							: "py-2.5 pr-9 pl-3 text-sm"
					}`}
				>
					{analyses.map((analysis) => (
						<option key={analysis.id} value={analysis.id}>
							{labels.get(analysis.id) ?? "Analiza AI"}
						</option>
					))}
				</select>
				<ChevronDown
					className={`pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-mm-muted ${
						compact ? "h-3.5 w-3.5" : "h-4 w-4"
					}`}
					aria-hidden
				/>
			</div>
		</label>
	);
}
