var Feedback = artifacts.require("./CourseFeedback.sol");

module.exports = function (deployer) {
    deployer.deploy(Feedback);
};
