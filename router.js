
var express = require('express');
var bodyParser = require('body-parser');
const lightwallet  = require('eth-lightwallet');
var global_keystore ;
var currentPassword;
var HookedWeb3Provider = require("hooked-web3-provider");
var Web3 = require('web3');
const hdPath =  require('./libs/path');
const SignerProvider = require('ethjs-provider-signer');
const setWeb3Provider = require('./libs/setWeb3Provider');
const contractAddress = require('./libs/contractAddress');
const odinCoin = require('./libs/odinCoinLatest');
const provider = require('./libs/provider');
const rpcAddress = require('./libs/provider');
var passwordHash = require('sha256');
var app = express();
var nonceIncrement;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


//var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8080" || provider));
//const web3 = new Web3(new Web3.providers.HttpProvider(provider));
//const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
//Josmi  http://localhost:6565
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8000" || provider));
//const web3 = new Web3(new Web3.providers.HttpProvider(provider));
const contract = web3.eth.contract(odinCoin);
/** generateWallet is an API endpoint that accepts user email and password  to generate a hashed passphrase and an encrypted keystore
    The generated passphrase is always used to unlock the Keystore
    The Keystore contains public keys and a private Key.
    **/
app.post('/generateWallet', function(req,res) {

try
{
  var seedObj = [];
  var promise = new Promise(function (resolve, reject) {
  /*var email = req.body.email;
  var password = req.body.password;*/
  var email = "josmi@nowallworld.com";
  var password = "!ambiliammavan11";
  console.log(email);
  console.log(password);
  password = passwordHash(password);
 console.log("This is the password"+password)
  var seedPhrase = lightwallet.keystore.generateRandomSeed();
/** generate keystore using a random seed and a hashed password **/
    lightwallet.keystore.createVault({
         password: password,
         seedPhrase: seedPhrase,
          hdPathString: hdPath
        /** Optionally provide a 12-word seed phrase
            salt: fixture.salt,
           Optionally provide a salt. A unique salt will be generated otherwise.
             Optional custom HD Path String **/
       }, function (err, ks) {
         global_keystore = ks;
   /** set your provider to keystore to be able to sign Transactions **/
         //setWeb3Provider(global_keystore);
         setWeb3Provider();
  /** Some methods will require providing the `pwDerivedKey`,
      Allowing you to only decrypt private keys on an as-needed basis.
      You can generate that value with this convenient method: **/

        global_keystore.keyFromPassword(password, function (err, pwDerivedKey) {
            if (err) throw err;

    /* generate A new address/private key pairs
       the corresponding private keys are also encrypted */
         global_keystore.generateNewAddress(pwDerivedKey, 1);
            var items = {};

         address = ks.getAddresses().slice(-1)[0];
    //console.log(address);
          items.address = address;
          //console.log("User's address is"+ address);
          var walletID =  web3.eth.iban.fromAddress(address).toString();
          items.walletID = walletID;
          items.seedPhrase = seedPhrase;
    //address = ks.getAddresses().slice(-1)[0];
    //Indexer = ks.getAddresses().length;

          seedObj.push(items);
          resolve(seedObj);

         global_keystore.passwordProvider = function (callback) {
              const pw = prompt('Please enter keystore password', 'Password');
              callback(null, pw);
         };

    /** Now set ks as transaction_signer in the hooked web3 provider
     and you can start using web3 using the keys/addresses in ks! **/
  });
})
})
promise.then(function(data) {
      var result = {}
      result['result'] = seedObj[0]
      result['global_keystore'] = global_keystore.serialize();
      result['status'] = true

      res.send(result);
  });

}
 catch(err){
      console.log("The error is"+ err.message);
}
finally{
  console.log("Router.js Generate Wallet Executed at : " + Date.now());
}
});


app.post('/getHash', function(req,res) {
  try {
   const password = req.body.password;
   var hashedPassword = passwordHash(password);
   res.send(hashedPassword);
   console.log(hashedPassword);
  }
   catch (err)
    {
      console.log(err.message);
      res.send(err.message);
   }
   finally{
     var time = new Date(Date.now()).toUTCString();
     console.log("Router.js [getHash] Executed at" + time);
   }
});

/** genKeystore API endpoint allows a user to import there existing private and public key using seed and a new passphrase **/

