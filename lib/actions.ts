"use server";

import { query, Election, Candidate, Vote, VoteResult, Voter } from "./db";

// Get all elections with their status
export async function getElections() {
	try {
		const sqlQuery = `SELECT ElectionID, ElectionName, ElectionType, ElectionDate, ElectionYear, Status, VotingStart, VotingEnd FROM Elections ORDER BY VotingStart DESC`;

		const result = await query(sqlQuery);

		// Add computed status based on dates
		return result.rows.map((election: any) => {
			const now = new Date();
			// Parse dates more carefully to handle SQL Server datetime format
			const parseDbDate = (dateStr: any) => {
				if (!dateStr) return new Date(0); // Far past date
				// Handle both direct string and fallback column formats
				const cleanDate = dateStr.toString().replace(/\.\d{3}$/, ""); // Remove milliseconds
				return new Date(cleanDate);
			};

			const startDate = parseDbDate(election.VotingStart || election.col6);
			const endDate = parseDbDate(election.VotingEnd || election.col7);

			let computed_status: "upcoming" | "active" | "completed";
			if (now < startDate) {
				computed_status = "upcoming";
			} else if (now >= startDate && now <= endDate) {
				computed_status = "active";
			} else {
				computed_status = "completed";
			}

			return {
				ElectionID: election.ElectionID || election.col0,
				ElectionName: election.ElectionName || election.col1,
				ElectionType: election.ElectionType || election.col2,
				ElectionDate: election.ElectionDate || election.col3,
				ElectionYear: election.ElectionYear || election.col4,
				Status:
					computed_status === "upcoming"
						? "Upcoming"
						: computed_status === "active"
						? "Active"
						: "Completed", // Use computed status
				VotingStart: election.VotingStart || election.col6,
				VotingEnd: election.VotingEnd || election.col7,
				computed_status,
			};
		}) as (Election & {
			computed_status: "upcoming" | "active" | "completed";
		})[];
	} catch (error) {
		console.error("Error fetching elections:", error);
		return [];
	}
}

// Get a specific election by ID
export async function getElectionById(electionId: number) {
	try {
		const sqlQuery = `SELECT ElectionID, ElectionName, ElectionType, ElectionDate, ElectionYear, Status, VotingStart, VotingEnd FROM Elections WHERE ElectionID = ?`;

		const result = await query(sqlQuery, [electionId]);

		if (result.rows.length === 0) {
			return null;
		}

		const election = result.rows[0];
		// Add computed status based on dates
		const now = new Date();

		// Parse dates more carefully to handle SQL Server datetime format
		const parseDbDate = (dateStr: any) => {
			if (!dateStr) return new Date(0); // Far past date
			// Handle both direct string and fallback column formats
			const cleanDate = dateStr.toString().replace(/\.\d{3}$/, ""); // Remove milliseconds
			return new Date(cleanDate);
		};

		const startDate = parseDbDate(election.VotingStart || election.col6);
		const endDate = parseDbDate(election.VotingEnd || election.col7);

		let computed_status: "upcoming" | "active" | "completed";
		if (now < startDate) {
			computed_status = "upcoming";
		} else if (now >= startDate && now <= endDate) {
			computed_status = "active";
		} else {
			computed_status = "completed";
		}

		return {
			ElectionID: election.ElectionID || election.col0,
			ElectionName: election.ElectionName || election.col1,
			ElectionType: election.ElectionType || election.col2,
			ElectionDate: election.ElectionDate || election.col3,
			ElectionYear: election.ElectionYear || election.col4,
			Status:
				computed_status === "upcoming"
					? "Upcoming"
					: computed_status === "active"
					? "Active"
					: "Completed",
			VotingStart: election.VotingStart || election.col6,
			VotingEnd: election.VotingEnd || election.col7,
			computed_status,
		} as Election & {
			computed_status: "upcoming" | "active" | "completed";
		};
	} catch (error) {
		console.error("Error fetching election by ID:", error);
		return null;
	}
}

// Get candidates for a specific election
export async function getCandidatesByElection(electionId: number) {
	try {
		const sqlQuery = `SELECT CandidateID, CandidateName, PartyName, ElectionSymbol, Constituency, Province, CandidateAge, ElectionID FROM Candidates WHERE ElectionID = ? ORDER BY CandidateName`;

		const result = await query(sqlQuery, [electionId]);

		return result.rows
			.map((candidate: any) => ({
				CandidateID: candidate.CandidateID || candidate.col0,
				CandidateName:
					candidate.CandidateName || candidate.col1 || "Unknown Candidate",
				PartyName: candidate.PartyName || candidate.col2 || "Independent",
				ElectionSymbol: candidate.ElectionSymbol || candidate.col3 || "",
				Constituency: candidate.Constituency || candidate.col4 || "Unknown",
				Province: candidate.Province || candidate.col5 || "Unknown",
				CandidateAge: candidate.CandidateAge || candidate.col6 || 0,
				ElectionID: candidate.ElectionID || candidate.col7 || electionId,
			}))
			.filter(
				(candidate: any) =>
					candidate.CandidateID &&
					candidate.CandidateName !== "Unknown Candidate"
			) as Candidate[];
	} catch (error) {
		console.error("Error fetching candidates:", error);
		return [];
	}
}

