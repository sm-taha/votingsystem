"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getCompletedElectionsWithResults } from "@/lib/actions";

interface ElectionResult {
	id: number;
	title: string;
	description: string;
	endDate: string;
	totalVotes: number;
	results: {
		candidate: string;
		votes: number;
		percentage: number;
	}[];
	winner: string;
}

export default function ResultsPage() {
	const [results, setResults] = useState<ElectionResult[]>([]);
	const [loading, setLoading] = useState(true);

	// Consistent date formatting to avoid hydration issues
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};
	useEffect(() => {
		async function fetchResults() {
			try {
				setLoading(true);
				const resultsData = await getCompletedElectionsWithResults();
				setResults(resultsData);
			} catch (error) {
				console.error("Error fetching results:", error);
				setResults([]);
			} finally {
				setLoading(false);
			}
		}

		fetchResults();
	}, []);

	const getBarWidth = (percentage: number) => {
		return `${percentage}%`;
	};

	return (
		<div className="container mx-auto px-4 py-12">
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900 mb-4">
					Election Results
				</h1>
				<p className="text-gray-600">
					View the results of completed elections and voting statistics.
				</p>
			</div>

			{loading ? (
				<div className="flex justify-center py-8">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
				</div>
			) : results.length > 0 ? (
				<div className="grid gap-6">
					{results.map((election) => (
						<Card key={election.id} className="w-full">
							<CardHeader>
								<CardTitle className="text-xl mb-2">{election.title}</CardTitle>
								<p className="text-gray-600 mb-4">
									{election.description}
								</p>{" "}
								<div className="flex flex-wrap gap-4 text-sm text-gray-500">
									<span>Ended: {formatDate(election.endDate)}</span>
									<span>Total Votes: {election.totalVotes}</span>
									<span className="text-green-600 font-medium">
										Winner: {election.winner}
									</span>
								</div>
							</CardHeader>

							<CardContent>
								<div className="space-y-4">
									<h4 className="font-medium text-gray-900 mb-3">
										Vote Distribution:
									</h4>
									{election.results.map((result, index) => (
										<div key={index} className="space-y-2">
											<div className="flex justify-between items-center">
												<span className="font-medium text-gray-900">
													{result.candidate}
												</span>
												<div className="text-sm text-gray-600">
													<span>
														{result.votes} votes ({result.percentage.toFixed(1)}
														%)
													</span>
												</div>
											</div>
											<div className="w-full bg-gray-200 rounded-full h-3">
												<div
													className={`h-3 rounded-full transition-all duration-500 ${
														result.candidate === election.winner
															? "bg-green-500"
															: "bg-blue-500"
													}`}
													style={{ width: getBarWidth(result.percentage) }}
												></div>
											</div>
										</div>
									))}
								</div>

								<div className="mt-6 pt-4 border-t">
									<Button variant="outline" asChild>
										<Link href={`/elections/${election.id}`}>
											View Election Details
										</Link>
									</Button>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			) : (
				<div className="text-center py-8">
					<p className="text-gray-500">No completed elections available yet.</p>
					<Button asChild className="mt-4">
						<Link href="/elections">View Active Elections</Link>
					</Button>
				</div>
			)}
		</div>
	);
}
