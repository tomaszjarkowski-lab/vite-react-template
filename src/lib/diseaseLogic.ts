import type { AnalysisDetailPrediction } from "../types/api";

const CHOROBY_PRZEWLEKLE = new Set([
	"Eczema Nummularis",
	"Psoriasis",
	"Urticaria",
	"Seborrhoeic Dermatitis",
	"Rosacea",
	"Atopic Dermatitis",
	"Acne, Unspecified",
	"Lichen Ruber Planus",
	"Neurodermatitis (Lichen Simplex C",
	"Perioral Dermatitis",
	"Dyshidrotic Eczema",
	"Acne Vulgaris",
	"Postinflammatory Hyperpigmentation",
	"Acne Nodulocystica",
	"Pseudofolliculitis Barbae",
	"Keratosis Pilaris",
	"Granuloma Annulare",
	"Acne Comedonica (Comedonal Ac",
	"Vitiligo",
	"Lichen Sclerosus et Atrophicus",
	"Keloid",
	"Melasma (Cloasma)",
	"Prurigo Nodularis",
	"Eczema Hypostaticum",
	"Livedo Reticularis",
	"Pityriasis Alba",
	"Intertrigo",
]);

const CHOROBY_SZYBKIE = new Set([
	"Contact Dermatitis",
	"Tinea Corporis (Ringworm)",
	"Dermatitis, UNS",
	"Insect Bite",
	"Pityriasis Rosea",
	"Folliculitis",
	"Verruca Vulgaris / Wart(s)",
	"Tinea UNS",
	"Furuncle (Deep Folliculitis)",
	"Impetigo",
	"Pityriasis Versicolor",
	"Herpes Simplex",
	"Herpes Zoster",
	"Molluscum Contagiosum",
	"Genital Warts (Condyloma)",
	"Balanitis",
	"Genital Herpes",
	"Scabies",
	"Viral Exanthema",
	"Chilblains (pernio)",
]);

const BRAK_CHOROBY = new Set([
	"Dermal Nevus",
	"Seborrhoeic Keratosis",
	"Nevus (Benign Mole)",
	"Lentigo",
	"Dermatofibroma",
	"Angioma (Cherry angioma)",
	"Epidermal / Benign Cyst",
	"Sebaceous Glands (Fordyce Spot)",
	"Hematoma/Ecchymosis (Bruise)",
	"Scar",
	"Skin Tag",
	"Acne Scar(s)",
	"Pearly Penile Papules",
	"Milia",
]);

const STACJONARNA_WIZYTA = new Set([
	"Atypical Melanocytic Nevus",
	"Basal Cell Carcinoma",
	"Malignant Melanoma",
	"Actinic Keratosis",
	"Squamous Cell Carcinoma",
	"Petechia or Purpura",
	"Pyogenic Granuloma",
	"Abscess",
	"Borrelia",
	"Vasculitis",
	"Erysipelas",
	"Syphilis",
]);

