var Voting = artifacts.require("./VotingElection.sol");

module.exports = function (deployer) {
    deployer.deploy(Voting);
};
