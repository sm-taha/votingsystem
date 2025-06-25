// Pakistani constituency definitions and utilities

export interface ConstituencyInfo {
	code: string;
	name: string;
	province: string;
	type: "National Assembly" | "Provincial Assembly";
}

// Sample Pakistani constituencies (subset for demo - would need complete list for production)
export const CONSTITUENCIES: ConstituencyInfo[] = [
	// National Assembly - Punjab
	{
		code: "NA-15",
		name: "Lahore-III",
		province: "Punjab",
		type: "National Assembly",
	},
	{
		code: "NA-125",
		name: "Lahore-VII",
		province: "Punjab",
		type: "National Assembly",
	},
	{
		code: "NA-132",
		name: "Kasur-I",
		province: "Punjab",
		type: "National Assembly",
	},
	{
		code: "NA-95",
		name: "Mianwali-I",
		province: "Punjab",
		type: "National Assembly",
	},
	{
		code: "NA-57",
		name: "Rawalpindi-II",
		province: "Punjab",
		type: "National Assembly",
	},

	// National Assembly - Sindh
	{
		code: "NA-213",
		name: "Larkana-I",
		province: "Sindh",
		type: "National Assembly",
	},
	{
		code: "NA-196",
		name: "Karachi Central-I",
		province: "Sindh",
		type: "National Assembly",
	},
	{
		code: "NA-206",
		name: "Shikarpur",
		province: "Sindh",
		type: "National Assembly",
	},

	// National Assembly - KPK
	{ code: "NA-38", name: "Kurram", province: "KPK", type: "National Assembly" },
	{
		code: "NA-7",
		name: "Peshawar-II",
		province: "KPK",
		type: "National Assembly",
	},

	// National Assembly - Balochistan
	{
		code: "NA-266",
		name: "Quetta-II",
		province: "Balochistan",
		type: "National Assembly",
	},

	// Provincial Assembly - Punjab (sample)
	{
		code: "PP-158",
		name: "Lahore-XIX",
		province: "Punjab",
		type: "Provincial Assembly",
	},
	{
		code: "PP-159",
		name: "Lahore-XX",
		province: "Punjab",
		type: "Provincial Assembly",
	},

	// Provincial Assembly - Sindh (sample)
	{
		code: "PS-95",
		name: "Karachi Central-I",
		province: "Sindh",
		type: "Provincial Assembly",
	},

	// Provincial Assembly - KPK (sample)
	{
		code: "PK-71",
		name: "Peshawar-VII",
		province: "KPK",
		type: "Provincial Assembly",
	},

	// Provincial Assembly - Balochistan (sample)
	{
		code: "PB-40",
		name: "Quetta-VII",
		province: "Balochistan",
		type: "Provincial Assembly",
	},
];

// Get constituencies by province
export function getConstituenciesByProvince(
	province: string
): ConstituencyInfo[] {
	return CONSTITUENCIES.filter((c) => c.province === province);
}

// Get constituency by code
export function getConstituencyByCode(
	code: string
): ConstituencyInfo | undefined {
	return CONSTITUENCIES.find((c) => c.code === code);
}

// Validate constituency code format
export function isValidConstituencyFormat(code: string): boolean {
	// Format: XX-000 where XX is NA/PP/PS/PK/PB and 000 is 1-3 digits
	const pattern = /^(NA|PP|PS|PK|PB)-\d{1,3}$/;
	return pattern.test(code.toUpperCase());
}

// Normalize constituency code format
export function normalizeConstituencyCode(code: string): string {
	return code.toUpperCase().trim();
}

// Check if constituency exists in our database
export function isValidConstituency(code: string): boolean {
	const normalized = normalizeConstituencyCode(code);
	return CONSTITUENCIES.some((c) => c.code === normalized);
}

// Get constituency suggestions based on input
export function getConstituencySuggestions(
	input: string,
	limit: number = 10
): ConstituencyInfo[] {
	if (!input) return CONSTITUENCIES.slice(0, limit);

	const normalized = input.toUpperCase();
	return CONSTITUENCIES.filter(
		(c) =>
			c.code.includes(normalized) || c.name.toUpperCase().includes(normalized)
	).slice(0, limit);
}

// Get all unique provinces
export function getProvinces(): string[] {
	return [...new Set(CONSTITUENCIES.map((c) => c.province))];
}

// Get constituency info with validation
export function validateAndGetConstituency(code: string): {
	isValid: boolean;
	constituency?: ConstituencyInfo;
	error?: string;
} {
	if (!code || !code.trim()) {
		return { isValid: false, error: "Constituency code is required" };
	}

	const normalized = normalizeConstituencyCode(code);

	if (!isValidConstituencyFormat(normalized)) {
		return {
			isValid: false,
			error:
				"Invalid format. Use format like NA-125, PP-158, PS-95, PK-71, or PB-40",
		};
	}

	const constituency = getConstituencyByCode(normalized);
	if (!constituency) {
		return {
			isValid: false,
			error: `Constituency ${normalized} not found. Please check the code.`,
		};
	}

	return { isValid: true, constituency };
}
