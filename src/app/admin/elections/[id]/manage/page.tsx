import { getCandidatesByElection } from "@/lib/actions";
import AddCandidateForm from "@/components/add-candidate-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Props {
	params: {
		id: string;
	};
}

export default async function ManageElectionPage({ params }: Props) {
	const electionId = parseInt(params.id);
	const candidates = await getCandidatesByElection(electionId);

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-8">
				<Link href="/admin">
					<Button variant="outline" className="mb-4">
						← Back to Admin
					</Button>
				</Link>
				<h1 className="text-3xl font-bold text-gray-900 mb-2">
					Manage Election Candidates
				</h1>
				<p className="text-gray-600">
					Add and manage candidates for this election
				</p>
			</div>

			{/* Add Candidate Form */}
			<div className="mb-12">
				<AddCandidateForm electionId={electionId} />
			</div>

			{/* Existing Candidates */}
			<div>
				<h2 className="text-2xl font-bold text-gray-900 mb-6">
					Current Candidates
				</h2>

				{candidates.length === 0 ? (
					<Card>
						<CardContent className="text-center py-8">
							<p className="text-gray-500">
								No candidates added yet. Add the first candidate above!
							</p>
						</CardContent>
					</Card>
				) : (
					<div className="grid gap-4">
						{candidates.map((candidate) => (
							<Card
								key={candidate.CandidateID}
								className="hover:shadow-md transition-shadow"
							>
								<CardHeader>
									<div className="flex justify-between items-start">
										<div>
											<CardTitle className="text-lg">
												{candidate.CandidateName}
											</CardTitle>
											<p className="text-blue-600 font-medium">
												{candidate.PartyName}
											</p>
											<p className="text-sm text-gray-500">
												Symbol: {candidate.ElectionSymbol}
											</p>
										</div>
									</div>
								</CardHeader>
								<CardContent>
									<div className="space-y-2">
										<p className="text-gray-600 text-sm">
											<span className="font-medium">Constituency:</span>{" "}
											{candidate.Constituency}
										</p>
										<p className="text-gray-600 text-sm">
											<span className="font-medium">Province:</span>{" "}
											{candidate.Province}
										</p>
										<p className="text-gray-600 text-sm">
											<span className="font-medium">Age:</span>{" "}
											{candidate.CandidateAge}
										</p>
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
