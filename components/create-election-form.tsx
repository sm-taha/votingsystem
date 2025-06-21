"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createElection } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CreateElectionForm() {
	const router = useRouter();
	const [formData, setFormData] = useState({
		electionName: "",
		electionType: "General Election",
		electionDate: "",
		electionYear: new Date().getFullYear(),
		votingStart: "",
		votingEnd: "",
	});
	const [isLoading, setIsLoading] = useState(false);
	const [message, setMessage] = useState("");
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setMessage("");

		console.log("Form submitted with data:", formData);

		try {
			console.log("Calling createElection with:", {
				electionName: formData.electionName,
				electionType: formData.electionType,
				electionDate: formData.electionDate,
				electionYear: formData.electionYear,
				votingStart: formData.votingStart,
				votingEnd: formData.votingEnd,
			});

			const result = await createElection(
				formData.electionName,
				formData.electionType,
				formData.electionDate,
				formData.electionYear,
				formData.votingStart,
				formData.votingEnd
			);

			console.log("Result from createElection:", result);
			if (result.success) {
				setMessage(
					"Election created successfully! Redirecting to elections page..."
				);
				setFormData({
					electionName: "",
					electionType: "General Election",
					electionDate: "",
					electionYear: new Date().getFullYear(),
					votingStart: "",
					votingEnd: "",
				});

				// Redirect to elections page after 2 seconds
				setTimeout(() => {
					router.push("/elections");
					router.refresh(); // Force a refresh of the elections page
				}, 2000);
			} else {
				setMessage(result.message);
			}
		} catch (error) {
			console.error("Frontend error:", error);
			setMessage("Failed to create election");
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
			[name]: name === "electionYear" ? parseInt(value) : value,
		}));
	};

	return (
		<Card className="max-w-2xl mx-auto">
			<CardHeader>
				<CardTitle>Create New Election</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-6">
					<div>
						<label
							htmlFor="electionName"
							className="block text-sm font-medium mb-2"
						>
							Election Name
						</label>
						<input
							type="text"
							id="electionName"
							name="electionName"
							value={formData.electionName}
							onChange={handleChange}
							required
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="e.g., Online General Election 2025"
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label
								htmlFor="electionType"
								className="block text-sm font-medium mb-2"
							>
								Election Type
							</label>
							<select
								id="electionType"
								name="electionType"
								value={formData.electionType}
								onChange={handleChange}
								required
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option value="General Election">General Election</option>
								<option value="By Election">By Election</option>
								<option value="Provincial Election">Provincial Election</option>
								<option value="Local Election">Local Election</option>
							</select>
						</div>

						<div>
							<label
								htmlFor="electionYear"
								className="block text-sm font-medium mb-2"
							>
								Election Year
							</label>
							<input
								type="number"
								id="electionYear"
								name="electionYear"
								value={formData.electionYear}
								onChange={handleChange}
								required
								min="2020"
								max="2030"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>
					</div>

					<div>
						<label
							htmlFor="electionDate"
							className="block text-sm font-medium mb-2"
						>
							Election Date
						</label>
						<input
							type="date"
							id="electionDate"
							name="electionDate"
							value={formData.electionDate}
							onChange={handleChange}
							required
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label
								htmlFor="votingStart"
								className="block text-sm font-medium mb-2"
							>
								Voting Start Date & Time
							</label>
							<input
								type="datetime-local"
								id="votingStart"
								name="votingStart"
								value={formData.votingStart}
								onChange={handleChange}
								required
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>

						<div>
							<label
								htmlFor="votingEnd"
								className="block text-sm font-medium mb-2"
							>
								Voting End Date & Time
							</label>
							<input
								type="datetime-local"
								id="votingEnd"
								name="votingEnd"
								value={formData.votingEnd}
								onChange={handleChange}
								required
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>
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
						{isLoading ? "Creating Election..." : "Create Election"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
