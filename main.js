const express = require('express')
const app = express()
const ethers = require("ethers");
const Web3 = require("web3");
const IPair = require("@uniswap/v2-core/build/IUniswapV2Pair.json");

const port = 3000

const chains = {
    1: {
        rpc: "https://mainnet.infura.io/v3/f3f30b367c6c45c093d0a7c7bd7709fa",
        ethUsdtPair: {},
        ethIsToken0: true,
        web3: {}
    }
}

const formatDigits = (amount) => {
    if (amount < 1) {
        const decimalPart = Number(amount.toString().split('e-')[1]);
        if (decimalPart) {
            return (amount.toFixed(decimalPart + 3));
        }
    }

    return amount.toString();
}

const getChain = (chainId) => {
    const chain = chains[chainId]
    const web3 = new Web3("https://mainnet.infura.io/v3/f3f30b367c6c45c093d0a7c7bd7709fa")
    chain.web3 = web3
    chain.ethUsdtPair = new web3.eth.Contract(IPair.abi, "0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852")
    return chain
}

const getEthPrice = async (chain) => {
    const ethIsToken0 = chain.ethIsToken0;
    const pairContract = chain.ethUsdtPair;

    const dexReserves = await pairContract.methods.getReserves().call();
    let ethReserve = ethIsToken0 ? dexReserves[0] : dexReserves[1];
    ethReserve = ethers.formatEther(ethReserve.toString());
    let usdtReserve = ethIsToken0 ? dexReserves[1] : dexReserves[0];
    usdtReserve = ethers.formatUnits(usdtReserve.toString(), 6);
    const ethPriceOnDex = usdtReserve / ethReserve;

    return ethPriceOnDex;
}

app.get('/', async (req, res) => {
    return res.send({ message: "Api doc" })
})

app.get('/eth/maxx', async (req, res) => {
    const ethIsToken0 = "false";
    const dexPairAddress = "0xb618708643490df2f3F90149b27954a4bE04F1e4";
    const chainId = "1"
    const chain = getChain(chainId)
    const web3 = chain.web3
    const pairContract = new web3.eth.Contract(IPair.abi, dexPairAddress);

    const dexReserves = await pairContract.methods.getReserves().call();
    let ethReserve = ethIsToken0 ? dexReserves[0] : dexReserves[1];
    ethReserve = ethers.formatEther(ethReserve.toString());
    let maxxReserve = ethIsToken0 ? dexReserves[1] : dexReserves[0];
    maxxReserve = ethers.formatEther(maxxReserve.toString());
    const ethPrice = await getEthPrice(chain)
    const maxxPriceEth = formatDigits(maxxReserve / ethReserve);
    const maxxPriceUsdt = formatDigits(maxxPriceEth * ethPrice);

    return res.send({ "maxx-eth": maxxPriceEth, "maxx-usdt": maxxPriceUsdt })
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})