import { Check, Clock, CreditCard, Lock, Stethoscope } from "lucide-react";
import type { DoctorOpinion, Purchase } from "../../types/api";

type PlanViewProps = {
	purchases: Purchase[];
	opinions: DoctorOpinion[];
	loading: boolean;
	error: string | null;
};

function formatAmount(amount: string, currency: string): string {
	const value = Number(amount);
	if (!Number.isFinite(value)) return `${amount} ${currency}`;
	return `${value.toFixed(2)} ${currency}`;
}

function formatDate(iso: string): string {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return iso;
	return date.toLocaleDateString("pl-PL", {
		day: "numeric",
		month: "long",
		year: "numeric",
	});
}

function opinionStatus(opinion: DoctorOpinion): {
	title: string;
	subtitle: string;
	done: boolean;
} {
	if (opinion.isDoctorOpinionSubmitted) {
		return {
			title: "Opinia lekarza gotowa",
			subtitle: "Lekarz zweryfikował wynik AI",
			done: true,
		};
	}
	if (opinion.requiresDoctorOpinion) {
		return {
			title: "Opinia lekarza w przygotowaniu",
			subtitle: "Pojawi się w ciągu 24 godzin",
			done: false,
		};
	}
	return {
		title: "Opinia lekarza",
		subtitle: "Odblokuj w Planie opieki ciągłej",
		done: false,
	};
}

