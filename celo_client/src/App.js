import React, { Component } from 'react';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import './App.css';

const Web3 = require("web3");
const ContractKit = require('@celo/contractkit');
const web3 = new Web3('https://alfajores-forno.celo-testnet.org');
const kit = ContractKit.newKitFromWeb3(web3);
const getAccount = require('./getAccount').getAccount;

///must be compiled with Truffle to create this JSON
const SMSwallet = require('./SMSwallet.json');
const phoneRegisterABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"string","name":"_phoneNum","type":"string"},{"internalType":"address","name":"_phoneContract","type":"address"}],"name":"addSMSwallet","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_phoneNum","type":"string"}],"name":"getPhoneInfo","outputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_phoneNum","type":"string"},{"internalType":"address","name":"_phoneAddress","type":"address"}],"name":"registerPhone","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_phoneNum","type":"string"}],"name":"removePhone","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_phoneNum","type":"string"}],"name":"removePhoneAdmin","outputs":[],"stateMutability":"nonpayable","type":"function"}];
const celoSMSAddress = '0x82fd1525973D820f97e3381e5869a7638cd85Aac';

let phoneRegister = new kit.web3.eth.Contract(phoneRegisterABI, celoSMSAddress);


class App extends Component {
  static displayName = 'App';

  constructor(props) {
    super(props);
    this.state = {
      lModified: false,
      lSubmitted: false,
      phoneNum: '',
      personalWalletAddr: '',
      rent: {
        addr: '',
        label: ''
      },
      phone: {
        addr: '',
        label: ''
      },
      internet: {
        addr: '',
        label: ''
      },
      friendOneAddr: '',
      friendTwoAddr: '',
      landlordOption: 0,
      phoneOption: 0,
      internetOption: 0,
      phoneNumError: {
        isValid: false,
        errorMsg: 'You have entered an invalid phone number.  Please correct.'
      },
      walletError: {
        isValid: false,
        errorMsg: 'You have entered an invalid wallet address.  Please correct.'
      },
      friendOneError: {
        isValid: false,
        errorMsg: 'You have entered an invalid wallet address.  Please correct.'
      },
      friendTwoError: {
        isValid: false,
        errorMsg: 'You have entered an invalid wallet address.  Please correct.'
      }
    }
  }

  validatePhone(testNumber) {
    const numberPattern = /\d+/g;
    const onlyNumbers = testNumber.match( numberPattern ).join('')
    return (onlyNumbers.length === 11);
  }

  validateAddr(testAddr) {
    const addrPattern = "^0x[0-9A-Fa-f]{40}$";
    return !!(testAddr.match( addrPattern ));
  }

	handlePhoneNumChanged = (e) => {
    var phoneNumError = {...this.state.phoneNumError};
    phoneNumError.isValid = e.currentTarget.value.length > 9 ? this.validatePhone(e.currentTarget.value) : false;

		this.setState({
      phoneNumError,
			phoneNum: e.currentTarget.value
		});
	}

	handlePersonalWalletAddrChanged = (e) => {
    var walletError = {...this.state.walletError};
    walletError.isValid = e.currentTarget.value.length >= 40 ? this.validateAddr(e.currentTarget.value) : false;

		this.setState({
      walletError,
			personalWalletAddr: e.currentTarget.value
		});
	}

	handleFriendOneAddrChanged = (e) => {
    var friendOneError = {...this.state.friendOneError};
    friendOneError.isValid = e.currentTarget.value.length >= 40 ? this.validateAddr(e.currentTarget.value) : false;

		this.setState({
      lModified: true,
      friendOneError,
			friendOneAddr: e.currentTarget.value
		});
	}

	handleFriendTwoAddrChanged = (e) => {
    var friendTwoError = {...this.state.friendTwoError};
    friendTwoError.isValid = e.currentTarget.value.length >= 40 ? this.validateAddr(e.currentTarget.value) : false;

		this.setState({
      lModified: true,
      friendTwoError,
			friendTwoAddr: e.currentTarget.value
		});
	}

  onLandlordSelect = (e) => {
    this.setState({
      lModified: true,
      landlordOption: e.id,
      rent: {
        addr: e.value,
        label: e.label
      }
    });
  }

