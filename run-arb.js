require("dotenv").config();

const abis = require("./abis");
const Web3 = require("web3");
const { mainnet: address } = require("./addresses");

const web3 = new Web3(
  new Web3.providers.WebsocketProvider(process.env.MAINNET_INFURA)
);

const kyper = new web3.eth.Contract(
  abis.kyber.kyberNetworkProxy,
  address.kyber.kyberNetworkProxy
);

// console.log(kyper[1]);  

web3.eth
  .subscribe("newBlockHeaders")
  .on("data", async (block) => {
    if (block.timestamp) {
      const curr = Date.now();
      const point = new Date(
        new Date(block.number).toLocaleString()
      ).getMilliseconds();

      console.log(curr, new Date(block.number).toLocaleString(), point);
    }
  })
  .on("error", (error) => console.log(error));
