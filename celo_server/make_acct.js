// celo_deploy.js

const Web3 = require('web3')
const ContractKit = require('@celo/contractkit')
const web3 = new Web3('https://alfajores-forno.celo-testnet.org')
const kit = ContractKit.newKitFromWeb3(web3)
const getAccount = require('./getAccount').getAccount

async function awaitWrapper(){
    let account = await getAccount()

    // This account must have a CELO balance to pay tx fees 
    // get some testnet funds at https://celo.org/build/faucet
    console.log(account.address)

    //...
}

awaitWrapper()

