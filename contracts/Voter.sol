pragma solidity >=0.4.21 <0.9.0;
pragma experimental ABIEncoderV2;

contract Voter {
    struct VoterDetails {
        address voterAddress;
        string name;
        string email;
        bool isVerified;
        bool isRegistered;
        bool hasVoted;
    }

    mapping(uint256 => mapping(address => VoterDetails)) public voterDetails;
    mapping(uint256 => uint256) public totalVoters;
    mapping(uint256 => address[]) private electionVoters;

    address public admin;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this.");
        _;
    }

    function registerVoter(
        uint256 electionId,
        string memory _name,
        string memory _email
    ) public {
        bool shouldVerify = endsWith(_email, "asu.edu");
        VoterDetails memory newVoter = VoterDetails({
            voterAddress: msg.sender,
            name: _name,
            email: _email,
            isVerified: shouldVerify,
            isRegistered: true,
            hasVoted: false
        });

        voterDetails[electionId][msg.sender] = newVoter;
        electionVoters[electionId].push(msg.sender);
        totalVoters[electionId] += 1;
    }

    function getTotalVoter(uint256 electionId) public view returns (uint256) {
        return totalVoters[electionId];
    }

    function endsWith(
        string memory fullString,
        string memory suffix
    ) private pure returns (bool) {
        bytes memory fullStringBytes = bytes(fullString);
        bytes memory suffixBytes = bytes(suffix);

        if (fullStringBytes.length < suffixBytes.length) {
            return false;
        }

        uint suffixStart = fullStringBytes.length - suffixBytes.length;

        for (uint i = 0; i < suffixBytes.length; i++) {
            if (fullStringBytes[suffixStart + i] != suffixBytes[i]) {
                return false;
            }
        }

        return true;
    }

    function verifyVoter(
        uint256 electionId,
        address _voterAddress
    ) public onlyAdmin {
        require(
            !voterDetails[electionId][_voterAddress].isVerified,
            "Voter already verified."
        );
        voterDetails[electionId][_voterAddress].isVerified = true;
    }

    function getVoterDetails(
        uint256 electionId,
        address voterAddress
    ) public view returns (VoterDetails memory) {
        require(
            voterDetails[electionId][voterAddress].voterAddress != address(0),
            "Voter does not exist."
        );
        return voterDetails[electionId][voterAddress];
    }

    function getAllVoterDetails(
        uint256 electionId
    ) public view returns (VoterDetails[] memory) {
        VoterDetails[] memory details = new VoterDetails[](
            totalVoters[electionId]
        );

        for (uint i = 0; i < totalVoters[electionId]; i++) {
            address voterAddress = electionVoters[electionId][i];
            details[i] = voterDetails[electionId][voterAddress];
        }

        return details;
    }
}
