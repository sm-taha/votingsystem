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
import { CalendarIcon, ClockIcon, UsersIcon, MapPinIcon } from "lucide-react";
import {
	getElectionById,
	getCandidatesByElection,
	getElectionResults,
} from "../../../../lib/actions";
import { Election, Candidate } from "../../../../lib/db";

interface ElectionWithStatus extends Election {
	computed_status: "upcoming" | "active" | "completed";
}

interface ElectionResult {
	CandidateID: number;
	CandidateName: string;
	PartyName: string | null;
	VoteCount: number;
}

export default function ElectionDetailsPage() {
	const params = useParams();
	const router = useRouter();
	const electionId = parseInt(params.id as string);

	const [election, setElection] = useState<ElectionWithStatus | null>(null);
	const [candidates, setCandidates] = useState<Candidate[]>([]);
	const [results, setResults] = useState<ElectionResult[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	// Consistent date formatting
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const formatDateShort = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	useEffect(() => {
		async function fetchElectionDetails() {
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

				// Fetch candidates
				const candidatesData = await getCandidatesByElection(electionId);
				setCandidates(candidatesData);

				// If election is completed, fetch results
				if (electionData.computed_status === "completed") {
					try {
						const resultsData = await getElectionResults(electionId);
						setResults(resultsData);
					} catch (err) {
						console.warn("Could not load results:", err);
					}
				}
			} catch (error) {
				console.error("Error fetching election details:", error);
				setError("Failed to load election details");
			} finally {
				setLoading(false);
			}
		}

		if (electionId) {
			fetchElectionDetails();
		}
	}, [electionId]);

	const getStatusColor = (status: string) => {
		switch (status) {
			case "active":
				return "bg-green-100 text-green-800";
			case "upcoming":
				return "bg-blue-100 text-blue-800";
			case "completed":
				return "bg-gray-100 text-gray-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const getStatusText = (status: string) => {
		return status.charAt(0).toUpperCase() + status.slice(1);
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
							The election you're looking for doesn't exist or couldn't be
							loaded.
						</p>
						<Button onClick={() => router.push("/elections")}>
							Back to Elections
						</Button>
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
					<Button variant="outline" onClick={() => router.push("/elections")}>
						← Back to Elections
					</Button>
					<Badge className={getStatusColor(election.computed_status)}>
						{getStatusText(election.computed_status)}
					</Badge>
				</div>
				<h1 className="text-3xl font-bold text-gray-900 mb-2">
					{election.ElectionName}
				</h1>
				<p className="text-gray-600">
					{election.ElectionType || "General Election"} •{" "}
					{election.ElectionYear}
				</p>
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				{/* Election Information */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<CalendarIcon className="h-5 w-5" />
							Election Information
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid gap-3">
							<div className="flex items-center gap-3">
								<CalendarIcon className="h-4 w-4 text-gray-500" />
								<div>
									<p className="text-sm font-medium text-gray-900">
										Election Date
									</p>
									<p className="text-sm text-gray-600">
										{formatDateShort(election.ElectionDate)}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-3">
								<ClockIcon className="h-4 w-4 text-gray-500" />
								<div>
									<p className="text-sm font-medium text-gray-900">
										Voting Period
									</p>
									<p className="text-sm text-gray-600">
										{formatDate(election.VotingStart)}
									</p>
									<p className="text-sm text-gray-600">
										to {formatDate(election.VotingEnd)}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-3">
								<UsersIcon className="h-4 w-4 text-gray-500" />
								<div>
									<p className="text-sm font-medium text-gray-900">
										Candidates
									</p>
									<p className="text-sm text-gray-600">
										{candidates.length} candidates registered
									</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Action Buttons */}
				<Card>
					<CardHeader>
						<CardTitle>Actions</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{election.computed_status === "active" && (
								<Button asChild className="w-full">
									<Link href={`/elections/${election.ElectionID}/vote`}>
										Cast Your Vote
									</Link>
								</Button>
							)}
							{election.computed_status === "completed" && (
								<Button asChild variant="outline" className="w-full">
									<Link href={`/results/${election.ElectionID}`}>
										View Results
									</Link>
								</Button>
							)}
							{election.computed_status === "upcoming" && (
								<div className="text-center py-4">
									<p className="text-sm text-gray-500">
										Voting will open on {formatDate(election.VotingStart)}
									</p>
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Candidates List */}
			<Card className="mt-6">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<UsersIcon className="h-5 w-5" />
						Candidates ({candidates.length})
					</CardTitle>
				</CardHeader>
				<CardContent>
					{candidates.length > 0 ? (
						<div className="grid gap-4 sm:grid-cols-2">
							{candidates.map((candidate) => (
								<div
									key={candidate.CandidateID}
									className="border rounded-lg p-4 hover:bg-gray-50"
								>
									<h3 className="font-semibold text-lg mb-1">
										{candidate.CandidateName}
									</h3>
									<p className="text-blue-600 text-sm mb-2">
										{candidate.PartyName || "Independent"}
									</p>
									<div className="flex items-center gap-2 text-sm text-gray-600">
										<MapPinIcon className="h-3 w-3" />
										<span>
											{candidate.Constituency}, {candidate.Province}
										</span>
									</div>
									{candidate.ElectionSymbol && (
										<p className="text-xs text-gray-500 mt-1">
											Symbol: {candidate.ElectionSymbol}
										</p>
									)}
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-6">
							<p className="text-gray-500">No candidates registered yet.</p>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Results Preview (for completed elections) */}
			{election.computed_status === "completed" && results.length > 0 && (
				<Card className="mt-6">
					<CardHeader>
						<CardTitle>Quick Results</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{results.slice(0, 3).map((result, index) => (
								<div
									key={result.CandidateID}
									className="flex justify-between items-center py-2 border-b last:border-b-0"
								>
									<div>
										<p className="font-medium">{result.CandidateName}</p>
										<p className="text-sm text-gray-600">
											{result.PartyName || "Independent"}
										</p>
									</div>
									<div className="text-right">
										<p className="font-semibold">{result.VoteCount} votes</p>
										<p className="text-sm text-gray-500">#{index + 1}</p>
									</div>
								</div>
							))}
							{results.length > 3 && (
								<div className="text-center pt-2">
									<Button asChild variant="outline" size="sm">
										<Link href={`/results/${election.ElectionID}`}>
											View Full Results
										</Link>
									</Button>
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