  onPhoneSelect = (e) => {
    this.setState({
      lModified: true,
      phoneOption: e.id,
      phone: {
        addr: e.value,
        label: e.label
      }
    });
  }

  onInternetSelect = (e) => {
    this.setState({
      lModified: true,
      internetOption: e.id,
      internet: {
        addr: e.value,
        label: e.label
      }
    });
  }


  onSubmit() {
    this.setState({
      lSubmitted: true
    }, () => {
      if (this.state.lSubmitted && this.state.phoneNumError['isValid'] && this.state.walletError['isValid'] && (this.state.friendOneError['isValid'] || !this.state.friendOneAddr) && (this.state.friendTwoError['isValid'] || !this.state.friendTwoAddr)) {
        // Input formatted correctly, proceed with making wallet

        const _smsNum = this.state.phoneNum;
        const _rentAddr = this.state.rent['addr'] ? this.state.rent['addr'] : this.state.personalWalletAddr;
        const _phoneAddr = this.state.phone['addr'] ? this.state.phone['addr'] : this.state.personalWalletAddr;
        const _internetAddr = this.state.internet['addr'] ? this.state.internet['addr'] : this.state.personalWalletAddr;
        const _friendOneAddr = this.state.friendOneAddr ? this.state.friendOneAddr : this.state.personalWalletAddr;
        const _friendTwoAddr = this.state.friendTwoAddr ? this.state.friendTwoAddr : this.state.personalWalletAddr;
        
        this.makeSmartWallet(_smsNum, _rentAddr, _phoneAddr, _internetAddr, _friendOneAddr, _friendTwoAddr)
      } else {
        alert("Form has errors, please resolve");
      }

    });
  }

  async isRegistered(_phoneNum) {
    try {
      return await phoneRegister.methods.getPhoneInfo(_phoneNum).call();
    } catch (err) { throw new Error('error getting info: ' + err); }
  }

  async makeSmartWallet(_smsNum, _rentAddr, _phoneAddr, _internetAddr, _friendOneAddr, _friendTwoAddr) {
    try {
      this.isRegistered(_smsNum).then((res)=> {
        if (res[0] === '0x0000000000000000000000000000000000000000') {
          alert('Phone number is not yet registered. Please register via SMS');
        } else if (res[0] !== '0x0000000000000000000000000000000000000000' && res[0] !== res[1]) {
          alert('Phone number already has a smart wallet.  You must delete and re-make if you want to modify');
        } else {
          this.createWallet(_smsNum, _rentAddr, _phoneAddr, _internetAddr, _friendOneAddr, _friendTwoAddr)
        }
      });

    } catch (err) { throw new Error('error making contract: ' + err); }
  }

  async createWallet(_smsNum, _rentAddr, _phoneAddr, _internetAddr, _friendOneAddr, _friendTwoAddr) {
    try {
      const encodedParameters = web3.eth.abi.encodeParameters(
        ['string', 'address', 'address', 'address', 'address', 'address'], [_smsNum, _rentAddr, _phoneAddr, _internetAddr, _friendOneAddr, _friendTwoAddr]
      ).slice(6);

      let contractCode = SMSwallet.deployedBytecode + encodedParameters;
      let account = await getAccount();
      kit.connection.addAccount(account.privateKey);
      let tx = await kit.connection.sendTransaction({ from: account.address, data: contractCode, gas:1325208, gasPrice: web3.utils.toWei( '0.5', 'gwei')});
      let receipt = await tx.waitReceipt();
      alert('New smart wallet address is: ' + receipt.contractAddress + '\nSend funds to this new wallet address!');

      const txObject = await phoneRegister.methods.addSMSwallet(_smsNum, receipt.contractAddress);
      let tx_ = await kit.sendTransactionObject(txObject, { from: account.address });
      let receipt_ = await tx.waitReceipt();
      console.log(receipt_);
      this.isRegistered(_smsNum).then((res) => {
        console.log('post wallet: ', res[0], res[1]);
      });
    } catch (err) { throw new Error('error making contract: ' + err); }
  }

