const WalletWall = artifacts.require("WalletWall");

module.exports = function(deployer) {
  deployer.deploy(WalletWall);
};
