const express = require('express')
const app = express()
const ethers = require("ethers");
const Web3 = require("web3");
const IPair = require("@uniswap/v2-core/build/IUniswapV2Pair.json");
const fetch = require("node-fetch");

require('dotenv').config();

const port = process.env.PORT || 3000

const chains = {
    1: {
        rpc: "https://mainnet.infura.io/v3/f3f30b367c6c45c093d0a7c7bd7709fa",
        ethUsdtPair: {},
        ethUsdtPairAddy: "0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852",
        ethIsToken0: true,
        usdtDecimal: 6,
        web3: {}
    },
    56: {
        rpc: "https://snowy-flashy-smoke.bsc.discover.quiknode.pro/1067ac2b5b640476b1890931b502c4b133b81cb9/",
        ethUsdtPair: {},
        ethUsdtPairAddy: "0x16b9a82891338f9bA80E2D6970FddA79D1eb0daE",
        ethIsToken0: false,
        usdtDecimal: 18,
        web3: {}
    },
    10201: {
        rpc: "https://mainrpc.maxxchain.org",
        ethUsdtPair: {},
        ethUsdtPairAddy: "0x217a7522feda3cea46744645e6329c784606bdc9",
        ethIsToken0: false,
        usdtDecimal: 18,
        web3: {}
    },
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
    const web3 = new Web3(chain.rpc)
    chain.web3 = web3
    chain.ethUsdtPair = new web3.eth.Contract(IPair.abi, chain.ethUsdtPairAddy)
    return chain
}

const getEthPrice = async (chain) => {
    const ethIsToken0 = chain.ethIsToken0;
    const pairContract = chain.ethUsdtPair;

    const dexReserves = await pairContract.methods.getReserves().call();
    let ethReserve = ethIsToken0 ? dexReserves[0] : dexReserves[1];
    ethReserve = ethers.formatEther(ethReserve.toString());
    let usdtReserve = ethIsToken0 ? dexReserves[1] : dexReserves[0];
    usdtReserve = ethers.formatUnits(usdtReserve.toString(), chain.usdtDecimal);
    const ethPriceOnDex = usdtReserve / ethReserve;

    return ethPriceOnDex;
}

app.get('/', async (req, res) => {
    return res.send({ message: "Api doc" })
})

const getSupply = async (addr, burnAddr, chainId) => {
    const chain = getChain(chainId)
    const web3 = chain.web3
    const tokenContract = new web3.eth.Contract(IPair.abi, addr);

    const burnSupply = ((await tokenContract.methods.balanceOf(burnAddr).call()) / 1e18).toString()
    const totalSupply = ((await tokenContract.methods.totalSupply().call()) / 1e18).toString()

    return (totalSupply - burnSupply)
}

app.get('/totalsupplies', async (req, res) => {
    const maxxAddrEth = "0x966e770030209C95F974f37Edbde65D98e853354"
    const burnAddr = "0x000000000000000000000000000000000000dEaD"

    const maxxAddrBsc = "0x3e61c7fB137765E7CfCC4399d2D7D5Bc1838D6b1"
    const maxxAddrMaxxChain = "0x25490a833a22050deae49647d0c264e1960ff8e0"

    const eth = await getSupply(maxxAddrEth, burnAddr, 1)
    const bsc = await getSupply(maxxAddrBsc, burnAddr, 56)
    const maxxchain = await getSupply(maxxAddrMaxxChain, burnAddr, 10201)
    return res.send({supply: (eth + bsc)})
})

app.get('/getsupplies', async (req, res) => {
    const maxxAddrEth = "0x966e770030209C95F974f37Edbde65D98e853354"
    const burnAddr = "0x000000000000000000000000000000000000dEaD"

    const maxxAddrBsc = "0x3e61c7fB137765E7CfCC4399d2D7D5Bc1838D6b1"
    const maxxAddrMaxxChain = "0x25490a833a22050deae49647d0c264e1960ff8e0"

    const eth = await getSupply(maxxAddrEth, burnAddr, 1)
    const bsc = await getSupply(maxxAddrBsc, burnAddr, 56)
    const maxxchain = await getSupply(maxxAddrMaxxChain, burnAddr, 10201)
    return res.send({ eth, maxxchain, bsc })
})

