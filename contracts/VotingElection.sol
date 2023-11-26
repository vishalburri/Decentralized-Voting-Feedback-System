pragma solidity >=0.4.21 <0.9.0;
pragma experimental ABIEncoderV2;

import "./Voter.sol";

contract VotingElection is Voter {
    struct ElectionInfo {
        uint256 electionId;
        string title;
        bool isActive;
        uint256 candidateCount;
        uint256 voterCount;
    }

    mapping(uint256 => ElectionInfo) public elections;
    uint256 public totalElections;

    constructor() public {
        admin = msg.sender;
    }

    function createElection(string memory _title) public onlyAdmin {
        ElectionInfo memory newElection = ElectionInfo({
            electionId: totalElections,
            title: _title,
            isActive: true,
            candidateCount: 0,
            voterCount: 0
        });

        elections[newElection.electionId] = newElection;
        totalElections++;
    }

    function getAdmin() public view returns (address) {
        return admin;
    }

    function activateElection(uint256 electionId) public onlyAdmin {
        require(electionId < totalElections, "Invalid election ID.");
        elections[electionId].isActive = true;
    }

    function deactivateElection(uint256 electionId) public onlyAdmin {
        require(electionId < totalElections, "Invalid election ID.");
        elections[electionId].isActive = false;
    }

    struct CandidateDetails {
        uint256 candidateId;
        string header;
        string slogan;
        uint256 voteCount;
    }

    mapping(uint256 => mapping(uint256 => CandidateDetails))
        public candidateDetails;
    mapping(uint256 => uint256) public candidateCount;

    function addCandidate(
        uint256 electionId,
        string memory _header,
        string memory _slogan
    ) public {
        require(electionId < totalElections, "Election does not exist.");

        CandidateDetails memory newCandidate = CandidateDetails({
            candidateId: candidateCount[electionId],
            header: _header,
            slogan: _slogan,
            voteCount: 0
        });

        candidateDetails[electionId][candidateCount[electionId]] = newCandidate;
        candidateCount[electionId]++;
    }

    function vote(uint256 electionId, uint256 candidateId) public {
        require(
            !voterDetails[electionId][msg.sender].hasVoted,
            "Already voted."
        );
        require(
            voterDetails[electionId][msg.sender].isVerified,
            "Voter not verified."
        );
        require(elections[electionId].isActive, "Election is not active.");

        candidateDetails[electionId][candidateId].voteCount++;
        voterDetails[electionId][msg.sender].hasVoted = true;
    }

    function getElectionDetails(
        uint256 electionId
    ) public view returns (ElectionInfo memory) {
        require(electionId < totalElections, "Invalid election ID.");
        return elections[electionId];
    }

    function getCandidateDetails(
        uint256 electionId,
        uint256 candidateId
    ) public view returns (CandidateDetails memory) {
        require(
            candidateId < candidateCount[electionId],
            "Invalid candidate ID."
        );
        return candidateDetails[electionId][candidateId];
    }

    function getAllCandidatesDetailsByElectionId(
        uint256 electionId
    ) public view returns (CandidateDetails[] memory) {
        require(electionId < totalElections, "Invalid election ID.");

        CandidateDetails[] memory allCandidates = new CandidateDetails[](
            candidateCount[electionId]
        );
        for (uint256 i = 0; i < candidateCount[electionId]; i++) {
            CandidateDetails storage candidate = candidateDetails[electionId][
                i
            ];
            allCandidates[i] = candidate;
        }

        return allCandidates;
    }

    function hasVoted(
        uint256 electionId,
        address voterAddress
    ) public view returns (bool) {
        require(electionId < totalElections, "Invalid election ID.");
        return voterDetails[electionId][voterAddress].hasVoted;
    }

    function getTotalCandidates(
        uint256 electionId
    ) public view returns (uint256) {
        require(electionId < totalElections, "Invalid election ID.");
        return candidateCount[electionId];
    }

    function endElection(uint256 electionId) public onlyAdmin {
        require(electionId < totalElections, "Invalid election ID.");
        elections[electionId].isActive = false;
    }

    function isElectionActive(uint256 electionId) public view returns (bool) {
        require(electionId < totalElections, "Invalid election ID.");
        return elections[electionId].isActive;
    }

    function hasElectionEnded(uint256 electionId) public view returns (bool) {
        require(electionId < totalElections, "Invalid election ID.");
        return !elections[electionId].isActive;
    }

    function listAllElections() public view returns (ElectionInfo[] memory) {
        ElectionInfo[] memory allElections = new ElectionInfo[](totalElections);
        for (uint256 i = 0; i < totalElections; i++) {
            allElections[i] = elections[i];
        }
        return allElections;
    }

    function listAllActiveElections()
        public
        view
        returns (ElectionInfo[] memory)
    {
        uint256 activeCount = 0;

        for (uint256 i = 0; i < totalElections; i++) {
            if (elections[i].isActive) {
                activeCount++;
            }
        }

        ElectionInfo[] memory activeElections = new ElectionInfo[](activeCount);
        uint256 index = 0;

        for (uint256 i = 0; i < totalElections; i++) {
            if (elections[i].isActive) {
                activeElections[index++] = elections[i];
            }
        }

        return activeElections;
    }
}
