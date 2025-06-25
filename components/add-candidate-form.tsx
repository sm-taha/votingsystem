"use client";

import { useState } from "react";
import { addCandidate } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	getConstituencySuggestions,
	validateAndGetConstituency,
	normalizeConstituencyCode,
	type ConstituencyInfo,
} from "@/lib/constituencies";

interface AddCandidateFormProps {
	electionId: number;
	onSuccess?: () => void;
}

export default function AddCandidateForm({
	electionId,
	onSuccess,
}: AddCandidateFormProps) {
	const [formData, setFormData] = useState({
		candidateName: "",
		partyName: "",
		electionSymbol: "",
		constituency: "",
		province: "Punjab",
		candidateAge: 25,
	});
	const [isLoading, setIsLoading] = useState(false);
	const [message, setMessage] = useState("");
	const [constituencyError, setConstituencyError] = useState("");
	const [constituencySuggestions, setConstituencySuggestions] = useState<
		ConstituencyInfo[]
	>([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setMessage("");
		setConstituencyError("");

		// Validate constituency
		const constituencyValidation = validateAndGetConstituency(
			formData.constituency
		);
		if (!constituencyValidation.isValid) {
			setConstituencyError(
				constituencyValidation.error || "Invalid constituency"
			);
			setIsLoading(false);
			return;
		}

		// Normalize the constituency code
		const normalizedConstituency = normalizeConstituencyCode(
			formData.constituency
		);

		try {
			const result = await addCandidate(
				electionId,
				formData.candidateName,
				formData.partyName,
				formData.electionSymbol,
				normalizedConstituency,
				formData.province,
				formData.candidateAge
			);

			if (result.success) {
				setMessage("Candidate added successfully!");
				setFormData({
					candidateName: "",
					partyName: "",
					electionSymbol: "",
					constituency: "",
					province: "Punjab",
					candidateAge: 25,
				});
				onSuccess?.();
			} else {
				setMessage(result.message);
			}
		} catch (error) {
			console.error("Frontend error:", error);
			setMessage("Failed to add candidate");
		} finally {
			setIsLoading(false);
		}
	};
	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: name === "candidateAge" ? parseInt(value) : value,
		}));
	};

	const handleConstituencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setFormData((prev) => ({ ...prev, constituency: value }));
		setConstituencyError("");

		// Get suggestions
		const suggestions = getConstituencySuggestions(value, 5);
		setConstituencySuggestions(suggestions);
		setShowSuggestions(value.length > 0 && suggestions.length > 0);

		// If the user types a complete constituency code, validate it
		if (value.length >= 4) {
			const validation = validateAndGetConstituency(value);
			if (!validation.isValid && value.trim() !== "") {
				setConstituencyError(validation.error || "Invalid constituency");
			}
		}
	};

	const handleConstituencySuggestionClick = (
		constituency: ConstituencyInfo
	) => {
		setFormData((prev) => ({ ...prev, constituency: constituency.code }));
		setShowSuggestions(false);
		setConstituencyError("");
	};
	const politicalParties = [
		"PML-N",
		"PTI",
		"PPP",
		"JUI-F",
		"JI",
		"PKMAP",
		"MQM-P",
		"ANP",
		"BNP-M",
		"Independent",
	];

	const provinces = ["Punjab", "Sindh", "KPK", "Balochistan"];

	const electionSymbols = [
		"Tiger",
		"Arrow",
		"Bat",
		"Book",
		"Scale",
		"Kite",
		"Cricket Bat",
		"Lantern",
		"Eagle",
		"Rose",
		"Bicycle",
		"Chair",
	];

	return (
		<Card className="max-w-2xl mx-auto">
			<CardHeader>
				<CardTitle>Add Candidate</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-6">
					<div>
						<label
							htmlFor="candidateName"
							className="block text-sm font-medium mb-2"
						>
							Candidate Name
						</label>
						<input
							type="text"
							id="candidateName"
							name="candidateName"
							value={formData.candidateName}
							onChange={handleChange}
							required
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="Enter candidate's full name"
						/>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label
								htmlFor="partyName"
								className="block text-sm font-medium mb-2"
							>
								Political Party
							</label>
							<select
								id="partyName"
								name="partyName"
								value={formData.partyName}
								onChange={handleChange}
								required
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option value="">Select Party</option>
								{politicalParties.map((party) => (
									<option key={party} value={party}>
										{party}
									</option>
								))}
							</select>
						</div>

						<div>
							<label
								htmlFor="electionSymbol"
								className="block text-sm font-medium mb-2"
							>
								Election Symbol
							</label>
							<select
								id="electionSymbol"
								name="electionSymbol"
								value={formData.electionSymbol}
								onChange={handleChange}
								required
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option value="">Select Symbol</option>
								{electionSymbols.map((symbol) => (
									<option key={symbol} value={symbol}>
										{symbol}
									</option>
								))}
							</select>
						</div>
					</div>{" "}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="relative">
							<label
								htmlFor="constituency"
								className="block text-sm font-medium mb-2"
							>
								Constituency
							</label>
							<input
								type="text"
								id="constituency"
								name="constituency"
								value={formData.constituency}
								onChange={handleConstituencyChange}
								onFocus={() =>
									setShowSuggestions(constituencySuggestions.length > 0)
								}
								onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
								required
								className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
									constituencyError ? "border-red-500" : "border-gray-300"
								}`}
								placeholder="e.g., NA-125, PP-158"
							/>
							{constituencyError && (
								<p className="text-red-500 text-sm mt-1">{constituencyError}</p>
							)}
							{!constituencyError && formData.constituency === "" && (
								<p className="text-gray-500 text-sm mt-1">
									Format: NA-125 (National), PP-158 (Punjab), PS-95 (Sindh),
									PK-71 (KPK), PB-40 (Balochistan)
								</p>
							)}

							{/* Constituency Suggestions Dropdown */}
							{showSuggestions && constituencySuggestions.length > 0 && (
								<div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
									{constituencySuggestions.map((constituency) => (
										<div
											key={constituency.code}
											className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
											onClick={() =>
												handleConstituencySuggestionClick(constituency)
											}
										>
											<div className="font-medium">{constituency.code}</div>
											<div className="text-sm text-gray-600">
												{constituency.name} • {constituency.province}
											</div>
										</div>
									))}
								</div>
							)}
						</div>

						<div>
							<label
								htmlFor="province"
								className="block text-sm font-medium mb-2"
							>
								Province
							</label>
							<select
								id="province"
								name="province"
								value={formData.province}
								onChange={handleChange}
								required
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								{provinces.map((province) => (
									<option key={province} value={province}>
										{province}
									</option>
								))}
							</select>
						</div>
					</div>
					<div>
						<label
							htmlFor="candidateAge"
							className="block text-sm font-medium mb-2"
						>
							Candidate Age
						</label>
						<input
							type="number"
							id="candidateAge"
							name="candidateAge"
							value={formData.candidateAge}
							onChange={handleChange}
							required
							min="25"
							max="100"
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
					{message && (
						<div
							className={`p-4 rounded-md ${
								message.includes("success")
									? "bg-green-50 text-green-700 border border-green-200"
									: "bg-red-50 text-red-700 border border-red-200"
							}`}
						>
							{message}
						</div>
					)}
					<Button
						type="submit"
						disabled={isLoading}
						className="w-full bg-green-600 hover:bg-green-700 text-white"
					>
						{isLoading ? "Adding Candidate..." : "Add Candidate"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