  getModalText() {
    return (
      <div className='row textArea'>
        {!(this.state.rent['addr'] || this.state.phone['addr'] || this.state.internet['addr'] || this.state.friendOneAddr || this.state.friendTwoAddr) && <div className='row'>Why are you attempting to create a contract without any of the prepay options filled out?</div>}
        {this.state.rent['addr'] && <div className='row'>{`You've selected `}<span className='company-name'>{`${this.state.rent['label']}`}</span>{`. Using the command `}<code>CeloPay rent [amount]</code>{`, you will be sending [amount] to the Celo address `}<span className='address-name'>{this.state.rent['addr']}</span>{`.`}</div>}        
        {this.state.phone['addr'] && <div className='row'>{`You've selected `}<span className='company-name'>{`${this.state.phone['label']}`}</span>{`. Using the command `}<code>CeloPay phone [amount]</code>{`, you will be sending [amount] to the Celo address `}<span className='address-name'>{this.state.phone['addr']}</span>{`.`}</div>}
        {this.state.internet['addr'] && <div className='row'>{`You've selected `}<span className='company-name'>{`${this.state.internet['label']}`}</span>{`. Using the command `}<code>CeloPay internet [amount]</code>{`, you will be sending [amount] to the Celo address `}<span className='address-name'>{this.state.internet['addr']}</span>{`.`}</div>}

        {this.state.friendOneAddr && <div className='row'>{`Using the command`}<code>CeloPay friend1 [amount]</code>{`, you will be sending [amount] to the Celo address `}<span className='address-name'>{this.state.friendOneAddr}</span></div>}
        {this.state.friendTwoAddr && <div className='row'>{`Using the command`}<code>CeloPay friend2 [amount]</code>{`, you will be sending [amount] to the Celo address `}<span className='address-name'>{this.state.friendTwoAddr}</span></div>}
      </div>
    )
  }

