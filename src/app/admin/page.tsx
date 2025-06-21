import CreateElectionForm from "@/components/create-election-form";
import { getElections } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function formatDate(dateString: string) {
	return new Date(dateString).toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function getStatusBadge(status: string) {
	const statusClasses = {
		upcoming: "bg-blue-100 text-blue-800",
		active: "bg-green-100 text-green-800",
		completed: "bg-gray-100 text-gray-800",
	};

	return (
		<span
			className={`px-2 py-1 rounded-full text-xs font-medium ${
				statusClasses[status as keyof typeof statusClasses]
			}`}
		>
			{status.charAt(0).toUpperCase() + status.slice(1)}
		</span>
	);
}

export default async function AdminPage() {
	const elections = await getElections();

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900 mb-2">
					Election Management
				</h1>
				<p className="text-gray-600">Create and manage elections</p>
			</div>

			{/* Create Election Form */}
			<div className="mb-12">
				<CreateElectionForm />
			</div>

			{/* Existing Elections */}
			<div>
				<h2 className="text-2xl font-bold text-gray-900 mb-6">
					Existing Elections
				</h2>

				{elections.length === 0 ? (
					<Card>
						<CardContent className="text-center py-8">
							<p className="text-gray-500">
								No elections found. Create your first election above!
							</p>
						</CardContent>
					</Card>
				) : (
					<div className="grid gap-6">
						{" "}
						{elections.map((election) => (
							<Card
								key={election.ElectionID}
								className="hover:shadow-lg transition-shadow"
							>
								<CardHeader>
									<div className="flex justify-between items-start">
										<div>
											<CardTitle className="text-xl mb-2">
												{election.ElectionName}
											</CardTitle>
											<p className="text-gray-600 mb-3">
												{election.ElectionType} - {election.ElectionYear}
											</p>
										</div>
										{getStatusBadge(election.Status)}
									</div>
								</CardHeader>{" "}
								<CardContent>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
										<div>
											<p className="text-sm text-gray-500">Start Date</p>
											<p className="font-medium">
												{formatDate(election.VotingStart)}
											</p>
										</div>
										<div>
											<p className="text-sm text-gray-500">End Date</p>
											<p className="font-medium">
												{formatDate(election.VotingEnd)}
											</p>
										</div>
									</div>{" "}
									<div className="flex gap-2">
										{election.computed_status === "active" && (
											<Link href={`/elections/${election.ElectionID}/vote`}>
												<Button size="sm">Vote Now</Button>
											</Link>
										)}
										{election.computed_status === "completed" && (
											<Link href={`/results`}>
												<Button variant="outline" size="sm">
													View Results
												</Button>
											</Link>
										)}
										<Link
											href={`/admin/elections/${election.ElectionID}/manage`}
										>
											<Button variant="outline" size="sm">
												Manage Candidates
											</Button>
										</Link>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
