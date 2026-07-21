import {
	ClipboardList,
	FileText,
	Home,
	LogOut,
	Settings,
} from "lucide-react";
import type { ReactNode } from "react";
import { MedMetrixLogo } from "../MedMetrixLogo";

export type DashboardTab = "today" | "plan" | "documents";

type DashboardShellProps = {
	activeTab: DashboardTab;
	onTabChange: (tab: DashboardTab) => void;
	onLogout: () => void;
	children: ReactNode;
};

const NAV_ITEMS: {
	id: DashboardTab;
	label: string;
	icon: typeof Home;
}[] = [
	{ id: "today", label: "Dziś", icon: Home },
	{ id: "plan", label: "Mój plan", icon: ClipboardList },
	{ id: "documents", label: "Dokumenty", icon: FileText },
];

export function DashboardShell({
	activeTab,
	onTabChange,
	onLogout,
	children,
}: DashboardShellProps) {
	return (
		<div className="flex min-h-screen bg-mm-page text-mm-ink">
			<aside className="sticky top-0 hidden h-screen w-[232px] shrink-0 flex-col border-r border-mm-border bg-white px-4 py-5 md:flex">
				<div className="mb-8 px-1">
					<button
						type="button"
						onClick={() => onTabChange("today")}
						aria-label="Przejdź do Dziś"
						className="rounded-lg bg-white p-1 transition hover:opacity-90"
					>
						<MedMetrixLogo size="md" className="h-11" />
					</button>
				</div>

				<nav className="flex flex-1 flex-col gap-1">
					{NAV_ITEMS.map(({ id, label, icon: Icon }) => {
						const active = activeTab === id;
						return (
							<button
								key={id}
								type="button"
								onClick={() => onTabChange(id)}
								className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
									active
										? "bg-mm-teal-soft text-mm-teal-deep"
										: "text-mm-ink-soft hover:bg-slate-50"
								}`}
							>
								<Icon className="h-4 w-4" />
								{label}
							</button>
						);
					})}
				</nav>

				<div className="mt-auto space-y-1 border-t border-mm-border pt-4">
					<button
						type="button"
						className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-mm-ink-soft hover:bg-slate-50"
					>
						<Settings className="h-4 w-4" />
						Ustawienia
					</button>
					<button
						type="button"
						onClick={onLogout}
						className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-mm-ink-soft hover:bg-slate-50"
					>
						<LogOut className="h-4 w-4" />
						Wyloguj
					</button>
				</div>
			</aside>

			<div className="flex min-w-0 flex-1 flex-col">
				<header className="flex items-center gap-2 overflow-x-auto border-b border-mm-border bg-white px-4 py-3 md:hidden">
					<button
						type="button"
						onClick={() => onTabChange("today")}
						aria-label="Przejdź do Dziś"
						className="mr-1 rounded-lg bg-white p-0.5"
					>
						<MedMetrixLogo size="sm" className="h-8" />
					</button>
					{NAV_ITEMS.map(({ id, label }) => {
						const active = activeTab === id;
						return (
							<button
								key={id}
								type="button"
								onClick={() => onTabChange(id)}
								className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium ${
									active
										? "bg-mm-teal-soft text-mm-teal-deep"
										: "text-mm-ink-soft"
								}`}
							>
								{label}
							</button>
						);
					})}
					<button
						type="button"
						onClick={onLogout}
						className="ml-auto shrink-0 rounded-full px-3 py-1.5 text-sm font-medium text-mm-ink-soft"
					>
						Wyloguj
					</button>
				</header>

				<main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
			</div>
		</div>
	);
}
