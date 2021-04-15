#!/usr/bin/node

const http = require('http');
const request = require('request');
const express = require('express');
const bodyParser = require('body-parser');
//const dotenv = require('dotenv');
//dotenv.config();
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const session = require('express-session');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const app = express();


const Web3 = require("web3");
const ContractKit = require('@celo/contractkit');
const web3 = new Web3('https://alfajores-forno.celo-testnet.org');
const kit = ContractKit.newKitFromWeb3(web3);
const getAccount = require('./getAccount').getAccount;
//const phoneRegisterInfo = require('./build/contracts/phoneRegister.json');
//const SMSwalletInfo = require('./build/contracts/SMSwallet.json');

const phoneRegisterAddress = '0x82fd1525973D820f97e3381e5869a7638cd85Aac';
const phoneRegisterABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"string","name":"_phoneNum","type":"string"},{"internalType":"address","name":"_phoneContract","type":"address"}],"name":"addSMSwallet","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_phoneNum","type":"string"}],"name":"getPhoneInfo","outputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_phoneNum","type":"string"},{"internalType":"address","name":"_phoneAddress","type":"address"}],"name":"registerPhone","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_phoneNum","type":"string"}],"name":"removePhone","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_phoneNum","type":"string"}],"name":"removePhoneAdmin","outputs":[],"stateMutability":"nonpayable","type":"function"}]; 
//const phoneRegisterABI = phoneRegisterInfo.abi;

