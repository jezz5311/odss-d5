const OffChainDataStorage = artifacts.require("OffChainDataStorage.sol");

module.exports = function(deployer) {
  deployer.deploy(OffChainDataStorage);
};