app.post('/genKeystore', function(req,res) {
  try {

  /** allow time to render components before cpu intensive tasks: **/

   var resObjItems = {};
   var promise = new Promise(function (resolve, reject) {
   const password = passwordHash(req.body.password);
   const seedPhrase = req.body.seed;
   /*const password = passwordHash("!josmi11");
   const seedPhrase = "silent wash dismiss radio where palm plunge angle balance smoke prison awesome";*/
   lightwallet.keystore.createVault({
     password: password,
     seedPhrase: seedPhrase, // Optionally provide a 12-word seed phrase
     // salt: fixture.salt,     // Optionally provide a salt.// A unique salt will be generated otherwise.
     hdPathString: hdPath    // Optional custom HD Path String
   }, function (err, ks) {
    global_keystore = ks;
    //resolve(global_keystore.serialize())
   // setWeb3Provider(ks);
     // Some methods will require providing the `pwDerivedKey`,
     // Allowing you to only decrypt private keys on an as-needed basis.
     // You can generate that value with this convenient method:
     //ks = new lightwallet.keystore(seedPhrase, password);
     console.log(ks);
     //setWeb3Provider(global_keystore);
     setWeb3Provider();
     //var address = '';
     //var Indexer = 0;
    global_keystore.keyFromPassword(password, function (err, pwDerivedKey) {
       if (err) throw err;
       //ks = new lightwallet.keystore(seedPhrase, pwDerivedKey);
       //console.log(ks);
       // generate five new address/private key pairs
       // the corresponding private keys are also encrypted
      global_keystore.generateNewAddress(pwDerivedKey, 1);
       //address = ks.getAddresses();
       //console.log(address);
       //var resObjItems= {};
       const address = global_keystore.getAddresses().slice(-1)[0];
       console.log(address);

      resObjItems.address = global_keystore.getAddresses().slice(-1)[0]
      resObjItems.keystore = global_keystore.serialize();
      //var prv_key = ks.exportPrivateKey(address, pwDerivedKey);
      //resObjItems.indexer = ks.getAddresses().length
     // retrieveDetails.push(resObjItems)
      resolve(resObjItems);

     global_keystore.passwordProvider = function (callback) {
         const pw = prompt('Please enter keystore password', 'Password');
         callback(null, pw);
       };
       currentPassword = password;
       /** Now set ks as transaction_signer in the hooked web3 provider
       and you can start using web3 using the keys/addresses in ks!
       **/
     });
    });
    });
    promise.then(function(resObjItems) {
    res.send(resObjItems);
    });
} catch (err) {
    const errorString = `genKeystore error - ${err}`;
     console.log(err.message + errorString);
  }
  finally{
    console.log("Router.js GenKeystore Executed at" + Date.now());
  }
})
/**
Function/Module Name : sendTransaction
Purpose : is a POST Api endpoint that allows users to send Odin and Ether holdings
Input: passphrase , amount, gasprice,  tokenToSend, contractAddress, contractABI, keystore
Output :  The transaction Hash of the sent transaction
**/
app.post('/sendTransaction', function(req, res){
  //Send Transaction Code
  try {

      web3.setProvider(new Web3.providers.HttpProvider(provider));
     // const provider = require('./libs/provider');
    //const contract = web3.eth.contract(odinCoin);
  //const fromAddress = req.body.fromAddress;
  const password = passwordHash(req.body.password);
  const amount  = req.body.amount;
  const toAddress = req.body.toAddress;
  const gasPrice = web3.eth.gasPrice.toNumber() * 2;
  const tokenToSend = req.body.tokenToSend;
  var gasLimit = 50000;
  var keystore = lightwallet.keystore.deserialize(req.body.keystore);
 if (amount <= 0){
  res.send("Sorry! You can not send a value less than Zero");
}

 //const password = prompt('Please enter keystore password', 'Password');
  keystore.keyFromPassword(password, function(err, pwDerivedKey) {
    //global_keystore = ks;
    var seed = keystore.getSeed(pwDerivedKey);
    keystore.passwordProvider = (callback) => {
      /** we cannot use selector inside this callback so we use a connst value **/
      const ksPassword = password;
      callback(null, ksPassword);
    };
    //
    const ksPassword = password;
    if (!keystore) {
      throw new Error('No keystore found - please create wallet');
    }
    if (keystore) {
      //The transaction signer provider
      const NewProvider = new SignerProvider(rpcAddress, {
        signTransaction: keystore.signTransaction.bind(keystore),
        accounts: (cb) => cb(null,keystore.getAddresses()),
      });
      web3.setProvider(NewProvider);
    }

    const fromAddress = keystore.getAddresses()[0];
    console.log(fromAddress);

    if (tokenToSend === 'eth') {
      //sending Ether
    var sendAmount = web3.toWei(amount, "ether");
     // if (amount >= web3.eth.getBalance(fromAddress)){
       //res.send("insufficient balance to send");
       //}
   //web3.eth.sendTransaction({from:coinbase, to:newAccount, value: amount});
      //const sendAmount = new BigNumber(amount).times(Ether);
      var sendParams = { from: fromAddress, to: toAddress, value: sendAmount,gasPrice, gas: gasLimit };
      function sendTransactionPromise(params) { // eslint-disable-line no-inner-declarations
        return new Promise((resolve, reject) => {
          web3.eth.sendTransaction(params, (err, data) => {
            if (err !== null) {
		console.log(err);
		return reject(err);
              //res.send(err.message);
		}
            return resolve(data);

          });

        });

      }
      var EthPromise = new Promise(function (resolve, reject) {
        var tx = sendTransactionPromise(sendParams);
        resolve(tx);
      })
    EthPromise.then(function(tx){
      //res.send(tx);
     var txHash = {}
     txHash['result'] = tx;
     txHash['status'] = true;
     txHash['timestamp'] = Date.now();
  //items.walletID = walletID;
  //seedObj.push(items);
     res.send(txHash);
     //console.log(txHash);
      });
    }

    if(tokenToSend === "odin")
    { // any other token
      //const contractAddress = contractAddr;
      const decimals = 0;
      const maxGasForTokenSend = 200000;
      //const odinTokenAddress = '0x6b907fc0487695054911032adfce020aec7cbd26';
     // const sendParams = { from: fromAddress, value: '0x0', gasPrice, gas: maxGasForTokenSend};
      //console.log(fromAddress);

      var sendParams = { from: fromAddress, value: '0x0', gasPrice, gas: maxGasForTokenSend};
      const tokenAmount = amount;

      //const tokenAmount = amount ; // Big Number??

      function sendTokenPromise(tokenContractAddress, sendToAddress, sendAmount, params) { // eslint-disable-line no-inner-declarations
        return new Promise((resolve, reject) => {
          //const tokenContract = erc20Contract.at(tokenContractAddress)
          const contract = web3.eth.contract(odinCoin);
          const tokenContract = contract.at(tokenContractAddress);
	        console.log(sendToAddress, sendAmount)
          tokenContract.transfer.sendTransaction(sendToAddress, sendAmount, params, (err, sendTx) => {
            if (err) {
		            console.log(err);
		            return reject(err);
		            }
            return resolve(sendTx);
          });
        });
      }
      var OdinPromise = new Promise(function (resolve, reject) {
        var tx = sendTokenPromise(contractAddress, toAddress, tokenAmount, sendParams);
        resolve(tx);
      })
      OdinPromise.then(function(tx){
        var OdintxHash = {}
        OdintxHash['result'] = tx;
        OdintxHash['status'] = true;
        OdintxHash['timestamp'] = Date.now();
       // var TxReciept = web3.getTransactionReciept(tx);

         res.send(OdintxHash);

      });

    }
  })
  } catch (err) {
   console.log(err.message);
   res.send(err.message);
  }
finally {
  var time = new Date(Date.now()).toUTCString();
  var nonce = web3.eth.getTransactionCount(keystore.getAddresses()[0]);

  var time = new Date(Date.now()).toUTCString();
  console.log(" Router.js [Send ETH and ODIN] at Unix Time: " + time);

  nonceIncrement = nonce;
  web3.setProvider();
}
});
/**
Function/Module Name : unlockWallet
Purpose : is a POST Api endpoint that allows users to lock their wallet
Input: boolean success;
Output :  The Wallet Locked Status (success)
**/
app.post('/lockWallet', function(req, res){
  var success= new Boolean(false);
  if (!password) {
    throw Error('Wallet Already Locked');
  }
  else{
    currentPassword = "";
    success = true;

  }
res.send(success);
})
/**
Function/Module Name : unlockWallet
Purpose : is a POST Api endpoint that allows users to unlock their wallet after providing the correct passphrase for their keystore
Input: passphrase, keystore;
Output :  The Wallet Unlocked Status
**/
app.post('/unlockWallet', function(req, res){
   const password = passwordHash(req.body.password);
   var keystore = lightwallet.keystore.deserialize(req.body.keystore);

   try
   {
    if (currentPassword) {
      throw Error('Wallet Already unlocked');
    }
    if (!keystore) {
      throw new Error('No keystore to unlock');
    }
    if (!password) {
      throw Error('No password entered');
    }
    const passwordProvider = keystore.passwordProvider;
    function passwordProviderPromise() { /** eslint-disable-line no-inner-declarations **/
      return new Promise((resolve, reject) => {
        passwordProvider((err, data) => {
          if (err !== null) return reject(err);
          return resolve(data);
        });
      });
    }

     /** eslint-disable-line no-inner-declarations **/

        keystore.keyFromPassword(password,function(err, pwDerivedKey) {
          if (err !== null) return reject(err);
          //const pwDerivedKey = keyFromPasswordPromise(authenticator);
          const isPasswordCorrect = keystore.isDerivedKeyCorrect(pwDerivedKey);
          if (!isPasswordCorrect) {
          throw Error('Invalid Password');
           res.send('Invalid Password')
           }
          currentPassword = password;
         res.send("Successfully Unlocked");
        });



   }
   catch (err){
     console.log(err.message);
     res.send(err.message);
   }
   finally{
     console.log("Router.js [unlockWallet] Executed at UTC Time : " + Date.now());
   }
});
 /** Function/Module Name: gasMinimum API endpoint
     Purpose: It returns the Minimum gas needed for each Transaction
     Input: GasPrice and Gas Limit
     Output:Minimum gas needed in ether
 **/
