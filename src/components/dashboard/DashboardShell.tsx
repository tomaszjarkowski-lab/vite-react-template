import {
	ClipboardList,
	FileText,
	Home,
	LogOut,
	Settings,
} from "lucide-react";
import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import type {
	AnalysisResult,
	DoctorOpinion,
	Purchase,
} from "../../types/api";
import { MedMetrixLogo } from "../MedMetrixLogo";
import { AnalysisSwitcher } from "./AnalysisSwitcher";

type DashboardShellProps = {
	onLogout: () => void;
	analyses: AnalysisResult[];
	selectedAnalysisId: string | null;
	onSelectAnalysis: (id: string) => void;
	purchases: Purchase[];
	opinions: DoctorOpinion[];
	children: ReactNode;
};

const NAV_ITEMS: {
	to: string;
	end?: boolean;
	label: string;
	icon: typeof Home;
}[] = [
	{ to: "/dashboard", end: true, label: "Dziś", icon: Home },
	{ to: "/dashboard/plan", label: "Mój plan", icon: ClipboardList },
	{ to: "/dashboard/dokumenty", label: "Dokumenty", icon: FileText },
];

const navClassName = ({ isActive }: { isActive: boolean }) =>
	`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium no-underline transition ${
		isActive
			? "bg-mm-teal-soft text-mm-teal-deep"
			: "text-mm-ink-soft hover:bg-slate-50"
	}`;

const mobileNavClassName = ({ isActive }: { isActive: boolean }) =>
	`shrink-0 cursor-pointer rounded-full px-3 py-1.5 text-sm font-medium no-underline ${
		isActive ? "bg-mm-teal-soft text-mm-teal-deep" : "text-mm-ink-soft"
	}`;

export function DashboardShell({
	onLogout,
	analyses,
	selectedAnalysisId,
	onSelectAnalysis,
	purchases,
	opinions,
	children,
}: DashboardShellProps) {
	return (
		<div className="flex min-h-screen bg-mm-page text-mm-ink">
			<aside className="sticky top-0 hidden h-screen w-[250px] shrink-0 flex-col border-r border-mm-border bg-white px-4 py-5 md:flex">
				<div className="mb-4 px-1">
					<Link
						to="/dashboard"
						aria-label="Przejdź do Dziś"
						className="inline-flex cursor-pointer rounded-lg bg-white p-1 transition hover:opacity-90"
					>
						<MedMetrixLogo size="md" className="h-11" />
					</Link>
				</div>

				<div className="mb-6 px-1">
					<AnalysisSwitcher
						analyses={analyses}
						selectedId={selectedAnalysisId}
						onSelect={onSelectAnalysis}
						purchases={purchases}
						opinions={opinions}
					/>
				</div>

				<nav className="flex flex-1 flex-col gap-1">
					{NAV_ITEMS.map(({ to, end, label, icon: Icon }) => (
						<NavLink
							key={to}
							to={to}
							end={end}
							className={navClassName}
						>
							<Icon className="h-4 w-4" />
							{label}
						</NavLink>
					))}
				</nav>

				<div className="mt-auto space-y-1 border-t border-mm-border pt-4">
					<button
						type="button"
						className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-mm-ink-soft hover:bg-slate-50"
					>
						<Settings className="h-4 w-4" />
						Ustawienia
					</button>
					<button
						type="button"
						onClick={onLogout}
						className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-mm-ink-soft hover:bg-slate-50"
					>
						<LogOut className="h-4 w-4" />
						Wyloguj
					</button>
				</div>
			</aside>

			<div className="flex min-w-0 flex-1 flex-col">
				<header className="space-y-3 border-b border-mm-border bg-white px-4 py-3 md:hidden">
					<div className="flex items-center gap-2 overflow-x-auto">
						<Link
							to="/dashboard"
							aria-label="Przejdź do Dziś"
							className="mr-1 inline-flex cursor-pointer rounded-lg bg-white p-0.5"
						>
							<MedMetrixLogo size="sm" className="h-8" />
						</Link>
						{NAV_ITEMS.map(({ to, end, label }) => (
							<NavLink
								key={to}
								to={to}
								end={end}
								className={mobileNavClassName}
							>
								{label}
							</NavLink>
						))}
						<button
							type="button"
							onClick={onLogout}
							className="ml-auto shrink-0 cursor-pointer rounded-full px-3 py-1.5 text-sm font-medium text-mm-ink-soft"
						>
							Wyloguj
						</button>
					</div>
					<AnalysisSwitcher
						analyses={analyses}
						selectedId={selectedAnalysisId}
						onSelect={onSelectAnalysis}
						purchases={purchases}
						opinions={opinions}
						compact
					/>
				</header>

				<main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
			</div>
		</div>
	);
}
