pragma solidity ^0.5.0;

contract Faucet {
	

    //state variable to keep track of owner and amount of ETHER to dispense
    address public owner;
    uint public amountAllowed = 0.5 ether;

    event Withdrawal(address indexed to);
    event Deposit(address indexed from, uint amount);


    //constructor to set the owner
	// constructor() payable {
	// 	owner = msg.sender;
	// }

    // CALLED WHEN SMART CONTRACT IS CREATED
    // I GUESS THIS MEANS WHEN THE FILL FAUCET BUTTON IS CLICKED?
    constructor() public {
	 	owner = msg.sender;
	}

    //function modifier
    modifier onlyOwner {
        require(msg.sender == owner, "Only owner can call this function.");
        _; 
    }


    //function to change the owner.  Only the owner of the contract can call this function
    function setOwner(address newOwner) public onlyOwner {
        owner = newOwner;
    }


    //function to set the amount allowable to be claimed. Only the owner can call this function
    function setAmountallowed(uint newAmountAllowed) public onlyOwner {
        amountAllowed = newAmountAllowed;
    }

    function showContractBalance() public view returns(uint balance)
    {
        balance = address(this).balance;
    }


    //function to donate funds to the faucet contract
	// function donateTofaucet(uint amount) public payable 
    // {
    //     // emit Deposit(msg.sender, msg.value);
    //     emit Deposit(msg.sender, amount);
    // }
    function () external payable {}

    function topup() public {
        msg.sender.transfer(2 ether);
    }

    function donateTofaucet() public payable {
        msg.sender.transfer(2 ether);
    }

    function receive() external payable {}


    //function to send tokens from faucet to an address
    function requestTokens() public payable {

        // CHECKS IF THIS CONTRACT HAS ENOUGH ETH 
        require(address(this).balance > amountAllowed, "Not enough funds in the faucet. Please donate");

        //if the balance of this contract is greater then the requested amount send funds
        msg.sender.transfer(amountAllowed);        
    }
}