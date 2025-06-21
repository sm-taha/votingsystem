console.log("Starting test...");

const { exec } = require('child_process');

// Simple direct test
const command = `sqlcmd -E -S "DESKTOP-FQAMMPA" -d "OnlineVotingSystem" -Q "INSERT INTO Elections (ElectionName, ElectionType, ElectionDate, ElectionYear, Status, VotingStart, VotingEnd) VALUES ('Frontend Test', 'General Election', '2025-06-22', 2025, 'Upcoming', '2025-06-22 12:31:00', '2025-06-23 12:31:00')"`;

console.log("Executing:", command);

exec(command, (error, stdout, stderr) => {
    console.log("Error:", error);
    console.log("Stdout:", stdout);
    console.log("Stderr:", stderr);
    
    if (error) {
        console.log("Command failed:", error.message);
    } else {
        console.log("Command succeeded!");
    }
});