app.get('/eth/maxx', async (req, res) => {
    const ethIsToken0 = false;
    const dexPairAddress = "0xb618708643490df2f3F90149b27954a4bE04F1e4";
    const maxxAddr = "0x966e770030209C95F974f37Edbde65D98e853354"
    const burnAddr = "0x000000000000000000000000000000000000dEaD"
    const chainId = "1"
    const chain = getChain(chainId)
    const web3 = chain.web3
    const pairContract = new web3.eth.Contract(IPair.abi, dexPairAddress);

    const totalSupply = await getSupply(maxxAddr, burnAddr, chainId)
    const dexReserves = await pairContract.methods.getReserves().call();
    let ethReserve = ethIsToken0 ? dexReserves[0] : dexReserves[1];
    ethReserve = ethers.formatEther(ethReserve.toString());
    let maxxReserve = ethIsToken0 ? dexReserves[1] : dexReserves[0];
    maxxReserve = ethers.formatEther(maxxReserve.toString());
    const ethPrice = await getEthPrice(chain)
    const maxxPriceEth = formatDigits(ethReserve / maxxReserve);
    const maxxPriceUsdt = formatDigits(maxxPriceEth * ethPrice);

    return res.send({ "maxx-eth": maxxPriceEth, "maxx-usdt": maxxPriceUsdt, totalSupply })
})

app.get('/bsc/maxx', async (req, res) => {
    const ethIsToken0 = false;
    const dexPairAddress = "0x6b3EcA3f6fa6b36d8277b201EDE9c0Ed6A2779e7";
    const maxxAddr = "0x3e61c7fB137765E7CfCC4399d2D7D5Bc1838D6b1"
    const burnAddr = "0x000000000000000000000000000000000000dEaD"
    const chainId = "56"
    const chain = getChain(chainId)
    const web3 = chain.web3
    const pairContract = new web3.eth.Contract(IPair.abi, dexPairAddress);

    const totalSupply = await getSupply(maxxAddr, burnAddr, chainId)
    const dexReserves = await pairContract.methods.getReserves().call();
    let ethReserve = ethIsToken0 ? dexReserves[0] : dexReserves[1];
    ethReserve = ethers.formatEther(ethReserve.toString());
    let maxxReserve = ethIsToken0 ? dexReserves[1] : dexReserves[0];
    maxxReserve = ethers.formatEther(maxxReserve.toString());
    const ethPrice = await getEthPrice(chain)
    const maxxPriceEth = formatDigits(ethReserve / maxxReserve);
    const maxxPriceUsdt = formatDigits(maxxPriceEth * ethPrice);

    return res.send({ "maxx-bnb": maxxPriceEth, "maxx-usdt": maxxPriceUsdt, totalSupply })
})

app.get('/maxxchain/maxx', async (req, res) => {
    const ethIsToken0 = false;
    const dexPairAddress = "0x5bDE6210f307596c64189291D0b61f769863bC52";
    const maxxAddr = "0x25490a833a22050deae49647d0c264e1960ff8e0"
    const burnAddr = "0x000000000000000000000000000000000000dEaD"
    const chainId = "10201"
    const chain = getChain(chainId)
    const web3 = chain.web3
    const pairContract = new web3.eth.Contract(IPair.abi, dexPairAddress);

    const totalSupply = await getSupply(maxxAddr, burnAddr, chainId)
    const dexReserves = await pairContract.methods.getReserves().call();
    let ethReserve = ethIsToken0 ? dexReserves[0] : dexReserves[1];
    ethReserve = ethers.formatEther(ethReserve.toString());
    let maxxReserve = ethIsToken0 ? dexReserves[1] : dexReserves[0];
    maxxReserve = ethers.formatEther(maxxReserve.toString());
    const ethPrice = await getEthPrice(chain)
    const maxxPriceEth = formatDigits(ethReserve / maxxReserve);
    const maxxPriceUsdt = formatDigits(maxxPriceEth * ethPrice);

    return res.send({ "maxx-pwr": maxxPriceEth, "maxx-usdt": maxxPriceUsdt, totalSupply })
})

app.get('/maxxchain/pwr', async (req, res) => {
    // const chainId = "10201"
    // const chain = getChain(chainId)
    let ethPrice = 0//await getEthPrice(chain)

    const price = (
        await (await fetch(`https://api.coinstore.com/api/v1/ticker/price;symbol=PWRUSDT`)).json()
    ).data[0].price;
    const ethPriceOnCex = Number(price);

    if (ethPriceOnCex) {
        ethPrice = ethPriceOnCex;
    }

    return res.send({ "pwr-usdt": ethPrice })
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})