// Create a new election
export async function createElection(
	electionName: string,
	electionType: string,
	electionDate: string,
	electionYear: number,
	votingStart: string,
	votingEnd: string
) {
	try {
		// Format dates properly for SQL Server without timezone conversion
		// Keep the dates in local timezone as entered by user
		const formattedElectionDate = electionDate; // Already in YYYY-MM-DD format from date input
		const formattedVotingStart = votingStart.replace("T", " "); // Convert from YYYY-MM-DDTHH:MM to YYYY-MM-DD HH:MM
		const formattedVotingEnd = votingEnd.replace("T", " "); // Convert from YYYY-MM-DDTHH:MM to YYYY-MM-DD HH:MM

		// Determine initial status based on dates (keeping in local timezone)
		const now = new Date();
		const startDate = new Date(votingStart); // Local datetime-local input
		const endDate = new Date(votingEnd); // Local datetime-local input

		let status: string;
		if (now < startDate) {
			status = "Upcoming";
		} else if (now >= startDate && now <= endDate) {
			status = "Active";
		} else {
			status = "Completed";
		}

		const sqlQuery = `INSERT INTO Elections (ElectionName, ElectionType, ElectionDate, ElectionYear, Status, VotingStart, VotingEnd) VALUES (?, ?, ?, ?, ?, ?, ?)`;

		const result = await query(sqlQuery, [
			electionName,
			electionType,
			formattedElectionDate,
			electionYear,
			status,
			formattedVotingStart,
			formattedVotingEnd,
		]);

		return { success: true, message: "Election created successfully" };
	} catch (error) {
		console.error("Error creating election:", error);
		return {
			success: false,
			message:
				error instanceof Error ? error.message : "Failed to create election",
		};
	}
}

// Get completed elections with results
export async function getCompletedElectionsWithResults() {
	try {
		const sqlQuery = `SELECT e.ElectionID, e.ElectionName, e.ElectionType, e.ElectionDate, e.ElectionYear, e.Status, e.VotingStart, e.VotingEnd, COUNT(v.VoteNo) as TotalVotes FROM Elections e LEFT JOIN OnlineVotes v ON e.ElectionID = v.ElectionID GROUP BY e.ElectionID, e.ElectionName, e.ElectionType, e.ElectionDate, e.ElectionYear, e.Status, e.VotingStart, e.VotingEnd ORDER BY e.VotingEnd DESC`;

		const result = await query(sqlQuery);

		// Filter for completed elections based on computed status
		const completedElections = result.rows.filter((election: any) => {
			const now = new Date();
			const endDate = new Date(election.VotingEnd || election.col7);
			return now > endDate; // Election is completed if current time is past end date
		}); // For each election, get the candidate results
		const electionsWithResults = await Promise.all(
			completedElections.map(async (election: any) => {
				const candidateResultsQuery = `SELECT c.CandidateName, c.PartyName, COUNT(v.VoteNo) as VoteCount FROM Candidates c LEFT JOIN OnlineVotes v ON c.CandidateID = v.CandidateID AND v.ElectionID = ? WHERE c.ElectionID = ? GROUP BY c.CandidateID, c.CandidateName, c.PartyName ORDER BY VoteCount DESC`;

				const candidateResults = await query(candidateResultsQuery, [
					election.ElectionID || election.col0,
					election.ElectionID || election.col0,
				]);

				const totalVotes = election.TotalVotes || election.col8 || 0;
				const results = candidateResults.rows.map((candidate: any) => ({
					candidate: candidate.CandidateName || candidate.col0,
					party: candidate.PartyName || candidate.col1,
					votes: candidate.VoteCount || candidate.col2 || 0,
					percentage:
						totalVotes > 0
							? Math.round(
									((candidate.VoteCount || candidate.col2 || 0) / totalVotes) *
										100
							  )
							: 0,
				}));

				const winner =
					results.length > 0 ? results[0].candidate : "No votes cast";

				return {
					id: election.ElectionID || election.col0,
					title: election.ElectionName || election.col1,
					description: `${election.ElectionType || election.col2} - ${
						election.ElectionYear || election.col4
					}`,
					endDate: election.VotingEnd || election.col7,
					totalVotes,
					results,
					winner,
				};
			})
		);

		return electionsWithResults;
	} catch (error) {
		console.error("Error fetching completed elections with results:", error);
		return [];
	}
}

