import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const serverName = process.env.DB_SERVER || "DESKTOP-FQAMMPA";
const databaseName = process.env.DB_NAME || "OnlineVotingSystem";

export async function executeQuery(
	query: string,
	params: any[] = []
): Promise<any> {
	try {
		// Replace ? placeholders with actual parameter values
		let processedQuery = query;
		params.forEach((param, index) => {
			let paramValue;
			if (typeof param === "string") {
				paramValue = `'${param.replace(/'/g, "''")}'`;
			} else if (param instanceof Date) {
				paramValue = `'${param.toISOString()}'`;
			} else {
				paramValue = param;
			}
			processedQuery = processedQuery.replace("?", paramValue);
		});

		console.log("Executing query:", processedQuery);
		// For SELECT queries, use simple output parsing
		if (processedQuery.trim().toUpperCase().startsWith("SELECT")) {
			// Clean up the query
			const cleanQuery = processedQuery.replace(/\s+/g, " ").trim();

			// Escape quotes for command line and use proper quoting
			const escapedQuery = cleanQuery.replace(/"/g, '""');
			const command = `sqlcmd -E -S "${serverName}" -d "${databaseName}" -Q "SET NOCOUNT ON; ${escapedQuery}" -h -1 -s "|" -W`;

			console.log("Executing SELECT command:", command);
			console.log("Clean query:", cleanQuery);

			const { stdout, stderr } = await execAsync(command, {
				timeout: 30000,
				maxBuffer: 1024 * 1024,
			});

			if (
				stderr &&
				stderr.trim() &&
				!stderr.includes("Changed database context")
			) {
				console.error("SQL Error:", stderr);
				throw new Error(`SQL Error: ${stderr}`);
			}

			// Parse the tab-separated output
			const lines = stdout.trim().split("\n");
			const result = [];

			console.log("Raw output lines:", lines);
			for (const line of lines) {
				const trimmed = line.trim();
				if (trimmed && !trimmed.includes("rows affected")) {
					const parts = trimmed.split("|");

					// For elections query
					if (
						cleanQuery.includes("ElectionID") ||
						cleanQuery.includes("ElectionName")
					) {
						if (parts.length >= 8) {
							result.push({
								ElectionID: parseInt(parts[0]?.trim()) || 0,
								ElectionName: parts[1]?.trim() || "",
								ElectionType: parts[2]?.trim() || "",
								ElectionDate: parts[3]?.trim() || "",
								ElectionYear: parseInt(parts[4]?.trim()) || 0,
								Status: parts[5]?.trim() || "",
								VotingStart: parts[6]?.trim() || "",
								VotingEnd: parts[7]?.trim() || "",
								// Add column-based parsing as fallback
								col0: parseInt(parts[0]?.trim()) || 0,
								col1: parts[1]?.trim() || "",
								col2: parts[2]?.trim() || "",
								col3: parts[3]?.trim() || "",
								col4: parseInt(parts[4]?.trim()) || 0,
								col5: parts[5]?.trim() || "",
								col6: parts[6]?.trim() || "",
								col7: parts[7]?.trim() || "",
							});
						}
					}
					// For candidates query
					else if (
						cleanQuery.includes("CandidateID") ||
						cleanQuery.includes("CandidateName")
					) {
						if (parts.length >= 8) {
							result.push({
								CandidateID: parseInt(parts[0]?.trim()) || 0,
								CandidateName: parts[1]?.trim() || "",
								PartyName: parts[2]?.trim() || "",
								ElectionSymbol: parts[3]?.trim() || "",
								Constituency: parts[4]?.trim() || "",
								Province: parts[5]?.trim() || "",
								CandidateAge: parseInt(parts[6]?.trim()) || 0,
								ElectionID: parseInt(parts[7]?.trim()) || 0,
								// Add column-based parsing as fallback
								col0: parseInt(parts[0]?.trim()) || 0,
								col1: parts[1]?.trim() || "",
								col2: parts[2]?.trim() || "",
								col3: parts[3]?.trim() || "",
								col4: parts[4]?.trim() || "",
								col5: parts[5]?.trim() || "",
								col6: parseInt(parts[6]?.trim()) || 0,
								col7: parseInt(parts[7]?.trim()) || 0,
							});
						}
					}
					// For simple COUNT queries
					else if (cleanQuery.includes("COUNT")) {
						result.push({
							count: parseInt(trimmed) || 0,
							total: parseInt(trimmed) || 0,
							col0: parseInt(trimmed) || 0,
						});
					}
					// Generic fallback for any other queries
					else {
						const rowObj: any = {};
						parts.forEach((part, index) => {
							rowObj[`col${index}`] = part?.trim() || "";
						});
						result.push(rowObj);
					}
				}
			}

			console.log("Parsed result:", result);
			return result;
		} else {
			// For INSERT/UPDATE/DELETE queries
			const cleanQuery = processedQuery.replace(/\s+/g, " ").trim();

			// Escape quotes in the query for the command line
			const escapedQuery = cleanQuery.replace(/"/g, '""');
			const command = `sqlcmd -E -S "${serverName}" -d "${databaseName}" -Q "SET NOCOUNT ON; ${escapedQuery}"`;

			console.log("Executing INSERT command:", command);
			console.log("Clean query:", cleanQuery);

			const { stdout, stderr } = await execAsync(command, {
				timeout: 30000,
				maxBuffer: 1024 * 1024,
			});

			console.log("INSERT stdout:", stdout);
			console.log("INSERT stderr:", stderr);

			if (
				stderr &&
				stderr.trim() &&
				!stderr.includes("Changed database context")
			) {
				console.error("SQL Error:", stderr);
				throw new Error(`SQL Error: ${stderr}`);
			}

			// Check if the command executed successfully
			if (stdout.includes("rows affected") || stdout.trim() === "") {
				console.log("INSERT command executed successfully");
				return { success: true };
			} else {
				console.log("Unexpected output:", stdout);
				return { success: true }; // Assume success if no error
			}
		}
	} catch (error) {
		console.error("Database query error:", error);
		throw new Error(
			`Query failed: ${error instanceof Error ? error.message : String(error)}`
		);
	}
}
