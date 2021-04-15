pragma solidity >=0.5.0 <0.8.0;


contract SMSwallet {

    address banker;
    address payable public SMSowner;
    string phoneNum;

    address payable public phone;
    address payable public internet;
    address payable public rent;
    address payable public friendOne;
    address payable public friendTwo;


    constructor(string memory _phoneNum, address payable _smsOwner, address payable _rent, address payable _phone, 
                address payable _internet, address payable _friendOne, address payable _friendTwo) {
        banker = msg.sender;
        SMSowner = _smsOwner;
        phoneNum = _phoneNum;
        phone = _phone;
        internet = _internet;
        rent = _rent;
        friendOne = _friendOne;
        friendTwo = _friendTwo;
    }

    modifier onlyOwners() {
        require( msg.sender == banker || msg.sender == SMSowner, "Not authorized" );
        _;
    }

    receive() external payable {}
    fallback() external payable {}


    function makePayment(string calldata _service, uint256 _sendAmount) external onlyOwners {
        if( keccak256(abi.encodePacked(_service)) == keccak256(abi.encodePacked('rent')) ){
            (bool sent, ) = rent.call{value: _sendAmount}("");
            require(sent, "Failed to send Ether");
        }
        if( keccak256(abi.encodePacked(_service)) == keccak256(abi.encodePacked('phone')) ){
            (bool sent, ) = phone.call{value: _sendAmount}("");
            require(sent, "Failed to send Ether");
        }
        if( keccak256(abi.encodePacked(_service)) == keccak256(abi.encodePacked('internet')) ){
            (bool sent, ) = internet.call{value: _sendAmount}("");
            require(sent, "Failed to send Ether");
        }
        if( keccak256(abi.encodePacked(_service)) == keccak256(abi.encodePacked('friend1')) ){
            (bool sent, ) = friendOne.call{value: _sendAmount}("");
            require(sent, "Failed to send Ether");
        }
        if( keccak256(abi.encodePacked(_service)) == keccak256(abi.encodePacked('friend2')) ){
            (bool sent, ) = friendTwo.call{value: _sendAmount}("");
            require(sent, "Failed to send Ether");
        }
        if( keccak256(abi.encodePacked(_service)) == keccak256(abi.encodePacked('myself')) ){
            (bool sent, ) = SMSowner.call{value: _sendAmount}("");
            require(sent, "Failed to send Ether");
        }

    }
    
    function getAddressInfo() public view returns (string memory, address, address, address, address, address, address) {
        return( phoneNum, SMSowner, rent, phone, internet, friendOne, friendTwo );
    }

    function destroyContract() public onlyOwners {
        selfdestruct(SMSowner);
    }

}

