import { Download, FileText, Lightbulb, ScrollText } from "lucide-react";
import type { AnalysisResult, Purchase } from "../../types/api";

type DocumentsViewProps = {
	results: AnalysisResult[];
	purchases: Purchase[];
	loading: boolean;
	error: string | null;
};

function formatDate(iso?: string): string {
	if (!iso) return "—";
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return iso;
	return date.toLocaleDateString("pl-PL", {
		day: "numeric",
		month: "long",
		year: "numeric",
	});
}

type DocItem = {
	id: string;
	title: string;
	meta: string;
	href?: string;
	kind: "analysis" | "receipt" | "legal";
};

export function DocumentsView({
	results,
	purchases,
	loading,
	error,
}: DocumentsViewProps) {
	const docs: DocItem[] = [
		...results.map((result) => ({
			id: `analysis-${result.id}`,
			title: result.name || "Analiza AI zmian skórnych",
			meta: "Analiza AI",
			href: result.assetUrl,
			kind: "analysis" as const,
		})),
		...purchases.map((purchase) => ({
			id: `purchase-${purchase.id}`,
			title: purchase.isSubscriptionPurchased
				? "Rachunek – plan opieki"
				: "Rachunek – analiza AI",
			meta: formatDate(purchase.purchaseCreationTime),
			kind: "receipt" as const,
		})),
		{
			id: "terms",
			title: "Regulamin",
			meta: "dokument prawny",
			kind: "legal",
		},
		{
			id: "privacy",
			title: "Polityka prywatności",
			meta: "dokument prawny",
			kind: "legal",
		},
	];

	if (loading && results.length === 0) {
		return (
			<div className="mx-auto w-full max-w-3xl space-y-4">
				<div className="h-8 w-40 animate-pulse rounded-lg bg-slate-200" />
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
			<h1 className="text-2xl font-semibold text-mm-ink sm:text-3xl">
				Dokumenty
			</h1>

			<section className="rounded-3xl border border-mm-border bg-white p-5 shadow-sm sm:p-7">
				<p className="text-xs font-bold uppercase tracking-wide text-mm-teal">
					📄 Twoje dokumenty
				</p>
				<p className="mt-2 text-sm text-mm-ink-soft">
					Wszystko, co powstało w MedMetrix – z datami i źródłem. Zostaje
					na Twoim koncie na zawsze.
				</p>

				<ul className="mt-6 space-y-2">
					{docs.map((doc) => {
						const Icon =
							doc.kind === "analysis"
								? Lightbulb
								: doc.kind === "receipt"
									? FileText
									: ScrollText;

						return (
							<li
								key={doc.id}
								className="flex items-center gap-3 rounded-2xl border border-mm-border px-3 py-3 sm:px-4"
							>
								<span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50">
									<Icon className="h-4 w-4 text-mm-teal" />
								</span>
								<div className="min-w-0 flex-1">
									<p className="truncate text-sm font-semibold text-mm-ink">
										{doc.title}
									</p>
									<p className="text-xs text-mm-muted">{doc.meta}</p>
								</div>
								{doc.href ? (
									<a
										href={doc.href}
										target="_blank"
										rel="noreferrer"
										className="inline-flex items-center gap-1.5 text-sm font-medium text-mm-ink hover:text-mm-teal"
									>
										<Download className="h-4 w-4" />
										Pobierz
									</a>
								) : (
									<span className="text-sm text-mm-muted">—</span>
								)}
							</li>
						);
					})}
				</ul>
			</section>
		</div>
	);
}
