import Link from "next/link";

export default function Navbar() {
	return (
		<header className="border-b bg-white">
			<div className="container mx-auto px-4 py-4 flex items-center justify-between">
				<Link href="/" className="text-xl font-bold text-blue-600">
					VoteSystem
				</Link>{" "}
				<nav className="flex items-center space-x-6">
					<Link
						href="/"
						className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
					>
						Home
					</Link>
					<Link
						href="/elections"
						className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
					>
						Elections
					</Link>
					<Link
						href="/results"
						className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
					>
						Results
					</Link>
					<Link
						href="/admin"
						className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
					>
						Admin
					</Link>
				</nav>
			</div>
		</header>
	);
}
