const Migrations = artifacts.require("Migrations");
const Create2 = artifacts.require("Create2");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(Create2);
};
