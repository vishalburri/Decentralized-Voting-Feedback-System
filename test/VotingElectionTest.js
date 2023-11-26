const VotingElection = artifacts.require("VotingElection");

contract("VotingElection", (accounts) => {
    const admin = accounts[0];
    const nonAdmin = accounts[1];
    let votingElection;

    beforeEach(async () => {
        votingElection = await VotingElection.new();
    });

    describe("Election Management", () => {
        it("allows the admin to create an election", async () => {
            await votingElection.createElection("Election 1", { from: admin });
            const election = await votingElection.elections(0);
            assert.equal(election.title, "Election 1", "Election was not created correctly.");
        });

        it("prevents non-admins from creating an election", async () => {
            try {
                await votingElection.createElection("Election 2", { from: nonAdmin });
                assert.fail("Non-admin should not be able to create an election.");
            } catch (error) {
                assert.include(error.message, "revert", "Expected revert for non-admin creating an election");
            }
        });
    });

    describe("Voter Registration and Verification", () => {
        it("registers a voter successfully", async () => {
            await votingElection.registerVoter(0, "Alice", "1234567890", { from: nonAdmin });
            const voter = await votingElection.getVoterDetails(0, nonAdmin);
            assert.equal(voter.name, "Alice", "Voter was not registered correctly.");
        });

        it("verifies a voter successfully by admin", async () => {
            await votingElection.registerVoter(0, "Bob", "1234567890", { from: nonAdmin });
            await votingElection.verifyVoter(0, nonAdmin, { from: admin });
            const voter = await votingElection.getVoterDetails(0, nonAdmin);
            assert.equal(voter.isVerified, true, "Voter was not verified correctly.");
        });
    });

    describe("Candidate Management", () => {
        it("allows adding a candidate to an existing election", async () => {
            await votingElection.createElection("Election 1", { from: admin });
            await votingElection.addCandidate(0, "Candidate 1", "Slogan 1", { from: admin });
            const candidate = await votingElection.getCandidateDetails(0, 0);
            assert.equal(candidate.header, "Candidate 1", "Candidate was not added correctly.");
        });

        it("prevents adding a candidate to a non-existent election", async () => {
            try {
                await votingElection.addCandidate(1, "Candidate 2", "Slogan 2", { from: admin });
                assert.fail("Should not be able to add a candidate to a non-existent election.");
            } catch (error) {
                assert.include(error.message, "revert", "Expected revert for non-existent election");
            }
        });
    });

    describe("Election Activation/Deactivation", () => {
        beforeEach(async () => {
            await votingElection.createElection("Election 1", { from: admin });
        });

        it("activates an election successfully", async () => {
            await votingElection.activateElection(0, { from: admin });
            const election = await votingElection.elections(0);
            assert.equal(election.isActive, true, "Election was not activated.");
        });

        it("deactivates an election successfully", async () => {
            await votingElection.deactivateElection(0, { from: admin });
            const election = await votingElection.elections(0);
            assert.equal(election.isActive, false, "Election was not deactivated.");
        });
    });

    describe("Voting Process", () => {
        beforeEach(async () => {
            await votingElection.createElection("Election 1", { from: admin });
            await votingElection.addCandidate(0, "Candidate 1", "Slogan 1", { from: admin });
            await votingElection.registerVoter(0, "Alice", "1234567890", { from: accounts[2] });
            await votingElection.verifyVoter(0, accounts[2], { from: admin });
        });

        it("allows a verified voter to vote", async () => {
            await votingElection.vote(0, 0, { from: accounts[2] });
            const candidate = await votingElection.getCandidateDetails(0, 0);
            assert.equal(candidate.voteCount, 1, "Vote count should be incremented.");
        });

        it("prevents voting in an inactive election", async () => {
            await votingElection.deactivateElection(0, { from: admin });
            try {
                await votingElection.vote(0, 0, { from: accounts[2] });
                assert.fail("Should not be able to vote in an inactive election.");
            } catch (error) {
                assert.include(error.message, "revert", "Expected revert for voting in an inactive election");
            }
        });
    });

    it("prevents non-admins from activating an election", async () => {
        await votingElection.createElection("Election 1", { from: admin });
        try {
            await votingElection.activateElection(0, { from: nonAdmin });
            assert.fail("The transaction should have thrown an error");
        } catch (error) {
            assert.include(error.message, "revert", "Expected revert for non-admin activating an election");
        }
    });

    it("prevents non-admins from deactivating an election", async () => {
        await votingElection.createElection("Election 1", { from: admin });
        await votingElection.activateElection(0, { from: admin });
        try {
            await votingElection.deactivateElection(0, { from: nonAdmin });
            assert.fail("The transaction should have thrown an error");
        } catch (error) {
            assert.include(error.message, "revert", "Expected revert for non-admin deactivating an election");
        }
    });

    it("prevents unregistered voters from voting", async () => {
        await votingElection.createElection("Election 1", { from: admin });
        await votingElection.addCandidate(0, "Candidate 1", "Slogan 1", { from: admin });
        await votingElection.activateElection(0, { from: admin });

        try {
            await votingElection.vote(0, 0, { from: nonAdmin });
            assert.fail("The transaction should have thrown an error");
        } catch (error) {
            assert.include(error.message, "revert", "Expected revert for unregistered voter voting");
        }
    });

    it("prevents unverified voters from voting", async () => {
        await votingElection.createElection("Election 1", { from: admin });
        await votingElection.addCandidate(0, "Candidate 1", "Slogan 1", { from: admin });
        await votingElection.registerVoter(0, "Bob", "1234567890", { from: nonAdmin });
        await votingElection.activateElection(0, { from: admin });

        try {
            await votingElection.vote(0, 0, { from: nonAdmin });
            assert.fail("The transaction should have thrown an error");
        } catch (error) {
            assert.include(error.message, "revert", "Expected revert for unverified voter voting");
        }
    });

    it("lists all elections", async () => {
        await votingElection.createElection("Election 1", { from: admin });
        await votingElection.createElection("Election 2", { from: admin });
        const elections = await votingElection.listAllElections();

        assert.equal(elections.length, 2, "Should list two elections");
        assert.equal(elections[0].title, "Election 1", "First election title mismatch");
        assert.equal(elections[1].title, "Election 2", "Second election title mismatch");
    });

    describe("Voter Registration and Auto-Verification", () => {
        it("automatically verifies a voter with an ASU email", async () => {
            await votingElection.registerVoter(0, "Alice", "alice@asu.edu", { from: nonAdmin });
            const voter = await votingElection.getVoterDetails(0, nonAdmin);
            assert.equal(voter.isVerified, true, "Voter with ASU email should be auto-verified");
        });

        it("does not auto-verify a voter with a non-ASU email and allows manual verification", async () => {
            await votingElection.registerVoter(0, "Bob", "bob@example.com", { from: nonAdmin });
            let voter = await votingElection.getVoterDetails(0, nonAdmin);
            assert.equal(voter.isVerified, false, "Voter with non-ASU email should not be auto-verified");

            await votingElection.verifyVoter(0, nonAdmin, { from: admin });
            voter = await votingElection.getVoterDetails(0, nonAdmin);
            assert.equal(voter.isVerified, true, "Admin should be able to verify a voter");
        });
    });
});
