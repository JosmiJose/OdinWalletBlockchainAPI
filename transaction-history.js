var express = require('express');
var bodyParser = require('body-parser');
var HookedWeb3Provider = require("hooked-web3-provider");
const contractAddress = require('./libs/contractAddress');
var Web3 = require('web3');
const odinCoin = require('./libs/odinCoinLatest');
const TransferTokens = require('./libs/TransferTokens');
const provider = "http://localhost:6565";
const altProvider = require('./libs/provider');
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


var web3 = new Web3(new Web3.providers.HttpProvider("http://54.218.160.222:8000" || provider));
const contract = web3.eth.contract(odinCoin);
const checkTransfer = web3.eth.contract(TransferTokens);
/**
Function/Module Name : transactionHistory
Purpose : is a GET Api endpoint that allows users to fetch their odin transaction history (inbound and outbound transactions)
Input:  ODIN ContractAddress;
Output :  The transaction history list
**/
app.get('/history/transactionHistory/', function(req, res){
	function transactionHistoryPromise(tokenContractAddress) { // eslint-disable-line no-inner-declarations
  	return new Promise((resolve, reject) => {
    	//const tokenContract = erc20Contract.at(tokenContractAddress)
    	const tokenContract = contract.at(tokenContractAddress);
   	var theParams = {fromBlock: 0, toBlock: 'latest'};
   	var allResult = [];

    	var transferEvent = tokenContract.Transfer({},theParams);
    	transferEvent.watch(function(err, result)
     	{
          	if (err) return reject(err);
          	var items = {};
          	items.records = result;
            	items.status = true;
          	allResult.push(items);

            	return resolve(allResult);
     	});
  	});
	}
  var AllOdinBalancePromise = new Promise((resolve, reject) =>
   	{
      	var theResult = transactionHistoryPromise(contractAddress);
      	resolve(theResult);

   	});

  AllOdinBalancePromise.then(function(theResult)
  	{
    	res.send(theResult);

  	})
  });
	/**
	Function/Module Name : transactionHistoryAccount
	Purpose : is a POST Api endpoint that allows users to fetch their odin transaction history (inbound and outbound transactions) by address
	Input:  ODIN ContractAddress, user's address;
	Output :  The transaction history list by user's address
	**/
  app.post('/history/transactionHistoryAccount', function(req, res){

	const theAccount = req.body.theAccount;
	function transactionHistoryPromise(tokenContractAddress, myaccount) { // eslint-disable-line no-inner-declarations
  	return new Promise((resolve, reject) => {
    	//const tokenContract = erc20Contract.at(tokenContractAddress)
    	const tokenContract = contract.at(tokenContractAddress);
   	var theParams = {fromBlock: 0, toBlock: 'latest'};
   	var allResult = [];

    	var transferEvent = tokenContract.Transfer({},theParams);
    	transferEvent.watch(function(err, result)
     	{
          	if (err) return reject(err);
          	if(result){
            	if (myaccount == "*" || myaccount == result.args.from || myaccount == result.args.to) {
          	var items = {};
          	items.transactionHash = result.transactionHash;
          	items.fromAddress = result.args.from;
          	items.toAddress = result.args.to;
          	items.amount = result.args.value.c[0].toString();
          	items.gasUsed = web3.fromWei(web3.eth.getBlock(result.blockNumber).gasUsed, "ether");
          	items.timestamp = new Date( web3.eth.getBlock(result.blockNumber).timestamp * 1000).toGMTString();
          	var format = {};
          	format.result = items;
          	format.status = true;
          	allResult.push(format);
          	return resolve(allResult);
            	}

	}
  	});
	})
	}
  var AllOdinBalancePromise = new Promise((resolve, reject) =>
   	{
      	var theResult = transactionHistoryPromise(contractAddress, theAccount);
      	resolve(theResult);

   	});

  AllOdinBalancePromise.then(function(theResult)
  	{
    	res.send(theResult);

  	})
  });

	/**
	Function/Module Name : getPREICOTxStatus
	Purpose : is a POST Api endpoint that allows Pre ICO companies to verify the payment of listing fee in ODIN
	Input:  tx_hash, contract_address, amount, to_address;
	Output :  The payment confirmation Status
	**/
