
var express = require('express');
var bodyParser = require('body-parser');
const lightwallet  = require('eth-lightwallet');
var currentPassword;
var HookedWeb3Provider = require("hooked-web3-provider");
var Web3 = require('web3');
const hdPath =  require('./libs/path');
const SignerProvider = require('ethjs-provider-signer');
const setWeb3Provider = require('./libs/setWeb3Provider');
const provider = require('./libs/provider');
const rpcAddress = require('./libs/provider');
var passwordHash = require('sha256');
var TransferTokens = require('./libs/TransferTokens');
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


var web3 = new Web3(new Web3.providers.HttpProvider(provider));
/**
Function/Module Name : gasMinimum
Purpose : is a GET Api endpoint that determines the minimum gas for eth and ERC20 tokens and returns to the user
Input: gasPrice and Gaslimit
Output :  Minimum gas needed in ether
**/
app.get('/transactions/gasMinimum', function(req, res){
     const gasPrice = web3.eth.gasPrice.toNumber() * 1.40;
     const gasLimit = 200000;
     var minimum = gasPrice*gasLimit;
     minimum = minimum * Math.pow(10, -18);
     var minimumGas = {};
      minimumGas.gas = minimum;
     res.send(minimumGas);

});

/**
Function/Module Name : sendTokens
Purpose : is a POST Api endpoint that allows users to send Odin and other ERC20 tokens
Input: passphrase , amount, gasprice,  tokenToSend, contractAddress
Output :  The transaction Hash of the sent transaction
**/

app.post('/transactions/sendTokens', function(req, res){
  //Send Transaction Code
  try {
  web3.setProvider(new Web3.providers.HttpProvider(provider));
    //const contract = web3.eth.contract(odinCoin);
  //const fromAddress = req.body.fromAddress;

  const password = passwordHash(req.body.password);
  const amount  = req.body.amount;
  const toAddress = req.body.toAddress;
  const gasPrice = web3.eth.gasPrice.toNumber() * 2;
  console.log(gasPrice)
// console.log(req.body.contractAbi);
  const tokenToSend = req.body.tokenToSend;
  const contractAddress = req.body.contractAddress;
  const contract = web3.eth.contract(TransferTokens);
  //const DefaultContract = web3.eth.contract(TransferTokens);
  var keystore = lightwallet.keystore.deserialize(req.body.keystore);
 //const password = prompt('Please enter keystore password', 'Password');

  keystore.keyFromPassword(password, function(err, pwDerivedKey) {
    //global_keystore = ks;
    var seed = keystore.getSeed(pwDerivedKey);
    keystore.passwordProvider = (callback) => {
      // we cannot use selector inside this callback so we use a connst value
      const ksPassword = password;
      callback(null, ksPassword);
    };
    //
    const ksPassword = password;
      if (!keystore)
       {
         throw new Error('No keystore found - please create wallet');
      }
    const fromAddress = keystore.getAddresses()[0];
    if (keystore)
    {
      //The transaction signer provider
        const NewProvider = new SignerProvider(rpcAddress, {
        signTransaction: keystore.signTransaction.bind(keystore),
        accounts: (cb) => cb(null,keystore.getAddresses()),
      });

      web3.setProvider(NewProvider);
    }


     //console.log(fromAddress);

      // any other token
      //const contractAddress = contractAddr;

      //const decimals = 18;
      const maxGasForTokenSend = 100000;
      //
      //const odinTokenAddress = '0x6b907fc0487695054911032adfce020aec7cbd26';
      const sendParams = { from: fromAddress, value: '0x0', gasPrice, gas: maxGasForTokenSend};
      //const tokenAmount = amount*10*Math.pow(10, 18);
      //const tokenAmount = amount*10**18; // Big Number

      function sendTokenPromise(tokenContractAddress, sendToAddress, sendAmount, params) { // eslint-disable-line no-inner-declarations
        return new Promise((resolve, reject) => {
          //const tokenContract = erc20Contract.at(tokenContractAddress)
          //
          const contract = web3.eth.contract(TransferTokens);
          const transferContract = contract.at(tokenContractAddress);

          //const tokenContract = web3.eth.contract(contractAbi).at(tokenContractAddress);
          //const BeepTokenSend = BeepTokenContract.at(tokenContractAddress)

          transferContract.transfer.sendTransaction(sendToAddress, sendAmount, params, (err, sendTx) => {
            if (err) {
		            console.log(err);
                resolve(err);
		            return reject(err);
		            }
            console.log("sent");
            return resolve(sendTx);
          });
          //return resolve("success");
        });
      }
      var SendTokens = new Promise(function(resolve, reject){
        var tx = sendTokenPromise(contractAddress, toAddress, amount, sendParams);
        resolve(tx);
      });

      SendTokens.then(function(tx){
        var OdintxHash = {}
        OdintxHash['result'] = tx;
        OdintxHash['status'] = true;
        OdintxHash['timestamp'] = Date.now();
        //items.walletID = walletID;
        //seedObj.push(items);
         res.send(OdintxHash);
        //res.send(tx);
      });

     SendTokens.catch(function(err)
     {
     var txSt={};
     txSt.status = false;
     res.send(txSt)
   });
  })
}
  catch (err)
    {
      console.log(err.message);
      var txStatus = {};
      txStatus.status = false;
      console.log(txStatus);
      res.send(txStatus);
    }

});


app.listen(9091, function(err){
  if (!err) {
      console.log("Server is Running on port 9091");
  }
});
