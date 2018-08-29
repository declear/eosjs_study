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

const EOS_KNIGHTS_IO = "eosknightsio";

// input yours
const ACCOUNT = 'youraccount1';
const RANGE_START_POS = 0;
const RANGE_END_POS = 1000;

function findTransfer(actions) {
    var sendEosTrx = [], recvEosTrx = [];
    actions.forEach(action => {
        to = action.action_trace.act.data.to;        
        from = action.action_trace.act.data.from;

        if(to == EOS_KNIGHTS_IO && from == ACCOUNT) {
            sendEosTrx.push(action.action_trace.act.data);
        }
        else if(to == ACCOUNT && from == EOS_KNIGHTS_IO) {
            recvEosTrx.push(action.action_trace.act.data);
        }
    });
    return [sendEosTrx, recvEosTrx];    
}

function calculateEos(sendList, receiveList) {
    var totalSended = 0.0, totalReceived = 0.0;
    console.log("The num of action [send eos] : " + sendList.length);
    sendList.forEach(data => {
        if(data.quantity == undefined || typeof(data.quantity) != "string")
            return;

        //console.log(data.quantity);
        totalSended += parseFloat(data.quantity.split("EOS")[0]);
    });

    console.log("The num of action [receive eos] : " + receiveList.length);
    receiveList.forEach(data => {
        if(data.quantity == undefined || typeof(data.quantity) != "string")
            return;

        //console.log(data.quantity);
        totalReceived += parseFloat(data.quantity.split("EOS")[0]);
    });

    return [totalSended, totalReceived];
}

function procResponse(response) {
    if(response == undefined || response.actions == undefined || response.actions.length <= 0) {
        console.log("response is invalid.");
        return;
    }

    var actions = response.actions;
    console.log("Number of actions(ack) : " + actions.length);
    
    [sendList, receiveList] = findTransfer(actions);
    [totalSended, totalReceived] = calculateEos(sendList, receiveList);

    console.log("total sended : " + totalSended);
    console.log("total received : " + totalReceived);
}

console.log("Account : " + ACCOUNT);
console.log("Number of actions(req) : " + (RANGE_END_POS - RANGE_START_POS + 1));

eos.getActions(ACCOUNT, RANGE_START_POS, RANGE_END_POS)
    .then(response => procResponse(response))      
    .catch(error => console.error(error));
    
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