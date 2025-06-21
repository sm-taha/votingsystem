"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getElections, getCandidatesByElection } from "@/lib/actions";
import { Election as DBElection } from "@/lib/db";

interface Election extends DBElection {
	computed_status: "upcoming" | "active" | "completed";
	candidates: string[];
}

export default function ElectionsPage() {
	const [elections, setElections] = useState<Election[]>([]);
	const [loading, setLoading] = useState(true);

	// Consistent date formatting to avoid hydration issues
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};
	const refreshElections = async () => {
		setLoading(true);
		try {
			const electionsData = await getElections();
			const electionsWithCandidates = await Promise.all(
				electionsData.map(async (election) => {
					const candidates = await getCandidatesByElection(election.ElectionID);
					return {
						ElectionID: election.ElectionID,
						ElectionName: election.ElectionName,
						ElectionType: election.ElectionType,
						ElectionDate: election.ElectionDate,
						ElectionYear: election.ElectionYear,
						Status: election.Status,
						VotingStart: election.VotingStart,
						VotingEnd: election.VotingEnd,
						computed_status: election.computed_status,
						candidates: candidates.map((c) => c.CandidateName),
					};
				})
			);
			setElections(electionsWithCandidates);
		} catch (error) {
			console.error("Error refreshing elections:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		async function fetchElections() {
			try {
				setLoading(true);
				const electionsData = await getElections();

				// Fetch candidates for each election
				const electionsWithCandidates = await Promise.all(
					electionsData.map(async (election) => {
						const candidates = await getCandidatesByElection(
							election.ElectionID
						);
						return {
							ElectionID: election.ElectionID,
							ElectionName: election.ElectionName,
							ElectionType: election.ElectionType,
							ElectionDate: election.ElectionDate,
							ElectionYear: election.ElectionYear,
							Status: election.Status,
							VotingStart: election.VotingStart,
							VotingEnd: election.VotingEnd,
							computed_status: election.computed_status,
							candidates: candidates.map((c) => c.CandidateName),
						};
					})
				);

				setElections(electionsWithCandidates);
			} catch (error) {
				console.error("Error fetching elections:", error);
				// Fallback to empty array or show error message
				setElections([]);
			} finally {
				setLoading(false);
			}
		}

		fetchElections();
	}, []);

	const getStatusColor = (status: string) => {
		switch (status) {
			case "active":
				return "text-green-600";
			case "upcoming":
				return "text-blue-600";
			case "completed":
				return "text-gray-600";
			default:
				return "text-gray-600";
		}
	};

	const getStatusBadge = (status: string) => {
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
	return (
		<div className="container mx-auto px-4 py-12">
			{" "}
			<div className="mb-8">
				<div className="flex justify-between items-center mb-4">
					<h1 className="text-3xl font-bold text-gray-900">Elections</h1>
					<div className="flex gap-2">
						<Button
							onClick={refreshElections}
							variant="outline"
							disabled={loading}
						>
							{loading ? "Refreshing..." : "Refresh"}
						</Button>
						<Link href="/admin">
							<Button>Create Election</Button>
						</Link>
					</div>
				</div>
				<p className="text-gray-600">
					View all available elections, their status, and participate in active
					voting.
				</p>
			</div>
			{loading ? (
				<div className="flex justify-center py-8">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
				</div>
			) : elections.length > 0 ? (
				<div className="grid gap-6">
					{elections.map((election) => (
						<Card key={election.ElectionID} className="w-full">
							<CardHeader>
								<div className="flex justify-between items-start">
									<div className="flex-1">
										{" "}
										<CardTitle className="text-xl mb-2">
											{election.ElectionName}
										</CardTitle>{" "}
										<p className="text-gray-600 mb-4">
											{election.ElectionType || "General Election"} -{" "}
											{election.ElectionYear}
										</p>
										<div className="flex flex-wrap gap-4 text-sm text-gray-500">
											<span>Start: {formatDate(election.VotingStart)}</span>
											<span>End: {formatDate(election.VotingEnd)}</span>
											<span>Candidates: {election.candidates.length}</span>
										</div>
									</div>{" "}
									<span
										className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
											election.computed_status
										)}`}
									>
										{getStatusText(election.computed_status)}
									</span>
								</div>
							</CardHeader>

							<CardContent>
								<div className="flex flex-wrap gap-2 mb-4">
									<span className="text-sm font-medium text-gray-700">
										Candidates:
									</span>
									{election.candidates.map((candidate, index) => (
										<span
											key={index}
											className="px-2 py-1 bg-gray-100 rounded text-sm"
										>
											{candidate}
										</span>
									))}
								</div>{" "}
								<div className="flex gap-3">
									{election.computed_status === "active" && (
										<Button asChild>
											<Link href={`/elections/${election.ElectionID}/vote`}>
												Vote Now
											</Link>
										</Button>
									)}
									<Button variant="outline" asChild>
										<Link href={`/elections/${election.ElectionID}`}>
											View Details
										</Link>
									</Button>
									{election.computed_status === "completed" && (
										<Button variant="outline" asChild>
											<Link href={`/results/${election.ElectionID}`}>
												View Results
											</Link>
										</Button>
									)}
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			) : (
				<div className="text-center py-8">
					<p className="text-gray-500">No elections available at the moment.</p>
					<p className="text-sm text-gray-400 mt-2">
						Please check back later or contact the administrator.
					</p>
				</div>
			)}
		</div>
	);
}
