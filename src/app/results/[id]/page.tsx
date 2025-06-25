"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	TrophyIcon,
	UsersIcon,
	CalendarIcon,
	ArrowLeftIcon,
	BarChart3Icon,
} from "lucide-react";
import { getElectionById, getElectionResults } from "../../../../lib/actions";
import { Election } from "../../../../lib/db";

interface ElectionWithStatus extends Election {
	computed_status: "upcoming" | "active" | "completed";
}

interface ElectionResult {
	CandidateID: number;
	CandidateName: string;
	PartyName: string | null;
	VoteCount: number;
}

export default function ElectionResultsPage() {
	const params = useParams();
	const router = useRouter();
	const electionId = parseInt(params.id as string);

	const [election, setElection] = useState<ElectionWithStatus | null>(null);
	const [results, setResults] = useState<ElectionResult[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	// Format date consistently
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	useEffect(() => {
		async function fetchElectionResults() {
			try {
				setLoading(true);
				setError("");

				// Fetch election details
				const electionData = await getElectionById(electionId);
				if (!electionData) {
					setError("Election not found");
					return;
				}
				setElection(electionData as ElectionWithStatus);

				// Check if election is completed
				if (electionData.computed_status !== "completed") {
					setError("Results are only available for completed elections");
					return;
				}

				// Fetch results
				const resultsData = await getElectionResults(electionId);
				setResults(resultsData);
			} catch (error) {
				console.error("Error fetching election results:", error);
				setError("Failed to load election results");
			} finally {
				setLoading(false);
			}
		}

		if (electionId) {
			fetchElectionResults();
		}
	}, [electionId]);

	// Calculate total votes and percentages
	const totalVotes = results.reduce((sum, result) => sum + result.VoteCount, 0);

	const getPercentage = (voteCount: number) => {
		if (totalVotes === 0) return 0;
		return ((voteCount / totalVotes) * 100).toFixed(1);
	};

	const getWinnerBadge = (index: number) => {
		if (index === 0 && results[0]?.VoteCount > 0) {
			return (
				<Badge className="bg-yellow-100 text-yellow-800 ml-2">
					<TrophyIcon className="h-3 w-3 mr-1" />
					Winner
				</Badge>
			);
		}
		return null;
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

	if (error || !election) {
		return (
			<div className="container mx-auto px-4 py-12">
				<Card>
					<CardContent className="text-center py-8">
						<h2 className="text-xl font-semibold text-gray-900 mb-2">
							{error || "Election not found"}
						</h2>
						<p className="text-gray-600 mb-4">
							{error === "Results are only available for completed elections"
								? "This election is still ongoing or hasn't started yet."
								: "The election you're looking for doesn't exist or couldn't be loaded."}
						</p>
						<div className="flex gap-3 justify-center">
							<Button onClick={() => router.push("/elections")}>
								Back to Elections
							</Button>
							{election && (
								<Button
									variant="outline"
									onClick={() =>
										router.push(`/elections/${election.ElectionID}`)
									}
								>
									View Election Details
								</Button>
							)}
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-12 max-w-4xl">
			{/* Header */}
			<div className="mb-8">
				<div className="flex items-center gap-4 mb-4">
					<Button
						variant="outline"
						onClick={() => router.push(`/elections/${election.ElectionID}`)}
					>
						<ArrowLeftIcon className="h-4 w-4 mr-2" />
						Back to Election Details
					</Button>
					<Badge className="bg-gray-100 text-gray-800">
						<BarChart3Icon className="h-3 w-3 mr-1" />
						Final Results
					</Badge>
				</div>
				<h1 className="text-3xl font-bold text-gray-900 mb-2">
					{election.ElectionName} - Results
				</h1>
				<p className="text-gray-600">
					{election.ElectionType || "General Election"} •{" "}
					{election.ElectionYear}
				</p>
			</div>

			{/* Election Summary */}
			<Card className="mb-6">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<CalendarIcon className="h-5 w-5" />
						Election Summary
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-3">
						<div className="text-center">
							<p className="text-2xl font-bold text-blue-600">
								{results.length}
							</p>
							<p className="text-sm text-gray-600">Candidates</p>
						</div>
						<div className="text-center">
							<p className="text-2xl font-bold text-green-600">{totalVotes}</p>
							<p className="text-sm text-gray-600">Total Votes Cast</p>
						</div>
						<div className="text-center">
							<p className="text-2xl font-bold text-purple-600">
								{formatDate(election.VotingEnd)}
							</p>
							<p className="text-sm text-gray-600">Voting Ended</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Results */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<TrophyIcon className="h-5 w-5" />
						Final Results
					</CardTitle>
				</CardHeader>
				<CardContent>
					{results.length > 0 ? (
						<div className="space-y-4">
							{results.map((result, index) => (
								<div
									key={result.CandidateID}
									className={`border rounded-lg p-4 ${
										index === 0 && result.VoteCount > 0
											? "border-yellow-200 bg-yellow-50"
											: "border-gray-200"
									}`}
								>
									<div className="flex justify-between items-start">
										<div className="flex-1">
											<div className="flex items-center mb-2">
												<span className="text-xl font-bold text-gray-500 mr-3">
													#{index + 1}
												</span>
												<div>
													<h3 className="text-lg font-semibold text-gray-900">
														{result.CandidateName}
														{getWinnerBadge(index)}
													</h3>
													<p className="text-sm text-blue-600">
														{result.PartyName || "Independent"}
													</p>
												</div>
											</div>

											{/* Vote count and percentage bar */}
											<div className="mt-3">
												<div className="flex justify-between items-center mb-1">
													<span className="text-sm text-gray-600">
														Votes received
													</span>
													<span className="text-sm font-medium">
														{getPercentage(result.VoteCount)}%
													</span>
												</div>
												<div className="w-full bg-gray-200 rounded-full h-2 mb-2">
													<div
														className={`h-2 rounded-full ${
															index === 0 && result.VoteCount > 0
																? "bg-yellow-500"
																: "bg-blue-500"
														}`}
														style={{
															width: `${getPercentage(result.VoteCount)}%`,
														}}
													></div>
												</div>
											</div>
										</div>

										<div className="text-right ml-4">
											<p className="text-2xl font-bold text-gray-900">
												{result.VoteCount}
											</p>
											<p className="text-sm text-gray-500">votes</p>
										</div>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-8">
							<UsersIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
							<h3 className="text-lg font-medium text-gray-900 mb-2">
								No results available
							</h3>
							<p className="text-gray-500">
								No votes have been cast for this election yet.
							</p>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Actions */}
			<div className="mt-6 flex gap-3 justify-center">
				<Button variant="outline" onClick={() => router.push("/elections")}>
					View All Elections
				</Button>
				<Button
					variant="outline"
					onClick={() => router.push(`/elections/${election.ElectionID}`)}
				>
					Election Details
				</Button>
			</div>
		</div>
	);
}
