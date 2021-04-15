pragma solidity >=0.5.0 <0.8.0;

contract phoneRegister{
    address contractOwner;
    string phoneNumber;

    struct phoneInfo{
        address phoneAddress;
        address phoneContract;
    }

    mapping(string => phoneInfo) celoPhones;

    constructor() {
        contractOwner = msg.sender;
    }



    modifier onlyOwner() {
        require( msg.sender == contractOwner, "Only owner can call" );
        _;
    }

    modifier onlyPhoneOwner( string memory _phoneNum ) {
        require( msg.sender == celoPhones[_phoneNum].phoneAddress, "Phone num doesn't match your address" );
        _;
    }



    function registerPhone(string calldata _phoneNum, address _phoneAddress) external onlyOwner {
        celoPhones[_phoneNum].phoneAddress = _phoneAddress;
        celoPhones[_phoneNum].phoneContract = _phoneAddress;
    }

    function addSMSwallet(string calldata _phoneNum, address _phoneContract) external onlyOwner {
        celoPhones[_phoneNum].phoneContract = _phoneContract;
    }

    function getPhoneInfo(string memory _phoneNum) public view returns (address, address) {
        return (celoPhones[_phoneNum].phoneAddress, celoPhones[_phoneNum].phoneContract);
    }

    //if a user wants to edit their info, they must delete their info first and create a new registry
    function removePhone(string memory _phoneNum) public onlyPhoneOwner(_phoneNum) {
        delete celoPhones[_phoneNum];
    }

    function removePhoneAdmin(string memory _phoneNum) public onlyOwner() {
        delete celoPhones[_phoneNum];
    }
}


