type MedMetrixLogoProps = {
	className?: string;
	/** Visual size preset */
	size?: "sm" | "md" | "lg";
};

const SIZE_CLASS: Record<NonNullable<MedMetrixLogoProps["size"]>, string> = {
	sm: "h-8",
	md: "h-10",
	lg: "h-12",
};

export function MedMetrixLogo({
	className = "",
	size = "md",
}: MedMetrixLogoProps) {
	return (
		<img
			src="/medmetrix-logo.webp"
			alt="MedMetrix"
			className={`${SIZE_CLASS[size]} w-auto max-w-full object-contain ${className}`}
		/>
	);
}
