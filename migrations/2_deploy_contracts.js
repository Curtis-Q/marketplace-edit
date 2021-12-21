const Marketplace = artifacts.require("Marketplace");
const Faucet = artifacts.require("Faucet");

module.exports = function(deployer) {
  deployer.deploy(Marketplace);
  deployer.deploy(Faucet)
};
