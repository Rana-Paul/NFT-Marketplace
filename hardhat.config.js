require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.4",
  networks: {
     sepolia: {
       url: `https://eth-sepolia.g.alchemy.com/v2/muocxQLFtOHgnGtdiJmgf31XAkw0TRAz`,
       accounts: ["764ed139cfcaf9200f7dfba53e9d751a69fa2828854dbac3c1d1735737e6eef4"]
      }

  },
  paths: {
    artifacts: "./src/backend/artifacts",
    sources: "./src/backend/contracts",
    cache: "./src/backend/cache",
    tests: "./src/backend/test"
  },
  
};
