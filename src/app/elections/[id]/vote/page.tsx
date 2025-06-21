"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../../../../../components/ui/card";
import { Button } from "../../../../../components/ui/button";
import {
	RadioGroup,
	RadioGroupItem,
} from "../../../../../components/ui/radio-group";
import { Label } from "../../../../../components/ui/label";
import { getCandidatesByElection, castVote } from "../../../../../lib/actions";
import { Candidate } from "../../../../../lib/db";

export default function VotePage() {
	const params = useParams();
	const router = useRouter();
	const electionId = parseInt(params.id as string);
	const [candidates, setCandidates] = useState<Candidate[]>([]);
	const [selectedCandidate, setSelectedCandidate] = useState("");
	const [voterCNIC, setVoterCNIC] = useState("");
	const [loading, setLoading] = useState(true);
	const [voting, setVoting] = useState(false);
	const [message, setMessage] = useState("");

	useEffect(() => {
		async function fetchCandidates() {
			try {
				const candidatesData = await getCandidatesByElection(electionId);
				setCandidates(candidatesData);
			} catch (error) {
				console.error("Error fetching candidates:", error);
				setMessage("Error loading candidates");
			} finally {
				setLoading(false);
			}
		}

		if (electionId) {
			fetchCandidates();
		}
	}, [electionId]);
	const handleVote = async () => {
		if (!selectedCandidate) {
			setMessage("Please select a candidate");
			return;
		}

		if (!voterCNIC || voterCNIC.length !== 13) {
			setMessage("Please enter a valid 13-digit CNIC");
			return;
		}

		setVoting(true);
		try {
			const result = await castVote(
				electionId,
				parseInt(selectedCandidate),
				voterCNIC
			);

			if (result.success) {
				setMessage("Vote cast successfully!");
				setTimeout(() => {
					router.push("/elections");
				}, 2000);
			} else {
				setMessage(result.message);
			}
		} catch (error) {
			setMessage("Error casting vote");
		} finally {
			setVoting(false);
		}
	};

	if (loading) {
		return (
			<div className="container mx-auto px-4 py-12">
				<div className="flex justify-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-12 max-w-2xl">
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl">Cast Your Vote</CardTitle>
					<p className="text-gray-600">
						Select your preferred candidate for this election.
					</p>
				</CardHeader>{" "}
				<CardContent>
					{message && (
						<div
							className={`p-4 rounded mb-6 ${
								message.includes("success")
									? "bg-green-100 text-green-800"
									: "bg-red-100 text-red-800"
							}`}
						>
							{message}
						</div>
					)}
					{/* CNIC Input */}
					<div className="mb-6">
						<label
							htmlFor="voterCNIC"
							className="block text-sm font-medium mb-2"
						>
							Enter your CNIC (13 digits)
						</label>
						<input
							type="text"
							id="voterCNIC"
							value={voterCNIC}
							onChange={(e) => {
								const value = e.target.value.replace(/\D/g, "").slice(0, 13);
								setVoterCNIC(value);
							}}
							placeholder="1234567890123"
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							maxLength={13}
							required
						/>
						<p className="text-xs text-gray-500 mt-1">
							Your CNIC is required to prevent duplicate voting
						</p>
					</div>
					<RadioGroup
						value={selectedCandidate}
						onValueChange={setSelectedCandidate}
						className="space-y-4"
					>
						{" "}
						{candidates.map((candidate) => (
							<div
								key={candidate.CandidateID}
								className="flex items-start space-x-3"
							>
								<RadioGroupItem
									value={candidate.CandidateID.toString()}
									id={candidate.CandidateID.toString()}
									className="mt-1"
								/>
								<div className="flex-1">
									<Label
										htmlFor={candidate.CandidateID.toString()}
										className="cursor-pointer"
									>
										{" "}
										<div className="border rounded-lg p-4 hover:bg-gray-50">
											<h3 className="font-semibold text-lg">
												{candidate.CandidateName}
											</h3>
											<p className="text-blue-600 text-sm mb-2">
												{candidate.PartyName || "Independent"}
											</p>
											<p className="text-gray-600 text-sm">
												{candidate.ElectionSymbol || "No Symbol"} •{" "}
												{candidate.Constituency}, {candidate.Province}
											</p>
										</div>
									</Label>
								</div>
							</div>
						))}
					</RadioGroup>{" "}
					<div className="flex gap-4 mt-8">
						<Button
							onClick={handleVote}
							disabled={
								!selectedCandidate ||
								!voterCNIC ||
								voterCNIC.length !== 13 ||
								voting
							}
							className="flex-1"
						>
							{voting ? "Casting Vote..." : "Cast Vote"}
						</Button>
						<Button
							variant="outline"
							onClick={() => router.push("/elections")}
							className="flex-1"
						>
							Cancel
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