const SMSwalletABI = [{"inputs":[{"internalType":"string","name":"_phoneNum","type":"string"},{"internalType":"address payable","name":"_smsOwner","type":"address"},{"internalType":"address payable","name":"_rent","type":"address"},{"internalType":"address payable","name":"_phone","type":"address"},{"internalType":"address payable","name":"_internet","type":"address"},{"internalType":"address payable","name":"_friendOne","type":"address"},{"internalType":"address payable","name":"_friendTwo","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"stateMutability":"payable","type":"fallback"},{"inputs":[],"name":"SMSowner","outputs":[{"internalType":"address payable","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"destroyContract","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"friendOne","outputs":[{"internalType":"address payable","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"friendTwo","outputs":[{"internalType":"address payable","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getAddressInfo","outputs":[{"internalType":"string","name":"","type":"string"},{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"internet","outputs":[{"internalType":"address payable","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_service","type":"string"},{"internalType":"uint256","name":"_sendAmount","type":"uint256"}],"name":"makePayment","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"phone","outputs":[{"internalType":"address payable","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"rent","outputs":[{"internalType":"address payable","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"stateMutability":"payable","type":"receive"}];
//const SMSwalletABI = SMSwalletInfo.abi;


let phoneRegister = new kit.web3.eth.Contract( phoneRegisterABI, phoneRegisterAddress );



const helpRegex = /^\s*COMMANDS\s*/i,
      registerPhoneRegex = /^\s*REGISTER\s*(0x[0-9A-Fa-f]{40})\s*/i,
      accountBalRegex = /^\s*MYBALANCE\s*/i,
      walletHistoryRegex = /^\s*MYHISTORY\s*/i,
      walletAddressRegex = /^\s*WALLETADDRESS\s*/i,
      balanceRegex = /^\s*BALANCE\s*(0x[0-9A-Fa-f]{40})\s*/i,
      CELOcUSDrateRegex = /^\s*CELO2CUSD\s*/i,
      paymentRegex = /^\s*CELOPAY\s+(rent|phone|internet|friend1|friend2|myself)\s+(\d+|\d*\.{1}\d+)\s*/i;
    //  lastFiveRegex = /^last5tx\:(0x[0-9A-Fa-f]{40})/i,
//    vendorFindRegex = /^vendors\s* ZIP CODE,
    //  postTxRegex = /^sendSignedTx:(0x[0-9A-Fa-f]{200,})/i,



app.use(session({secret: 'anything-you-want-but-keep-secret'}));
app.use( bodyParser.urlencoded( { extended: false } ) );

app.post('/sms', (req, res) => {


  let smsText = req.body.Body,
      phoneNum = req.body.From;

  phoneNum = phoneNum.replace(/\W/g, '');
  console.log('Text from: ' + phoneNum + '\n');

  let matchStatus = 'false';

  //Registers a new phone number 
  if( _address = smsText.match(registerPhoneRegex) ) {
      matchStatus = 'true';
        async function addPhoneNumber(address) {
            try{
                if( await isRegistered(phoneNum) == 'false' ){
                    console.log('registering new number: ' + phoneNum + ' with address:' + address + ' account\n\n');
                    let account = await getAccount();
                    kit.connection.addAccount(account.privateKey);
                    const txObject = await phoneRegister.methods.registerPhone(phoneNum, address);
                    let tx = await kit.sendTransactionObject(txObject, { from: account.address })
                    let receipt = await tx.waitReceipt()
                    console.log('registration success\n');
                    console.log(receipt)
                    sendText('You are registered now. Please visit https://celosms.com to create wallet', res);
                } else {
                    console.log('Phone is already registered\n');
                    sendText('Phone number is already registered', res);
                }
            } catch (err) {
                sendText('error', res);
                throw new Error('err registering phone: ' + err);
            }
        }
        addPhoneNumber( _address[1] );
  }


  //Returns balance info for the owner account and wallet account
  if( smsText.match(accountBalRegex) ) {
      matchStatus = 'true';
         //console.log('balance method called\n');
         async function getMyBalance() {
             try {
                if( await isRegistered(phoneNum) == 'true' ) {
                    let myAccountInfo = await phoneRegister.methods.getPhoneInfo(phoneNum).call();
                    //console.log(myAccountInfo);
                    //console.log('\nphone account: ' + myAccountInfo[0]);
                    let goldtoken = await kit.contracts.getGoldToken();
                    let celoBalance = await goldtoken.balanceOf( myAccountInfo[0] );
                    celoBalance /= Math.pow(10, 18);
                    var personalBalanceMsg = 'PersonalAddress: ' + myAccountInfo[0] + 
                                             '\nPersonal Balance:\n' + celoBalance.toFixed(4) + ' CELO' + '\n';

                    let stabletoken = await kit.contracts.getStableToken();
                    let cusdBalance = await stabletoken.balanceOf( myAccountInfo[0] );
                    cusdBalance /= Math.pow(10, 18);
                    var cusdBalanceMessage = cusdBalance.toFixed(4) + ' cUSD' + '\n';
                    personalBalanceMsg += cusdBalanceMessage;

                    celoBalance = await goldtoken.balanceOf( myAccountInfo[1] );
                    celoBalance /= Math.pow(10, 18);
                    cusdBalance = await stabletoken.balanceOf( myAccountInfo[1] );
                    cusdBalance /= Math.pow(10, 18);
                    var walletBalanceMsg = 'WalletAddress: ' + myAccountInfo[1] +
                                               '\nWallet Balance:\n' + celoBalance.toFixed(4) + ' CELO' + '\n' +
                                               cusdBalance.toFixed(4) + ' cUSD' + '\n';

                    let myBalanceMsg = personalBalanceMsg + walletBalanceMsg;
                    //console.log(myBalanceMsg + '\n');
                    sendText(myBalanceMsg, res);
                } else { 
                    //console.log('phone not registered\n');
                    sendText('Phone is not registered', res); 
                }
             } catch (err) { throw new Error('err getting balance: ' + err); }
         }
         getMyBalance();
  }



  //Returns address of the users SMS wallet
  if( smsText.match(walletAddressRegex) ) {
      matchStatus = 'true';
         //console.log('wallet balance method called\n');
         async function getWalletBalance() {
             try {
                 if( await hasWallet(phoneNum) == 'true' ) {
                     let walletInfo = await phoneRegister.methods.getPhoneInfo(phoneNum).call();
                     sendText(walletInfo[1], res);
                 } else { 
                     //console.log('phone has no wallet yet\n'); 
                     sendText('SMS wallet has not been created. Visit https://celosms.com to register', res);
                 }
             } catch (err) { throw new Error('err getting info: '+ err); }
         }
         getWalletBalance();
  }


   //Returns the balance of requested address
   if( _address = smsText.match(balanceRegex) ) {
       matchStatus = 'true';
         async function getCeloBalance(address) {
             try {
                let goldtoken = await kit.contracts.getGoldToken();
                let celoBalance = await goldtoken.balanceOf(address);
                celoBalance /= Math.pow(10, 18);
                let celoBalanceMessage = 'Balance for ' + address.substring(0,6) + ':\n' + celoBalance.toFixed(6) + ' CELO\n';
                
                let stabletoken = await kit.contracts.getStableToken();
                let cusdBalance = await stabletoken.balanceOf(address);
                cusdBalance /= Math.pow(10, 18);
                var balanceMessage = celoBalanceMessage + cusdBalance.toFixed(6) + ' cUSD';
                //console.log(balanceMessage + '\n');
                sendText(balanceMessage, res);
             } catch (err) { throw new Error('err getting balance: ' + err); }
         }
         getCeloBalance( _address[1] );
   }


   //Returns the current rate exchange for Celo to cUSD
   if( smsText.match(CELOcUSDrateRegex) ) {
       matchStatus = 'true';
         async function getCELOcUSDrate(){
             try{
                 var oneGold = kit.web3.utils.toWei('1', 'ether');
                 let exchange = await kit.contracts.getExchange();
                 let amountOfcUSD = await exchange.quoteGoldSell(oneGold);
                 amountOfcUSD /= Math.pow(10, 18);
                 var CELOcUSDrateMessage = '1 CELO equals ' + amountOfcUSD.toFixed(6) + ' cUSD';
                 //console.log('CELO to cUSD rate is ' + amountOfcUSD.toString() + '\n' );
                 sendText(CELOcUSDrateMessage, res);
             } catch (err) { throw new Error('err getting rate: ' + err); }
         }
         getCELOcUSDrate();
   }

   //Calls makePayment method within users smart wallet. Makes payment to trusted/preset receipient
   if( paymentInfo = smsText.match(paymentRegex) ) {
       matchStatus = 'true';
         async function makePayment() {
             try {
                 if( await hasWallet(phoneNum) == 'true' ) {
                     console.log('phone number has wallet\n');
                     let myService = paymentInfo[1];
                     let paymentAmount = web3.utils.toWei( paymentInfo[2], 'ether');
                     
                     async function accessWallet() {
                         let walletInfo = await phoneRegister.methods.getPhoneInfo(phoneNum).call();
                         let SMSwallet = new kit.web3.eth.Contract( SMSwalletABI, walletInfo[1] );

                         let account = await getAccount();
                         kit.connection.addAccount(account.privateKey);
                         const txObject = await SMSwallet.methods.makePayment(myService, paymentAmount);
                         let tx = await kit.sendTransactionObject(txObject, { from: account.address });
                         let receipt = await tx.waitReceipt();
                         //console.log('payment success\n')
                         console.log(receipt);
                         //console.log('testing!!!!!!!!!!!!\n');
                         //console.log(receipt.to)
			     //needs error check for successful transaction receipt.receipt.status
                         //let paymentMsg = 'Payment success!\nSent ' + paymentInfo[2] + 
			//	          ' Celo to address:\n' + receipt.receipt.to;
			 let paymentMsg = 'Payment sent to: ' + receipt.to;
                         sendText(paymentMsg, res);
                     }
                     accessWallet();
                 } else { sendText('Phone number has not created wallet yet', res); }
             } catch (err) { throw new Error('err making payment: ' + err); }
         }
         makePayment();
   }

	
      if( smsText.match(walletHistoryRegex) ) {
	      matchStatus = 'true';
	      let historyMsg = '';
	      async function getHistory() {
		      try {
			      if( await hasWallet(phoneNum) == 'true' ) {
				      let myAccountInfo = await phoneRegister.methods.getPhoneInfo(phoneNum).call();
				      let myWebRequest = 'https://alfajores-blockscout.celo-testnet.org/api/?module=account&action=tokentx&address=' + 
					                 myAccountInfo[1] + '&page=1&offset=3';
				      
				      request(myWebRequest, { json: true }, (err, resp, body) => {
					      if (err) { return console.log(err) };
					      for(let x = 0; x < body.result.length; x++) {
                                                  //console.log('number of elements in json array: ' + body.result.length);
						      //const unixTimestamp = body[x].timeStamp;
						      //const milliseconds = 1575909015 * 1000 // 1575909015000
                                                      let dateObject = new Date( body.result[x].timeStamp * 1000 )
                                                      let txTimeStamp = dateObject.toLocaleString();
			
						      if( body.result[x].transactionIndex == '1' ) {
							      console.log('Received ' + kit.web3.utils.fromWei(body.result[x].value, 'ether') +
								          ' Celo from address:\n' + body.result[x].from + '\n' + txTimeStamp + '\n\n');
							      historyMsg += 'Received ' + kit.web3.utils.fromWei(body.result[x].value, 'ether') +
								             ' Celo from address:\n' + body.result[x].from + '\n' + txTimeStamp + '\n\n';
						      }
						      if( body.result[x].transactionIndex == '0' ) {
							      console.log('Sent ' + kit.web3.utils.fromWei(body.result[x].value, 'ether') +
                                                                          ' Celo to address:\n' + body.result[x].from + '\n' + txTimeStamp + '\n\n');
							      historyMsg += 'Sent ' + kit.web3.utils.fromWei(body.result[x].value, 'ether') + 
								            ' Celo to address:\n' + body.result[x].from + '\n' + txTimeStamp + '\n\n';
						      }
					      }
					      sendText(historyMsg, res);
			              });
				      //sendText(historyMsg, res);
		               } else { sendText('Phone number has not created wallet yet', res); }
	                  } catch (err) { throw new Error('err getting history: ' + err); }
             } 
	     getHistory(); 
       }
       
       


     // case helpRegex.test(smsText):
     if( smsText.match(helpRegex) ) {
         matchStatus = 'true';
         message = 'Available Commands are case insensitive:\n\n' +
                   'register <account> - register Celo account to your phone number\n\n' +
                   'myBalance - get balance of my wallet\n\n' +
		   'myHistory - get wallet transaction history\n\n' +
                   'CeloPay <service> <amount> - send amount to preset service\n\n' +
                   'walletAddress - get address of my wallet\n\n' +
                   'balance <account> - get account Celo balance\n\n' +
                   'Celo2cUSD - get exchange rate Celo to cUSD\n\n' +
                   '** payment services available are RENT, PHONE, INTERNET, FRIEND1, FRIEND2, or MYSELF\n';

//                   'gasprice - get average gas price\n\n' +
//                   'last5tx:0xAccountNumber - get last 5 transactions info\n' +
//                   'sendSignedTx:TransactionData - post a signed transaction';
         sendText(message, res);
     }


      if( matchStatus == 'false' ) {
         message = 'Invalid Command. \nText \"commands\" to get list of available commands';
         sendText(message, res);
      }
});




http.createServer(app).listen(1337,  () => {
  console.log('Express server listening on port 1337');
});


function sendText( myData, myRes ){
    console.log('sending text with data ' + myData);
    const twiml = new MessagingResponse();
    twiml.message(myData);

    myRes.writeHead(200, {'Content-Type': 'text/xml'});
    myRes.end(twiml.toString());
}



async function isRegistered(_phoneNum) {
    let registered = 'true';
    try {
        let phoneInfo = await phoneRegister.methods.getPhoneInfo(_phoneNum).call();
        if( phoneInfo[0] == '0x0000000000000000000000000000000000000000' ) {
            registered = 'false';
        }
        return registered;
    } catch (err) { throw new Error('err getting info: ' + err); }

}


async function hasWallet(_phoneNum) {
    let activeWallet = 'false';
    try {
        let phoneInfo = await phoneRegister.methods.getPhoneInfo(_phoneNum).call();
        if( phoneInfo[0] != '0x0000000000000000000000000000000000000000' && phoneInfo[0] != phoneInfo[1] ){
            activeWallet = 'true';
        }
        return activeWallet;
    } catch (err) { throw new Error('err getting info: ' + err); }

}
