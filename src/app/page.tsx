import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
	return (
		<div className="container mx-auto px-4 py-12">
			<div className="flex flex-col items-center text-center space-y-8">
				<h1 className="text-4xl font-bold tracking-tight">
					Online Voting System
				</h1>
				<p className="text-xl text-gray-600 max-w-2xl">
					Participate in democratic elections. View available elections, cast
					your vote, and see the results.
				</p>

				<div className="flex flex-col sm:flex-row gap-4 mt-8">
					<Button asChild size="lg">
						<Link href="/elections">View Elections</Link>
					</Button>
					<Button asChild variant="outline" size="lg">
						<Link href="/results">View Results</Link>
					</Button>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 w-full max-w-5xl">
					<Card className="p-6">
						<CardContent className="p-0 flex flex-col items-center space-y-4">
							<div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="text-blue-600"
								>
									<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
									<polyline points="15 3 21 3 21 9"></polyline>
									<line x1="10" y1="14" x2="21" y2="3"></line>
								</svg>
							</div>
							<h3 className="text-xl font-medium">Browse Elections</h3>
							<p className="text-gray-600 text-center">
								View all available elections and their current status.
							</p>
						</CardContent>
					</Card>

					<Card className="p-6">
						<CardContent className="p-0 flex flex-col items-center space-y-4">
							<div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="text-green-600"
								>
									<path d="M9 12l2 2 4-4"></path>
									<path d="M21 12c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z"></path>
									<path d="M3 12c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z"></path>
									<path d="M12 21c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z"></path>
									<path d="M12 3c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z"></path>
								</svg>
							</div>
							<h3 className="text-xl font-medium">Cast Your Vote</h3>
							<p className="text-gray-600 text-center">
								Participate in active elections by casting your vote securely.
							</p>
						</CardContent>
					</Card>

					<Card className="p-6">
						<CardContent className="p-0 flex flex-col items-center space-y-4">
							<div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="text-purple-600"
								>
									<path d="M3 3v18h18"></path>
									<path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"></path>
								</svg>
							</div>
							<h3 className="text-xl font-medium">View Results</h3>
							<p className="text-gray-600 text-center">
								Check the results of completed elections and vote statistics.
							</p>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