app.post('/history/getPREICOTxStatus', function(req, res){
  try
  {
	web3.setProvider(new Web3.providers.HttpProvider("http://54.218.160.222:8000"));
	//http://172.31.8.236:6565
	//web3.setProvider(new web3.providers.HttpProvider('http://172.31.11.42:7575', 0, odinuser, "6wCUuLHULCFxFZfh"));
	const tx_hash = req.body.tx_hash;
	const contract_address = req.body.contract_address.toLowerCase();
	console.log(contract_address);
	const to_address = req.body.to_address.toLowerCase();
	const amount = req.body.amount;

	var txreceipt = web3.eth.getTransactionReceipt(tx_hash);
	//var ver_contract_address = web3.eth.getTransaction(tx_hash).to;
	//console.log(ver_contract_address);
	var ver_contract_address = web3.eth.getTransactionReceipt(tx_hash).to;
	//console.log(contractAddr);
	var ver_amount;
	var ver_to_address;
	/*function getToAddressPromise(tokenContractAddress,txHash ) { // eslint-disable-line no-inner-declarations
  	return new Promise((resolve, reject) => {

	})
  }*/

  var getAddressPromise = new  Promise((resolve, reject) =>
   	{
     	const  blockNumber = web3.eth.blockNumber;
     	var resObj = {};
  	const PreICOContract = contract.at(contract_address);
   	var theParams = {fromBlock: 5615165, toBlock: blockNumber};
   	var exchangeEvent = PreICOContract.Transfer({},theParams);
    	exchangeEvent.watch(function(err, result)
     	{
          	if (err) return reject(err);
          	if(result){
            	if (tx_hash == result.transactionHash) {

          	resObj.transactionHash = result.transactionHash;
          	resObj.toAddress = result.args.to;
          	resObj.amount = result.args.value.c[0];
          	//resObj.gasUsed = web3.eth.getBlock(result.blockNumber).gasUsed;
          	//resObj.timestamp = new Date( web3.eth.getBlock(result.blockNumber).timestamp * 1000).toUTCString();
          	//resObjF.push(resObj);
          	//console.log(result);
          	//resFinObj.push(resObj)
          	return resolve(resObj);
            	}

	}
  	});
	})

  	getAddressPromise.then(function(resObj){
    	console.log(resObj);
    	ver_to_address = resObj.toAddress;
    	ver_amount = resObj.amount;
    	//onsole.log(FormatJSON);  var resObj = {};
    	if (txreceipt.status == 0x1)
    	{
      	var respSuccess = {};
      	respSuccess.Tx_Status = "success"
       	if (amount == ver_amount && contract_address == ver_contract_address && to_address == ver_to_address)
       	{
          	respSuccess.Tx_ToAddress = "MATCHED";
          	respSuccess.Tx_AmountMessage = "Amount = Actual Amount";
          	respSuccess.Tx_Ticker = "MATCHED"
          	res.send(respSuccess);
        	}
        	if (amount == ver_amount && contract_address != ver_contract_address && to_address == ver_to_address)
        	{
           	respSuccess.Tx_ToAddress = "MATCHED";
           	respSuccess.Tx_AmountMessage = "Amount = Actual Amount";
           	respSuccess.Tx_Ticker = "NOT MATCHED"
           	res.send(respSuccess);
         	}
         	if (amount == ver_amount && contract_address == ver_contract_address && to_address != ver_to_address)
         	{
            	respSuccess.Tx_ToAddress = "NOT MATCHED";
            	respSuccess.Tx_AmountMessage = "Amount = Actual Amount";
            	respSuccess.Tx_Ticker = "MATCHED"
            	res.send(respSuccess);
          	}
          	if (amount == ver_amount && contract_address != ver_contract_address && to_address != ver_to_address)
          	{
             	respSuccess.Tx_ToAddress = "NOT MATCHED";
             	respSuccess.Tx_AmountMessage = "Amount = Actual Amount";
             	respSuccess.Tx_Ticker = "NOT MATCHED"
             	res.send(respSuccess);
           	}


           	if (amount > ver_amount && contract_address == ver_contract_address && to_address == ver_to_address)
       	{
          	respSuccess.Tx_ToAddress = "MATCHED";
          	respSuccess.Tx_AmountMessage = "Amount > Actual Amount";
          	respSuccess.Tx_Ticker = "MATCHED"
          	res.send(respSuccess);
        	}
        	if (amount > ver_amount && contract_address != ver_contract_address && to_address == ver_to_address)
        	{
           	respSuccess.Tx_ToAddress = "MATCHED";i
           	respSuccess.Tx_AmountMessage = "Amount > Actual Amount";
           	respSuccess.Tx_Ticker = "NOT MATCHED"
           	res.send(respSuccess);
         	}
         	if (amount > ver_amount && contract_address == ver_contract_address && to_address != ver_to_address)
         	{
            	respSuccess.Tx_ToAddress = "NOT MATCHED";
            	respSuccess.Tx_AmountMessage = "Amount > Actual Amount";
            	respSuccess.Tx_Ticker = "MATCHED"
            	res.send(respSuccess);
          	}
          	if (amount > ver_amount && contract_address != ver_contract_address && to_address != ver_to_address)
          	{
             	respSuccess.Tx_ToAddress = "NOT MATCHED";
             	respSuccess.Tx_AmountMessage = "Amount > Actual Amount";
             	respSuccess.Tx_Ticker = "NOT MATCHED"
             	res.send(respSuccess);
           	}


           	if (amount < ver_amount && contract_address == ver_contract_address && to_address == ver_to_address)
       	{
          	respSuccess.Tx_ToAddress = "MATCHED";
          	respSuccess.Tx_AmountMessage = "Amount < Actual Amount";
          	respSuccess.Tx_Ticker = "MATCHED"
          	res.send(respSuccess);
        	}
        	if (amount < ver_amount && contract_address != ver_contract_address && to_address == ver_to_address)
        	{
           	respSuccess.Tx_ToAddress = "MATCHED";
           	respSuccess.Tx_AmountMessage = "Amount < Actual Amount";
           	respSuccess.Tx_Ticker = "NOT MATCHED"
           	res.send(respSuccess);
         	}
         	if (amount < ver_amount && contract_address == ver_contract_address && to_address != ver_to_address)
         	{
            	respSuccess.Tx_ToAddress = "NOT MATCHED";
            	respSuccess.Tx_AmountMessage = "Amount < Actual Amount";
            	respSuccess.Tx_Ticker = "MATCHED"
            	res.send(respSuccess);
          	}
          	if (amount < ver_amount && contract_address != ver_contract_address && to_address != ver_to_address)
          	{
             	respSuccess.Tx_ToAddress = "NOT MATCHED";
             	respSuccess.Tx_AmountMessage = "Amount < Actual Amount";
             	respSuccess.Tx_Ticker = "NOT MATCHED"
             	res.send(respSuccess);
           	}


	}
   	if (txreceipt.status == 0x0) {
     	var stats ={}
     	stats.Tx_Status = "fail"
     	stats.Tx_ToAddress = "NULL";
     	stats.Tx_AmountMessage = "NULL";
     	stats.Tx_Ticker = "NULL"
     	res.send(status);
   	}
    	})
   if (txreceipt == null ){
 	var progress = {};
 	progress.Tx_Status = "pending"
 	progress.Tx_ToAddress = "NULL";
 	progress.Tx_AmountMessage = "NULL";
 	progress.Tx_Ticker = "NULL"
 	res.send(progress);
   }
  }
  catch(err){
	console.log(err.message)
	var progress = {};
 	progress.Tx_Status = "Invalid TransactionHash"
 	progress.Tx_ToAddress = "NULL";
 	progress.Tx_AmountMessage = "NULL";
 	progress.Tx_Ticker = "NULL";
 	res.send(progress);
  }
	finally{
		var time = new Date(Date.now()).toUTCString();
    console.log("transaction-history.js [getPREICOTxStatus] Executed at UTC Time :" + time);
  }
});

app.listen(8777, function(err){
	if (!err) {
    	console.log("Server is Running on port 8777");
	}
  });
