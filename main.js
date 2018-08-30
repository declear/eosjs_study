// for eosknightsio

const util = require('util')
const Eos = require('eosjs');

const config = {
    expireInSeconds: 60,
    broadcast: true,
    debug: false,
    sign: true,
    // mainNet bp endpoint    
    httpEndpoint: 'https://eos.greymass.com:443',    
    // mainNet chainId
    chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
};

const eos = Eos(config);

if(process.argv.length <= 2) {
    console.log('please input your account.');
    return;
}   

const EOS_KNIGHTS_IO = "eosknightsio";
const POS = 0;
const OFFSET = 499;
const ENABLE_ROUND = true;
const ENABLE_TOTAL = true;

// input yours accounts
var ACCOUNTS = [];
process.argv.slice(2).forEach(param => {
    ACCOUNTS.push( param );
});

var accountSendedEos = 0.0, accountReceivedEos = 0.0;
var totalSendedEos = 0.0, totalReceivedEos = 0.0;
var numLastActions = 0;

function findTransfer(actions, account) {
    var sendEosData = [], recvEosData = [];
    var action_digest_unique = [];
    actions.forEach(action => {
        if(action_digest_unique.includes(action.action_trace.receipt.act_digest))
            return;

        to = action.action_trace.act.data.to;        
        from = action.action_trace.act.data.from;

        if(to == EOS_KNIGHTS_IO && from == account) {
            sendEosData.push(action.action_trace.act.data);
        }
        else if(to == account && from == EOS_KNIGHTS_IO) {
            recvEosData.push(action.action_trace.act.data);
        }

        action_digest_unique.push(action.action_trace.receipt.act_digest);
    });
    return [sendEosData, recvEosData];    
}

function calculateEos(sendList, receiveList) {
    var sendedEos = 0.0, receivedEos = 0.0;
    //console.log("The num of action [send eos] : " + sendList.length);
    sendList.forEach(data => {
        if(data.quantity == undefined || typeof(data.quantity) != "string")
            return;

        //console.log(data.quantity);
        sendedEos += parseFloat(data.quantity.split("EOS")[0]);
    });

    //console.log("The num of action [receive eos] : " + receiveList.length);
    receiveList.forEach(data => {
        if(data.quantity == undefined || typeof(data.quantity) != "string")
            return;

        //console.log(data.quantity);
        receivedEos += parseFloat(data.quantity.split("EOS")[0]);
    });

    return [sendedEos, receivedEos];
}

function procResponse(response, account) {
    if(response == undefined || response.actions == undefined || response.actions.length <= 0) {
        console.log("response is invalid.");
        return;
    }

    var actions = response.actions;
    //console.log("Number of actions(ack) : " + actions.length);

    numLastActions = actions.length;
    
    [sendList, receiveList] = findTransfer(actions, account);
    [sendedEos, receivedEos] = calculateEos(sendList, receiveList);

    accountSendedEos += sendedEos;
    accountReceivedEos += receivedEos;
}

//console.log("Account : " + ACCOUNT);
//console.log("Number of actions(req) : " + (OFFSET - POS + 1));

async function getActions(a, p, o) {
    return eos.getActions(a, p, o)
        .then(response => procResponse(response, a))      
        .catch(error => console.error(error));
}

async function splitExecution(a, p, o) {
    var curPos = p;
    while(true) {
        await getActions(a, curPos, o);
        console.log('.')
        if(numLastActions < OFFSET + 1) {
            break;
        }

        curPos += OFFSET + 1;        
    }

    if(ENABLE_ROUND) {
        accountSendedEos = Math.round(accountSendedEos * 100) / 100;
        accountReceivedEos = Math.round(accountReceivedEos * 100) / 100;
    }

    console.log("account : " + a + " [" + accountSendedEos + "]" + "[" + accountReceivedEos + "]");

    if(ENABLE_TOTAL) {
        totalSendedEos += accountSendedEos;
        totalReceivedEos += accountReceivedEos;
    }

    accountSendedEos = accountReceivedEos = 0.0;
}

async function start(a, p, o) {    
    var curAccountIdx = 0;
    while(ACCOUNTS.length > curAccountIdx) {        
        await splitExecution(ACCOUNTS[curAccountIdx], POS, OFFSET);
        curAccountIdx++;        
    }

    if(ENABLE_TOTAL) {
        console.log("total : " + " [" + totalSendedEos + "]" + "[" + totalReceivedEos + "]");
    }
    console.log('THANK YOU. FOR EOS');
}

start(ACCOUNTS, POS, OFFSET);

/*
eos.getBlock(13496583).then(result => console.log(result)).catch(error => console.error(error));
*/

/*
eos.getTransaction('59a871afd4abe534b49f8160c6e2ba1397f8e300d69012a76d826186133348a8', 13496583)
	.then(function(result) {
		console.log(util.inspect(result, false, null));
	}).catch(error => console.error(error))
*/

/*
eos.getAccount(ACCOUNT)
    .then(result => console.log(result))
    .catch(error => console.error(error));
*/

/*	
eos.getCurrencyBalance('eosio.token', ACCOUNT, 'EOS')
.then(result => console.log(result))
.catch(error => console.error(error));
*/