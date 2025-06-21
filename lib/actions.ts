"use server";

import { query, Election, Candidate, Vote, VoteResult, Voter } from "./db";

// Get all elections with their status
export async function getElections() {
	try {
		const sqlQuery = `
      SELECT 
        ElectionID,
        ElectionName,
        ElectionType,
        ElectionDate,
        ElectionYear,
        Status,
        VotingStart,
        VotingEnd
      FROM Elections
      ORDER BY VotingStart DESC
    `;

		const result = await query(sqlQuery);
		console.log("Raw election data:", result.rows);
		// Add computed status based on dates
		return result.rows.map((election: any) => {
			const now = new Date();
			const startDate = new Date(election.VotingStart || election.col6);
			const endDate = new Date(election.VotingEnd || election.col7);

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

// Get candidates for a specific election
export async function getCandidatesByElection(electionId: number) {
	try {
		const sqlQuery = `
      SELECT 
        CandidateID,
        CandidateName,
        PartyName,
        ElectionSymbol,
        Constituency,
        Province,
        CandidateAge,
        ElectionID
      FROM Candidates
      WHERE ElectionID = ?
      ORDER BY CandidateName
    `;

		const result = await query(sqlQuery, [electionId]);
		console.log("Raw candidate data:", result.rows);

		return result.rows.map((candidate: any) => ({
			CandidateID: candidate.CandidateID || candidate.col0,
			CandidateName: candidate.CandidateName || candidate.col1,
			PartyName: candidate.PartyName || candidate.col2,
			ElectionSymbol: candidate.ElectionSymbol || candidate.col3,
			Constituency: candidate.Constituency || candidate.col4,
			Province: candidate.Province || candidate.col5,
			CandidateAge: candidate.CandidateAge || candidate.col6,
			ElectionID: candidate.ElectionID || candidate.col7,
		})) as Candidate[];
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
		console.log("Creating election with data:", {
			electionName,
			electionType,
			electionDate,
			electionYear,
			votingStart,
			votingEnd,
		});

		// Format dates properly for SQL Server
		// Convert date inputs to SQL Server format
		const formattedElectionDate = new Date(electionDate)
			.toISOString()
			.split("T")[0]; // YYYY-MM-DD
		const formattedVotingStart = new Date(votingStart)
			.toISOString()
			.slice(0, 19)
			.replace("T", " "); // YYYY-MM-DD HH:MM:SS
		const formattedVotingEnd = new Date(votingEnd)
			.toISOString()
			.slice(0, 19)
			.replace("T", " "); // YYYY-MM-DD HH:MM:SS

		console.log("Formatted dates:", {
			formattedElectionDate,
			formattedVotingStart,
			formattedVotingEnd,
		});

		// Determine initial status based on dates
		const now = new Date();
		const startDate = new Date(votingStart);
		const endDate = new Date(votingEnd);

		let status: string;
		if (now < startDate) {
			status = "Upcoming";
		} else if (now >= startDate && now <= endDate) {
			status = "Active";
		} else {
			status = "Completed";
		}

		console.log("Determined status:", status);

		const sqlQuery = `
      INSERT INTO Elections (ElectionName, ElectionType, ElectionDate, ElectionYear, Status, VotingStart, VotingEnd)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

		console.log("About to execute query with parameters:", [
			electionName,
			electionType,
			formattedElectionDate,
			electionYear,
			status,
			formattedVotingStart,
			formattedVotingEnd,
		]);

		const result = await query(sqlQuery, [
			electionName,
			electionType,
			formattedElectionDate,
			electionYear,
			status,
			formattedVotingStart,
			formattedVotingEnd,
		]);

		console.log("Query executed successfully, result:", result);

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
		const sqlQuery = `      SELECT 
        e.ElectionID,
        e.ElectionName,
        e.ElectionType,
        e.ElectionDate,
        e.ElectionYear,
        e.Status,
        e.VotingStart,
        e.VotingEnd,
        COUNT(v.VoteNo) as TotalVotes
      FROM Elections e
      LEFT JOIN OnlineVotes v ON e.ElectionID = v.ElectionID
      GROUP BY e.ElectionID, e.ElectionName, e.ElectionType, e.ElectionDate, e.ElectionYear, e.Status, e.VotingStart, e.VotingEnd
      ORDER BY e.VotingEnd DESC
    `;

		const result = await query(sqlQuery);

		// Filter for completed elections based on computed status
		const completedElections = result.rows.filter((election: any) => {
			const now = new Date();
			const endDate = new Date(election.VotingEnd || election.col7);
			return now > endDate; // Election is completed if current time is past end date
		});
		// For each election, get the candidate results
		const electionsWithResults = await Promise.all(
			completedElections.map(async (election: any) => {
				const candidateResultsQuery = `
          SELECT 
            c.CandidateName,
            c.PartyName,
            COUNT(v.VoteNo) as VoteCount
          FROM Candidates c
          LEFT JOIN OnlineVotes v ON c.CandidateID = v.CandidateID
          WHERE c.ElectionID = ?
          GROUP BY c.CandidateID, c.CandidateName, c.PartyName
          ORDER BY VoteCount DESC
        `;

				const candidateResults = await query(candidateResultsQuery, [
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
		const checkVoteQuery = `
      SELECT VoteNo FROM OnlineVotes 
      WHERE ElectionID = ? AND CNIC = ?
    `;

		const existingVote = await query(checkVoteQuery, [electionId, voterCNIC]);

		if (existingVote.rows.length > 0) {
			throw new Error("You have already voted in this election");
		}

		// Get candidate's constituency for the vote
		const candidateQuery = `
      SELECT Constituency FROM Candidates 
      WHERE CandidateID = ?
    `;
		const candidateResult = await query(candidateQuery, [candidateId]);

		if (candidateResult.rows.length === 0) {
			throw new Error("Invalid candidate");
		}

		const constituency =
			candidateResult.rows[0].Constituency || candidateResult.rows[0].col0;

		// Check if voter exists, if not create a basic voter record
		// This is required because OnlineVotes has foreign key constraint to Voters table
		const voterCheckQuery = `
      SELECT CNIC FROM Voters WHERE CNIC = ?
    `;
		const existingVoter = await query(voterCheckQuery, [voterCNIC]);

		if (existingVoter.rows.length === 0) {
			// Create a basic voter record to satisfy foreign key constraint
			const createVoterQuery = `
        INSERT INTO Voters (CNIC, VoterName, Age, City, Province, Gender, Email, PhoneNumber, OnlineStatus)
        VALUES (?, 'Online Voter', 25, 'Unknown', 'Unknown', 'M', ?, '0300-0000000', 'Active')
      `;
			const voterEmail = `voter${voterCNIC.replace(/-/g, "")}@temp.com`;
			await query(createVoterQuery, [voterCNIC, voterEmail]);
		}

		// Cast the vote - using OnlineVotes table as per SQL schema
		const castVoteQuery = `
      INSERT INTO OnlineVotes (ElectionID, CandidateID, CNIC, VoteDate, Constituency, VotingLocation)
      VALUES (?, ?, ?, GETDATE(), ?, 'Online Platform')
    `;

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
		const sqlQuery = `
      INSERT INTO Candidates (CandidateName, PartyName, ElectionSymbol, Constituency, Province, CandidateAge, ElectionID)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

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
