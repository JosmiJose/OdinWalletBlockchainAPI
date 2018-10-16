# OdinWalletBlockchainAPI
An ERC20 wallet NodeJS API  for recieving, sending, and transferring Ether, ODIN, and other ERC20 tokens. The wallet also enables odin token users to exchange their token to other Pre-ICO listed on the ODIN portal. It uses keystore and private keys to enable wallet holders sign transactions and secure their digital assets in a vault. It also uses shar256 to enable that the user details are encrypted and secure from attackers and hackers.
Packages Used:
1. hooked-web3-provider
2. web3.js
3. express-js
4. ethjs-provider-signer
5. eth-lightwallet
6. sha256

API-end-points
Generate Wallet API end point
-creating a new wallet
- generating a new wallet address
- generate seed phrase for each user
- Authenticate the seed using the user password

Send Transaction API end point
Allows users to send ETH and Odin tokens to any user by specifying the wallet address

checkTokenBalances API end point
Checks for the avilable tokens in the user wallet and returns the balances of each.

 getRates Api End point 
Checks for the tokens price value rate in USD EUR ETH and USD.

Unlock Wallet API end point
Prompts the user to unlock wallet by entering their password

Close Wallet
Prompts the user to close the current wallet by deleting it from user session

Load Wallet
Prompts the user to provide the seed and password combination inorder to load their existing wallet.

getHash Endpoint
It uses sha256 algorithm for one way encryption and hashing of user details.

ShowSeed endpoint 
It allows display their 12 phrase seed upon logging in to the wallet and providing the correct password.

ExportPrivateKey Endpoint
 It allows users to export their privateKey from their Walllets upon authenticating their Keystore.

 GenKeystore 
 It generates keystore each time the user provides authentic and valid details that is seed and passphrase.
 