const DISEASE_TRANSLATIONS: Record<string, string> = {
	"Eczema Nummularis": "Wyprysk Nummularny",
	Psoriasis: "Łuszczyca",
	Urticaria: "Pokrzywka",
	"Seborrhoeic Dermatitis": "Łojotokowe Zapalenie Skóry",
	Rosacea: "Trądzik Różowaty",
	"Atopic Dermatitis": "Atopowe Zapalenie Skóry",
	"Acne, Unspecified": "Trądzik",
	"Lichen Ruber Planus": "Liszaj Płaski",
	"Neurodermatitis (Lichen Simplex C": "Neurodermatitis",
	"Perioral Dermatitis": "Zapalenie Skóry Wokół Ust",
	"Dyshidrotic Eczema": "Wyprysk Dyshidrotyczny",
	"Acne Vulgaris": "Trądzik Pospolity",
	"Postinflammatory Hyperpigmentation": "Przebarwienia Pozapalne",
	"Acne Nodulocystica": "Trądzik Guzkowy",
	"Pseudofolliculitis Barbae": "Pseudofolikulitis",
	"Keratosis Pilaris": "Rogowacenie Mieszkowe",
	"Granuloma Annulare": "Ziarniniak Obrączkowy",
	"Acne Comedonica (Comedonal Ac": "Trądzik Zaskórnikowy",
	Vitiligo: "Bielactwo",
	"Lichen Sclerosus et Atrophicus": "Liszaj Twardzinowy",
	Keloid: "Bliznowiec",
	"Melasma (Cloasma)": "Ostuda",
	"Prurigo Nodularis": "Świąd Guzkowy",
	"Eczema Hypostaticum": "Wyprysk Zastoinowy",
	"Livedo Reticularis": "Livedo Reticularis",
	"Pityriasis Alba": "Łupież Biały",
	Intertrigo: "Wyprzenie",
	"Contact Dermatitis": "Kontaktowe Zapalenie Skóry",
	"Tinea Corporis (Ringworm)": "Grzybica Ciała",
	"Dermatitis, UNS": "Zapalenie Skóry",
	"Insect Bite": "Ukąszenie Owada",
	"Pityriasis Rosea": "Łupież Różowy",
	Folliculitis: "Zapalenie Mieszków Włosowych",
	"Verruca Vulgaris / Wart(s)": "Brodawki",
	"Tinea UNS": "Grzybica",
	"Furuncle (Deep Folliculitis)": "Czyrak",
	Impetigo: "Liszajec",
	"Pityriasis Versicolor": "Łupież Pstry",
	"Herpes Simplex": "Opryszczka Zwykła",
	"Herpes Zoster": "Półpasiec",
	"Molluscum Contagiosum": "Mięczak Zakaźny",
	"Genital Warts (Condyloma)": "Kłykciny Kończyste",
	Balanitis: "Zapalenie Żołędzi",
	"Genital Herpes": "Opryszczka Narządów Płciowych",
	Scabies: "Świerzb",
	"Viral Exanthema": "Osutka Wirusowa",
	"Chilblains (pernio)": "Odmroziny",
	"Dermal Nevus": "Znamię Skórne",
	"Seborrhoeic Keratosis": "Rogowacenie Łojotokowe",
	"Nevus (Benign Mole)": "Łagodne Znamię",
	Lentigo: "Plama Soczewicowata",
	Dermatofibroma: "Włókniak Skóry",
	"Angioma (Cherry angioma)": "Naczyniak",
	"Epidermal / Benign Cyst": "Torbiel Naskórkowa",
	"Sebaceous Glands (Fordyce Spot)": "Gruczoły Łojowe (Plamki Fordyce'a)",
	"Hematoma/Ecchymosis (Bruise)": "Krwiak / Siniak",
	Scar: "Blizna",
	"Skin Tag": "Włókniak Miękki",
	"Acne Scar(s)": "Blizny Potrądzikowe",
	"Pearly Penile Papules": "Grudki Perłowe Prącia",
	Milia: "Prosaki",
	"Atypical Melanocytic Nevus": "Atypowe Znamię Melanocytarne",
	"Basal Cell Carcinoma": "Rak Podstawnokomórkowy",
	"Malignant Melanoma": "Czerniak Złośliwy",
	"Actinic Keratosis": "Rogowacenie Słoneczne",
	"Squamous Cell Carcinoma": "Rak Płaskonabłonkowy",
	"Petechia or Purpura": "Wybroczyny / Plamica",
	"Pyogenic Granuloma": "Ziarniniak Ropotwórczy",
	Abscess: "Ropień",
	Borrelia: "Borelioza",
	Vasculitis: "Zapalenie Naczyń",
	Erysipelas: "Róża",
	Syphilis: "Kiła",
};

export function translateDisease(name: string): string {
	return DISEASE_TRANSLATIONS[name] ?? name;
}

export function getDisplayName(prediction: AnalysisDetailPrediction): string {
	if (prediction.Name) return prediction.Name;
	if (prediction.ClassificationName) {
		return translateDisease(prediction.ClassificationName);
	}
	return "Nieznana diagnoza";
}