// Cast a vote
export async function castVote(
	electionId: number,
	candidateId: number,
	voterCNIC: string
) {
	try {
		// First check if voter has already voted in this election
		const checkVoteQuery = `SELECT VoteNo FROM OnlineVotes WHERE ElectionID = ? AND CNIC = ?`;
		const existingVote = await query(checkVoteQuery, [electionId, voterCNIC]);

		if (existingVote.rows.length > 0) {
			throw new Error("You have already voted in this election");
		}

		// Get candidate's constituency for the vote
		const candidateQuery = `SELECT Constituency FROM Candidates WHERE CandidateID = ?`;
		const candidateResult = await query(candidateQuery, [candidateId]);

		if (candidateResult.rows.length === 0) {
			// Check what candidates exist for this election
			const allCandidatesQuery = `SELECT CandidateID, CandidateName FROM Candidates WHERE ElectionID = ?`;
			const allCandidates = await query(allCandidatesQuery, [electionId]);

			if (allCandidates.rows.length === 0) {
				throw new Error(
					"No candidates have been added to this election yet. Please contact the administrator."
				);
			} else {
				throw new Error(
					`Invalid candidate ID. Available candidates: ${allCandidates.rows
						.map(
							(c: any) =>
								`${c.CandidateID || c.col0}: ${c.CandidateName || c.col1}`
						)
						.join(", ")}`
				);
			}
		}

		const constituency =
			candidateResult.rows[0].Constituency || candidateResult.rows[0].col0;

		// Check if voter exists, if not create a basic voter record
		// This is required because OnlineVotes has foreign key constraint to Voters table
		const voterCheckQuery = `SELECT CNIC FROM Voters WHERE CNIC = ?`;
		const existingVoter = await query(voterCheckQuery, [voterCNIC]);

		if (existingVoter.rows.length === 0) {
			// Create a basic voter record to satisfy foreign key constraint
			const createVoterQuery = `INSERT INTO Voters (CNIC, VoterName, Age, City, Province, Gender, Email, PhoneNumber, OnlineStatus) VALUES (?, 'Online Voter', 25, 'Unknown', 'Unknown', 'M', ?, ?, 'Active')`;
			const voterEmail = `voter${voterCNIC.replace(/-/g, "")}@temp.com`;
			const voterPhone = `0300-${voterCNIC.slice(-7)}`; // Use last 7 digits of CNIC for unique phone
			await query(createVoterQuery, [voterCNIC, voterEmail, voterPhone]);
		}

		// Cast the vote - using OnlineVotes table as per SQL schema
		const castVoteQuery = `INSERT INTO OnlineVotes (ElectionID, CandidateID, CNIC, VoteDate, Constituency, VotingLocation) VALUES (?, ?, ?, GETDATE(), ?, 'Online Platform')`;

		await query(castVoteQuery, [
			electionId,
			candidateId,
			voterCNIC,
			constituency,
		]);

		return { success: true, message: "Vote cast successfully" };
	} catch (error) {
		console.error("Error casting vote:", error);
		throw new Error(
			error instanceof Error ? error.message : "Failed to cast vote"
		);
	}
}

// Get results for a specific election
export async function getElectionResults(electionId: number) {
	try {
		const sqlQuery = `SELECT c.CandidateID, c.CandidateName, c.PartyName, COUNT(ov.VoteNo) as VoteCount FROM Candidates c LEFT JOIN OnlineVotes ov ON c.CandidateID = ov.CandidateID AND ov.ElectionID = ? WHERE c.ElectionID = ? GROUP BY c.CandidateID, c.CandidateName, c.PartyName ORDER BY VoteCount DESC, c.CandidateName`;

		const result = await query(sqlQuery, [electionId, electionId]);

		return result.rows.map((row: any) => ({
			CandidateID: row.CandidateID || row.col0,
			CandidateName: row.CandidateName || row.col1,
			PartyName: row.PartyName || row.col2,
			VoteCount: row.VoteCount || row.col3 || 0,
		}));
	} catch (error) {
		console.error("Error fetching election results:", error);
		return [];
	}
}

// Add a new candidate to an election
export async function addCandidate(
	electionId: number,
	candidateName: string,
	partyName: string,
	electionSymbol: string,
	constituency: string,
	province: string,
	candidateAge: number
) {
	try {
		const sqlQuery = `INSERT INTO Candidates (CandidateName, PartyName, ElectionSymbol, Constituency, Province, CandidateAge, ElectionID) VALUES (?, ?, ?, ?, ?, ?, ?)`;

		await query(sqlQuery, [
			candidateName,
			partyName,
			electionSymbol,
			constituency,
			province,
			candidateAge,
			electionId,
		]);

		return { success: true, message: "Candidate added successfully" };
	} catch (error) {
		console.error("Error adding candidate:", error);
		throw new Error("Failed to add candidate");
	}
}

// Update election statuses based on current time
export async function updateElectionStatuses() {
	try {
		const sqlQuery = `
      UPDATE Elections 
      SET Status = CASE 
        WHEN GETDATE() < VotingStart THEN 'Upcoming'
        WHEN GETDATE() >= VotingStart AND GETDATE() <= VotingEnd THEN 'Active'
        WHEN GETDATE() > VotingEnd THEN 'Completed'
        ELSE Status
      END
    `;

		await query(sqlQuery);
		return { success: true, message: "Election statuses updated" };
	} catch (error) {
		console.error("Error updating election statuses:", error);
		throw new Error("Failed to update election statuses");
	}
}
