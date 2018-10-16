var express = require('express');
var bodyParser = require('body-parser');
var HookedWeb3Provider = require("hooked-web3-provider");
const contractAddress = require('./libs/contractAddress');
var Web3 = require('web3');
const odinCoin = require('./libs/odinCoinLatest');
const provider = require('./libs/provider');
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Initialize the web3 provider using localhost RPC and an Infura RPC Fallback   http://localhost:6565
var web3 = new Web3(new Web3.providers.HttpProvider(provider));
const contract = web3.eth.contract(odinCoin);
const TransferTokens = require('./libs/TransferTokens');
const CheckBal = web3.eth.contract(TransferTokens);


/**
Function/Module Name : checkBalances
Purpose : is a POST Api endpoint that determines Transaction status of eth and ERC20 tokens
Input: user's Ethereum address
Output :  the user's Ether and Odin Balance
**/

app.post('/balances/checkBalances', function(req, res){
    try
    {

         //var keystore = lightwallet.keystore.deserialize(req.body.keystore);
          var address = req.body.address;
          if (address == null){
               res.send("Kindly provide the user's Address");
            }
            /**
            OdinBalancePromise is an assynchornous function that accepts user address and Odin Contract address
            It returns the numeric value of the  user's  Odin and Ether Balance
            **/

      function OdinBalancePromise(user_addr, contract_addr) {
        return new Promise((resolve, reject) => {
              var ethBalance = web3.eth.getBalance(user_addr);
              ethBalance = ethBalance.toNumber();
              ethBalance = ethBalance * Math.pow(10, -18);
              console.log("User's ETH balance is" + " "  + ethBalance)
              const tokenContract = contract.at(contract_addr);
              var odinBalance = tokenContract.balanceOf.call(user_addr);
              odinBalance = odinBalance.c[0];
              console.log("User's ODIN balance is" + " " + odinBalance);
              var output =
            {
              ethBalance : ethBalance,
              odinBalance : odinBalance
            }
              return resolve(output);
            });
          }
            var ResultPromise = new Promise((resolve, reject) => {
              var balanceDetails = OdinBalancePromise(address,contractAddress)
              resolve(balanceDetails);
            })
            ResultPromise.then(function(balanceDetails){
              res.send(balanceDetails);
            })
      }
    catch(err){
              console.log(err.message);
              res.send(err.message);
            }
    finally{
              var time = new Date(Date.now()).toUTCString();
               //console.log(time);
              console.log("CheckBalances.js [checkBalances] is executed at UTC Time :" + time);
	}
});

/**
Function/Module Name : TokenBalances
Purpose : A POST  API endpoint for checking the User's Odin PRE-ICO or any ERC20 token balance
Input: the user's Ethereum address
Output : the user's PRE-ICO or ERC20 token Balance
**/

app.post('/balances/TokenBalances', function(req, res){
  try
  {
        var address = req.body.address;
        const TokenContractAddress = req.body.contractAddress;
        const decimals = req.body.decimals;

        if (address == null || TokenContractAddress == null){
        	res.send("Invalid or incorrect input");
	        }
          /**
          tokenBalancesPromise is an assynchornous function that accepts user address and Token contract address
          It returns the numeric value of the  user's  PRE-ICO/ERC20  token Balance
          **/
    function tokenBalancesPromise(user_addr, token_addr, Decimals) {
      return new Promise((resolve, reject) => {
            const OtherToken = contract.at(token_addr);
            const TransferERC = CheckBal.at(token_addr);
            var TokenBalance = TransferERC.balanceOf.call(user_addr).toNumber();
            //console.log(TokenBalance);
             TokenBalance = TokenBalance * Math.pow(10, -Decimals);

            //console.log(TokenBalance);
            var output =
          {
            TokenBalance : TokenBalance

          }
            return resolve(output);
          });
        }
          var ResultPromise = new Promise((resolve, reject) => {
            var balanceDetails = tokenBalancesPromise(address,TokenContractAddress, decimals);
            resolve(balanceDetails);
          })
          ResultPromise.then(function(balanceDetails){
            res.send(balanceDetails);
          })
    }
  catch(err){
//            console.log(err.message);
            res.send(err.message);
          }
  finally{
         var time = new Date(Date.now()).toUTCString();
            console.log("CheckBalances.js [TokenBalances] UTC Response Timestamp : " + time);
  }
});

/**
Function/Module Name : getTxStatus
Purpose : is a POST Api endpoint that determines Transaction status of eth and ERC20 tokens
Input: Transaction Hash
Output : The status of the transaction: "success", "fail", or "pending";
**/
app.post('/balances/getTxStatus', function(req, res){
  try
  {
    web3.setProvider(new Web3.providers.HttpProvider("http://54.218.160.222:8000"));
     const txHash = req.body.txHash;
 web3.eth.getTransactionReceipt(txHash, function(err, receipt){
       if (!err) {
         if (receipt == null) {
         res.send({"status":"pending"});
         } else {
           var receiptStatus = receipt.status;
           if(receiptStatus == 0x1) {
          res.send({"status":"success"});
           }
           else if (receiptStatus == 0x0) {
 	      res.send({"status":"fail"})
         }
       }
     } else {
 	   console.log(err);
     res.send({"error" : "true"});
       }
     });
 }
 finally{
     var time = new Date(Date.now()).toUTCString();
     console.log("CheckBalances.js [getTxStatus] Executed at UTC Time :" + time);
   }
})

app.listen(8010, function(err){
    if (!err) {
        console.log("Server is Running on port 8010");
    }
  });
