This is an api to track prices on univ2 dexs

Maxx price on MaxxChain [GET]    
https://priceapi.maxxchain.org/maxxchain/maxx

Maxx price on Bsc [GET]     
https://priceapi.maxxchain.org/bsc/maxx

Maxx price on Ethereum [GET]    
https://priceapi.maxxchain.org/eth/maxx

Pwr price on MaxxChain [GET]    
https://priceapi.maxxchain.org/maxxchain/pwr

Expected result from price endpoints    
```
{
    "maxx-eth": "0.0000001373",
    "maxx-usdt": "0.000226729606181646",
    "supply": "10000000000"
}
```

Get only Maxx supplies [GET]     
https://priceapi.maxxchain.org/getsupplies

Expected response
```
{
    "eth": "10000000",
    "maxxchain": "10000000000",
    "bsc": "200000000000"
}
```

Get sum of all Maxx supplies [GET]     
https://priceapi.maxxchain.org/getsupplies

Expected response
```
5000000
```