app.get('/gasMinimum', function(req, res){
     const gasPrice = web3.eth.gasPrice.toNumber() * 2;
     const gasLimit = 200000;
     var minimum = gasPrice*gasLimit;
     minimum = minimum * Math.pow(10, -18);
     var minimumGas = {};
     minimumGas.gas = minimum;
     res.send(minimumGas);
     var time = new Date(Date.now()).toUTCString();
     console.log("Router.js [gasMinimum] Executed at" + time);


});

/***
/**
Function/Module Name : showSeed
Purpose : is a POST Api endpoint that allows users to export their pnemonic phrase "seed" after providing the correct passphrase for their keystore
Input: passphrase, keystore;
Output :  seed Phrase
**/


app.post('/showSeed', function(req, res){
  var password = passwordHash(req.body.password);
  var keystore = lightwallet.keystore.deserialize(req.body.keystore);
  try {
    if (!keystore) {
      throw new Error('No keystore to generate key');
    }
    var seedPromise = new Promise(function (resolve, reject) {
    keystore.keyFromPassword(password, function(err, pwDerivedKey) {
      if (err) return reject(err);
      var returnSeed = keystore.getSeed(pwDerivedKey);
      return resolve(returnSeed);
    })
  })
  seedPromise.then(function(returnSeed){
    var populateSeed = {};
    populateSeed['result'] = returnSeed;
    populateSeed['status'] = true;
    res.send(populateSeed);
  })
  }
  catch(err){
    console.log(err.message);
    res.send(err.message);
  }
  finally{
    var time = new Date(Date.now()).toUTCString();
    console.log("Router.js showSeed Executed at" + time);
  }
});