  render() {
    const landlordOptions = [
      {
        id: '0',
        value: '0xa7ed835288Aa4524bB6C73DD23c0bF4315D9Fe3e',
        label: 'Century 21'
      }, {
        id: '1',
        value: '0xE7818b0e067Bc205B0a2A3055818083D13F11aA8',
        label: 'RE/MAX'
      }, {
        id: '2',
        value: '0x6dd6E0C51F819B14A1cb713Faa927304f872285B',
        label: 'Berkshire Hathaway HomeServices'
      }, {
        id: '3',
        value: '0xAA963FC97281d9632d96700aB62A4D1340F9a28a',
        label: 'Sotheby\'s International Realty'
      }, {
        id: '4',
        value: '0x22579CA45eE22E2E16dDF72D955D6cf4c767B0eF',
        label: 'Christie\'s International Real Estate'
      }
    ];

    const defaultLandlordOption = landlordOptions[`${this.state.landlordOptions}`];

    const phoneOptions = [
      {
        id: '0',
        value: '0x895E4bc0349093c1deb75C44EfE1d1F5a1ba109D',
        label: 'Verizon'
      }, {
        id: '1',
        value: '0xC8444A56b2af58c59A0d0EE6008f5FF95f7c81Ea',
        label: 'ATT'
      }, {
        id: '2',
        value: '0x085Ee67132Ec4297b85ed5d1b4C65424D36fDA7d',
        label: 'TMobile'
      }, {
        id: '3',
        value: '0x8Cf0b8557a4f3CC20208986Fc6843416ae879ffe',
        label: 'Sprint'
      }, {
        id: '4',
        value: '0xDF4106d4f45d3DeEBd847522aF05e8c73Ba652CB',
        label: 'US-Cellular'
      }
    ];

    const defaultPhoneOption = phoneOptions[`${this.state.phoneOptions}`];

    const internetOptions = [
      {
        id: '0',
        value: '0x801856a38a422906b731293CB0c5AE09b6AfdF2F',
        label: 'Cox'
      }, {
        id: '1',
        value: '0x5809369FC5121a071eE67659a975e88ae40fBE3b',
        label: 'Comcast'
      }, {
        id: '2',
        value: '0x0de78C89e7BF5060f28dd3f820C15C4A6A81AFB5',
        label: 'Verizon'
      }, {
        id: '3',
        value: '0x1173C5A50bf025e8356823a068E396ccF2bE696C',
        label: 'Century Link'
      }, {
        id: '4',
        value: '0x2fd430d3a96eadc38cc1B38b6685C5f52Cf7a083',
        label: 'Windstream'
      }
    ];

    const defaultInternetOption = internetOptions[`${this.state.internetOptions}`];

    return (
      <div>
        <div className="modal fade" id="confirmModal" tabIndex="-1" role="dialog" aria-labelledby="Confirm Modal" aria-hidden="true">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">Confirm Wallet Creation
                  <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                  </button>
                </h5>
              </div>
              <div className="modal-body">
                {this.getModalText()}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                <button type="button" className="btn btn-primary" data-dismiss="modal" onClick={this.onSubmit.bind(this)}>Save changes</button>
              </div>
            </div>
          </div>
        </div>

        <div className='logo-heading'>
          <div className='container mx-auto logo-interior'>
            <span className='logo-span'><img alt='celo-logo' className='logo-img' src="./celo-logo-lg.png"/><span className="logo-text">SMS</span></span>
            <span className="logo-phone-text">+1-260-CELO-SMS</span>
          </div>
        </div>
        <div className='container mx-auto landscape'>
          <div className='left'>
            
            <div className='row'>
              <h2>Welcome to Celo SMS!</h2>
              <p>Please use this page to create your SMS wallet contract on the Celo blockchain.</p>
            </div>

        
            <div className='row'>
              <input id="phone-number"
                type="number"
                className="form-control top-inputs"
                placeholder="+1-XXX-XXX-XXXX"
                onChange={this.handlePhoneNumChanged} />
            </div>
            {(!this.state.phoneNumError['isValid'] && this.state.lSubmitted) && <div className='error-text'>{this.state.phoneNumError['errorMsg']}</div>}


            <div className='row'>
              <input id="personal-acct"
                type="text"
                className="form-control top-inputs"
                placeholder="Personal Wallet Address (0x00...)"
                onChange={this.handlePersonalWalletAddrChanged} />
            </div>
            {(!this.state.walletError['isValid'] && this.state.lSubmitted) && <div className='error-text'>{this.state.walletError['errorMsg']}</div>}
        
            <div className="row">
              <Dropdown options={landlordOptions}
                className='ddl-options'
                onChange={this.onLandlordSelect}
                value={this.state.defaultLandlordOption}
                placeholder="Select Your Landlord" 
              />
            </div>
        

            <div className="row">
              <Dropdown options={phoneOptions}
                className='ddl-options'
                onChange={this.onPhoneSelect}
                value={this.state.defaultPhoneOption}
                placeholder="Select Your Phone Provider" 
              />
            </div>

            <div className="row">
              <Dropdown options={internetOptions}
                className='ddl-options'
                onChange={this.onInternetSelect}
                value={this.state.defaultInternetOption}
                placeholder="Select Your Internet Provider" 
              />
            </div>
        
            <div className='row'>
              <input id="friend-one"
                type="text"
                className="form-control top-inputs"
                placeholder="Friend One Wallet Address (0x00...)" 
                onChange={this.handleFriendOneAddrChanged} />
            </div>
            {(!this.state.friendOneError['isValid'] && this.state.lSubmitted && this.state.friendOneAddr) && <div className='error-text'>{this.state.friendOneError['errorMsg']}</div>}
        
            <div className='row'>
              <input id="friend-tow" 
                type="text"
                className="form-control top-inputs"
                placeholder="Friend Two Wallet Address (0x00...)" 
                onChange={this.handleFriendTwoAddrChanged} />
            </div>
            {(!this.state.friendTwoError['isValid'] && this.state.lSubmitted && this.state.friendTwoAddr) && <div className='error-text'>{this.state.friendTwoError['errorMsg']}</div>}
        
        
            <div className="row">
              <button id="submit" 
                type="button"
                className="btn btn-success"
                data-toggle="modal"
                data-target="#confirmModal"
                disabled={!(this.state.phoneNum && this.state.personalWalletAddr)}
              >
                Submit
              </button>
            </div>
        
          </div>
          <div className='right'>
            <img alt='phone-logo' className='phone-pic' src='./flip-phone-rmbg.png' />
            <img alt='celo-logo-lg' className='celo-pic' src='./celo-logo.png' />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
