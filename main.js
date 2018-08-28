const util = require('util')
const Eos = require('eosjs');

const config = {
    expireInSeconds: 60,
    broadcast: true,
    debug: false,
    sign: true,
    // mainNet bp endpoint
    httpEndpoint: 'https://api.eosnewyork.io',
    // mainNet chainId
    chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
};

const eos = Eos(config);

const account = 'youraccount1';

// Promise
/*
eos.getAccount(account)
    .then(result => console.log(result))
    .catch(error => console.error(error));
*/

/*	
eos.getCurrencyBalance('eosio.token', account, 'EOS')
.then(result => console.log(result))
.catch(error => console.error(error));
*/

/*
eos.getActions(account, 0, 1)
	.then(result => console.log(result))
	.catch(error => console.error(error));
*/

/*
eos.getBlock(13496583).then(result => console.log(result)).catch(error => console.error(error));
*/

/*
eos.getTransaction('59a871afd4abe534b49f8160c6e2ba1397f8e300d69012a76d826186133348a8', 13496583)
	.then(function(result) {
		console.log(util.inspect(result, false, null));
	}).catch(error => console.error(error))
*/