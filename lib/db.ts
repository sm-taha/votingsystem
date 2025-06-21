// Main database interface - exports the SQL Server connection
import { executeQuery } from "./db-sqlcmd";

// Types for Pakistani Online Voting System - Aligned with SQL Schema
export interface Election {
	ElectionID: number; // INT PRIMARY KEY IDENTITY(1,1)
	ElectionName: string; // VARCHAR(100) NOT NULL
	ElectionType: string | null; // VARCHAR(50)
	ElectionDate: string; // DATE NOT NULL
	ElectionYear: number; // INT CHECK (ElectionYear >= 2000)
	Status: string; // VARCHAR(20) DEFAULT 'Upcoming'
	VotingStart: string; // DATETIME NOT NULL
	VotingEnd: string; // DATETIME NOT NULL
}

export interface Candidate {
	CandidateID: number; // INT PRIMARY KEY IDENTITY(1,1)
	CandidateName: string; // VARCHAR(100) NOT NULL
	PartyName: string | null; // VARCHAR(50)
	ElectionSymbol: string | null; // VARCHAR(30)
	Constituency: string; // VARCHAR(20) NOT NULL
	Province: string; // VARCHAR(30) NOT NULL
	CandidateAge: number; // INT CHECK (CandidateAge >= 25)
	ElectionID: number; // INT NOT NULL, FOREIGN KEY
}

// Voter interface - matches SQL schema Voters table exactly
// Note: The OnlineVotes table has a foreign key constraint that requires
// every vote's CNIC to exist in the Voters table. The application automatically
// registers voters when they cast their first vote to satisfy this constraint.
export interface Voter {
	CNIC: string; // VARCHAR(15) PRIMARY KEY
	VoterName: string; // VARCHAR(100) NOT NULL
	Age: number; // INT CHECK (Age >= 18 AND Age <= 80)
	City: string; // VARCHAR(40) NOT NULL
	Province: string; // VARCHAR(30) NOT NULL
	Gender: string; // CHAR(1) CHECK (Gender IN ('M', 'F'))
	RegistrationDate: string; // DATE DEFAULT GETDATE()
	Email: string; // VARCHAR(100) UNIQUE NOT NULL
	PhoneNumber: string | null; // VARCHAR(15) UNIQUE
	OnlineStatus: string; // VARCHAR(20) DEFAULT 'Active'
}

// OnlineVotes table interface - the main voting record
export interface Vote {
	VoteNo: number; // INT PRIMARY KEY IDENTITY(1,1)
	CNIC: string; // VARCHAR(15) NOT NULL, FOREIGN KEY
	CandidateID: number; // INT NOT NULL, FOREIGN KEY
	ElectionID: number; // INT NOT NULL, FOREIGN KEY
	Constituency: string; // VARCHAR(20) NOT NULL
	VoteDate: string; // DATETIME DEFAULT GETDATE()
	VotingLocation: string | null; // VARCHAR(100)
}

// Results and aggregation interfaces for voting analysis
export interface VoteResult {
	CandidateID: number;
	CandidateName: string;
	PartyName: string | null;
	ElectionSymbol: string | null;
	Constituency: string;
	vote_count: number;
	percentage: number;
}

// Extended result interface with more details
export interface DetailedVoteResult extends VoteResult {
	Province: string;
	TotalVotesInConstituency: number;
	ElectionID: number;
	ElectionName: string;
}

// Interface for constituency-level results
export interface ConstituencyResult {
	Constituency: string;
	Province: string;
	ElectionID: number;
	TotalVotes: number;
	Results: VoteResult[];
}

// Interface for vote statistics
export interface VoteStatistics {
	TotalElections: number;
	TotalVoters: number;
	TotalCandidates: number;
	TotalVotes: number;
	VotersByProvince: { Province: string; VoterCount: number }[];
	VotesByElection: { ElectionID: number; VoteCount: number }[];
}

// Input types for creating new records
export interface CreateElectionInput {
	ElectionName: string;
	ElectionType?: string;
	ElectionDate: string;
	ElectionYear: number;
	Status?: string;
	VotingStart: string;
	VotingEnd: string;
}

export interface CreateCandidateInput {
	CandidateName: string;
	PartyName?: string;
	ElectionSymbol?: string;
	Constituency: string;
	Province: string;
	CandidateAge: number;
	ElectionID: number;
}

export interface CreateVoterInput {
	CNIC: string;
	VoterName: string;
	Age: number;
	City: string;
	Province: string;
	Gender: "M" | "F";
	Email: string;
	PhoneNumber?: string;
	OnlineStatus?: string;
}

export interface CreateVoteInput {
	CNIC: string;
	CandidateID: number;
	ElectionID: number;
	Constituency: string;
	VotingLocation?: string;
}

// Export the query function from our SQL Server bridge
export async function query(sql: string, params: any[] = []) {
	const result = await executeQuery(sql, params);
	return {
		rows: result,
	};
}

// Export the main database types and functions
export { executeQuery };