/**
Function/Module Name : exportPrivateKey
Purpose : is a POST Api endpoint that allows users to export their private key from their keystore after providing the correct passphrase
Input: passphrase, keystore;
Output :  The user's privateKey
**/


app.post('/exportPrivateKey', function(req, res){
  var password = passwordHash(req.body.password);
   var keystore = lightwallet.keystore.deserialize(req.body.keystore);
  try{
  if (!keystore) {
    throw new Error('No keystore to generate key');
  }

  var addressPromise = new Promise(function(resolve, reject){
    var key = keystore.getAddresses();
    resolve(key);
  });
  addressPromise.then(function(key){
     address = key;
  })
  var privateKeyPromise = new Promise(function (resolve, reject) {
    keystore.keyFromPassword(password, function(err, pwDerivedKey) {
      if (err) return reject(err);
      var address = keystore.getAddresses()[0];
      var returnKey = keystore.exportPrivateKey(address,pwDerivedKey,hdPath);
      return resolve(returnKey);
    })
  })
  privateKeyPromise.then(function(returnKey){
    var formatter = {};
    formatter['result']= returnKey;
    formatter['status'] = true;

    res.send(formatter);
  })
  ;
}
catch (err){
  console.log(err.message);
  res.send(err.message);
}
finally{
  var time = new Date(Date.now()).toUTCString();
  console.log("Router.js [exportPrivateKey] Executed at UTC Time : " + time);
}
});



app.listen(8003, function(err){
  if (!err) {
      console.log("Server is Running on port 8003");
  }
});