export function getMeaningText(
	predictions: AnalysisDetailPrediction[],
): string {
	if (!predictions.length) {
		return "Zmiany skórne mogą reagować na leczenie, stres, kosmetyki i sezonowość. Wynik wymaga konsultacji medycznej.";
	}

	const top1 = predictions[0];
	const top1Name = top1.ClassificationName ?? top1.Name ?? "";
	const top3Names = predictions
		.slice(0, 3)
		.map((p) => p.ClassificationName ?? p.Name ?? "");

	const stacjonarnaInTop3 = top3Names.find((name) =>
		STACJONARNA_WIZYTA.has(name),
	);
	if (stacjonarnaInTop3) {
		return `${translateDisease(stacjonarnaInTop3)} wymaga weryfikacji na wizycie stacjonarnej.`;
	}

	if (CHOROBY_PRZEWLEKLE.has(top1Name)) {
		return `${getDisplayName(top1)} to choroba przewlekła – wymaga ciągłej kontroli i monitorowania skuteczności leczenia. Pojedyncza wizyta zwykle nie wystarcza. Leczenie może też wymagać leku na receptę.`;
	}

	const przewleklaInTop3 = top3Names.find((name) =>
		CHOROBY_PRZEWLEKLE.has(name),
	);
	if (przewleklaInTop3) {
		return `Jedno z trzech potencjalnych rozpoznań – ${translateDisease(przewleklaInTop3)} – to choroba przewlekła – wymaga ciągłej kontroli i monitorowania skuteczności leczenia. Pojedyncza wizyta zwykle nie wystarcza. Leczenie może też wymagać leku na receptę.`;
	}

	if (CHOROBY_SZYBKIE.has(top1Name)) {
		return `${getDisplayName(top1)} to choroba, która może wymagać kontroli i monitorowania skuteczności leczenia. Pojedyncza wizyta może nie wystarczać. Leczenie może też wymagać leku na receptę.`;
	}

	if (BRAK_CHOROBY.has(top1Name)) {
		return `${getDisplayName(top1)} najpewniej nie wymaga leczenia, ale może wymagać monitorowania zmiany w czasie.`;
	}

	return "Zmiany skórne mogą reagować na leczenie, stres, kosmetyki i sezonowość. Wynik wymaga konsultacji medycznej.";
}

export type SignalLevel = 0 | 1 | 2 | 3 | 4;

export function normalizeSignalLevel(
	prediction: AnalysisDetailPrediction,
): SignalLevel {
	const confidenceTypeNumber = Number(prediction.ConfidenceType);
	if (Number.isFinite(confidenceTypeNumber) && confidenceTypeNumber >= 0) {
		return Math.min(4, Math.floor(confidenceTypeNumber)) as SignalLevel;
	}

	const confidencePercentage = Number(prediction.ConfidenceWithAiModel);
	const value =
		Number.isFinite(confidencePercentage) && confidencePercentage <= 1
			? confidencePercentage * 100
			: confidencePercentage;

	if (Number.isFinite(value) && value >= 80) return 4;
	if (Number.isFinite(value) && value >= 60) return 3;
	if (Number.isFinite(value) && value >= 40) return 2;
	if (Number.isFinite(value) && value >= 20) return 1;
	return 0;
}

export function getConfidenceLabel(signalLevel: number): string {
	if (signalLevel >= 4) return "bardzo wysoka";
	if (signalLevel >= 3) return "wysoka";
	if (signalLevel >= 2) return "średnia";
	if (signalLevel >= 1) return "niska";
	return "bardzo niska";
}

export function getConfidenceBars(signalLevel: number): boolean[] {
	const activeBars = Math.max(1, Math.min(5, signalLevel + 1));
	return Array.from({ length: 5 }, (_, index) => index < activeBars);
}

export function sortPredictions(
	predictions: AnalysisDetailPrediction[],
): AnalysisDetailPrediction[] {
	return [...predictions].sort(
		(a, b) =>
			(Number(b.ConfidenceWithAiModel) || 0) -
			(Number(a.ConfidenceWithAiModel) || 0),
	);
}
