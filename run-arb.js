require("dotenv").config();
import { ChainId, Token, TokenAmount, Pair, Fetcher } from "@uniswap/sdk";

const abis = require("./abis");
const Web3 = require("web3");
const { mainnet: address } = require("./addresses");

const web3 = new Web3(
  new Web3.providers.WebsocketProvider(process.env.MAINNET_INFURA)
);

const kyber = new web3.eth.Contract(
  abis.kyber.kyberNetworkProxy,
  address.kyber.kyberNetworkProxy
);

// console.log(kyper[1]);
const AMOUNT_ETH = 100;
const RECENT_PRICE = 230;
const AMOUNT_ETH_WEI = web3.utils.toWei(AMOUNT_ETH.toString());
const AMOUNT_DAI_WEI = web3.utils.toWei((AMOUNT_ETH * RECENT_PRICE).toString());

const init = async () => {
  const [dai, weth] = await Promise.all(
    [address.tokens.dai, address.tokens.weth].map((tokenAddr) =>
      Fetcher.fetchTokenData(ChainId.MAINNET, tokenAddr)
    )
  );
  web3.eth
    .subscribe("newBlockHeaders")
    .on("data", async (block) => {
      if (block.timestamp) {
        const curr = Date.now();
        const point = new Date(
          new Date(block.number).toLocaleString()
        ).getMilliseconds();

        const kyberResults = await Promise.all([
          kyber.methods
            .getExpectedRate(
              address.tokens.dai,
              "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
              AMOUNT_DAI_WEI
            )
            .call(),
          kyber.methods
            .getExpectedRate(
              "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
              address.tokens.dai,
              AMOUNT_ETH_WEI
            )
            .call(),
        ]);

        const kyberRates = {
          buy: parseFloat(1 / (kyberResults[0].expectedRate / 10 ** 18)),
          sel: parseFloat(kyberResults[1].expectedRate / 10 ** 18),
          diff:
            parseFloat(1 / (kyberResults[0].expectedRate / 10 ** 18)) -
            parseFloat(kyberResults[1].expectedRate / 10 ** 18),
        };

        console.log(kyberRates);
      }
    })
    .on("error", (error) => console.log(error));
};