export function PlanView({
	purchases,
	opinions,
	loading,
	error,
}: PlanViewProps) {
	const hasSubscription = purchases.some((p) => p.isSubscriptionPurchased);
	const pendingOpinion = opinions.find(
		(o) => o.requiresDoctorOpinion && !o.isDoctorOpinionSubmitted,
	);
	const readyOpinion = opinions.find((o) => o.isDoctorOpinionSubmitted);

	if (loading && purchases.length === 0 && opinions.length === 0) {
		return (
			<div className="mx-auto w-full max-w-3xl space-y-4">
				<div className="h-8 w-40 animate-pulse rounded-lg bg-slate-200" />
				<div className="h-48 animate-pulse rounded-3xl bg-slate-200" />
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
				Mój plan
			</h1>

			<section className="rounded-3xl border border-[#e8c9a8] bg-[#fff8f1] p-5">
				<p className="text-xs font-bold uppercase tracking-wide text-mm-orange">
					Co oznacza Twój wynik analizy AI
				</p>
				<p className="mt-2 text-sm leading-relaxed text-mm-ink-soft">
					Wynik AI to wstępna ocena zmian skórnych. Pomaga uporządkować
					kolejne kroki, ale ostateczne rozpoznanie i decyzję o leczeniu
					zawsze podejmuje lekarz.
				</p>
			</section>

			{readyOpinion && (
				<section className="flex gap-3 rounded-xl border-2 border-[#10b9818c] bg-[#F3FBF8] p-4">
					<span className="flex h-8 w-8 items-center justify-center rounded-full border border-green-400 bg-white">
						<Check className="h-4 w-4 text-green-500" />
					</span>
					<div>
						<h3 className="font-medium text-green-600">
							Opinia lekarza gotowa
						</h3>
						<p className="mt-1 text-sm text-mm-ink-soft">
							Twoja opinia lekarza jest dostępna w historii poniżej.
						</p>
					</div>
				</section>
			)}

			{pendingOpinion && !readyOpinion && (
				<section className="flex gap-3 rounded-xl border-2 border-[#34bbbd8c] bg-[#ECF9F8] p-4">
					<span className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
						<Clock className="h-4 w-4 text-mm-teal" />
					</span>
					<div>
						<h3 className="font-medium text-mm-teal">
							Opinia lekarza w przygotowaniu
						</h3>
						<p className="mt-1 text-sm text-mm-ink-soft">
							Powiadomimy Cię, gdy tylko będzie gotowa.
						</p>
					</div>
				</section>
			)}

			<section className="rounded-3xl border border-mm-teal bg-white p-5">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-start">
					<span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-mm-teal-soft">
						<Stethoscope className="h-5 w-5 text-mm-teal" />
					</span>
					<div className="flex-1">
						<h2 className="text-lg font-semibold text-mm-ink">
							Wizyta lekarska, aby uzyskać rozpoznanie postawione przez
							lekarza
						</h2>
						<p className="mt-2 text-sm text-mm-ink-soft">
							My poprowadzimy Cię przez leczenie. Otrzymasz plan opieki i
							stały kontakt z zespołem MedMetrix.
						</p>
						{hasSubscription ? (
							<p className="mt-4 inline-flex rounded-xl bg-mm-teal-soft px-4 py-2 text-sm font-semibold text-mm-teal-deep">
								Plan opieki ciągłej aktywny
							</p>
						) : (
							<p className="mt-4 inline-flex rounded-xl bg-mm-teal px-4 py-2.5 text-sm font-semibold text-white">
								Zamów plan opieki
							</p>
						)}
					</div>
				</div>
			</section>

			<section>
				<p className="mb-3 text-xs font-bold uppercase tracking-wide text-mm-teal">
					Co znajdziesz w pełnym planie opieki
				</p>
				<div className="space-y-2">
					{[
						"Twoje leczenie w skrócie",
						"Codzienna rutyna",
						"Kontrola skuteczności",
						"Stały kontakt z lekarzem",
					].map((title) => (
						<div
							key={title}
							className="flex items-center gap-3 rounded-2xl border border-mm-border bg-white px-4 py-3"
						>
							<Lock className="h-4 w-4 text-mm-muted" />
							<span className="flex-1 text-sm font-medium text-mm-ink">
								{title}
							</span>
							<span className="text-[10px] font-bold uppercase tracking-wide text-mm-muted">
								Dostępne po zakupie
							</span>
						</div>
					))}
				</div>
			</section>

			<section className="rounded-3xl border border-mm-border bg-white p-5 shadow-sm">
				<h2 className="text-lg font-semibold text-mm-ink">Moje płatności</h2>
				{purchases.length === 0 ? (
					<p className="mt-3 text-sm text-mm-muted">Brak płatności</p>
				) : (
					<ul className="mt-4 space-y-2">
						{purchases.map((purchase) => (
							<li
								key={purchase.id}
								className="flex items-center gap-3 rounded-2xl border border-mm-border px-4 py-3"
							>
								<span className="flex h-10 w-10 items-center justify-center rounded-xl bg-mm-teal-soft">
									<CreditCard className="h-4 w-4 text-mm-teal" />
								</span>
								<div className="min-w-0 flex-1">
									<p className="truncate text-sm font-semibold text-mm-ink">
										{formatAmount(purchase.amount, purchase.currency)} ·{" "}
										{purchase.paymentStatus}
									</p>
									<p className="text-xs text-mm-muted">
										{formatDate(purchase.purchaseCreationTime)}
										{purchase.receiptNumber
											? ` · Paragon ${purchase.receiptNumber}`
											: ""}
										{purchase.isSubscriptionPurchased
											? " · Subskrypcja"
											: ""}
									</p>
								</div>
							</li>
						))}
					</ul>
				)}
			</section>

			<section className="rounded-3xl border border-mm-border bg-white p-5 shadow-sm">
				<h2 className="text-lg font-semibold text-mm-ink">Opinie lekarza</h2>
				{opinions.length === 0 ? (
					<p className="mt-3 text-sm text-mm-muted">Brak opinii lekarza</p>
				) : (
					<ul className="mt-4 space-y-2">
						{opinions.map((opinion) => {
							const status = opinionStatus(opinion);
							return (
								<li
									key={opinion.id}
									className="flex items-center gap-3 rounded-2xl border border-mm-border px-4 py-3"
								>
									<span
										className={`flex h-10 w-10 items-center justify-center rounded-xl ${
											status.done ? "bg-mm-teal-soft" : "bg-yellow-50"
										}`}
									>
										{status.done ? (
											<Check className="h-4 w-4 text-mm-teal" />
										) : (
											<Clock className="h-4 w-4 text-yellow-500" />
										)}
									</span>
									<div className="min-w-0 flex-1">
										<p className="text-sm font-semibold text-mm-ink">
											{status.title}
										</p>
										<p className="text-xs text-mm-muted">
											{status.subtitle}
										</p>
									</div>
								</li>
							);
						})}
					</ul>
				)}
			</section>
		</div>
	);
}
