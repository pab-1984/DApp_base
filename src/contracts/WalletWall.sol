pragma solidity >= 0.6.0;
pragma experimental ABIEncoderV2;

contract WalletWall {
    struct Message {
        address sender;
        string content;
    }

    Message[] public messages;
    address payable public owner;
    uint256 public fee = 10000000000000000; // Tarifa fija, por ejemplo 0.01 ETH

    event MessagePublished(address sender, string content);

    constructor() {
        owner = payable(msg.sender);
    }

    function publish(string memory content) public payable {
        require(msg.value >= fee, "Insufficient payment: must pay the publishing fee.");

        owner.transfer(msg.value); // Envía el pago completo al propietario

        Message memory newMessage = Message({
            sender: msg.sender,
            content: content
        });
        messages.push(newMessage);

        emit MessagePublished(msg.sender, content);
    }

    function getMessages() public view returns (string[] memory) {
        string[] memory contents = new string[](messages.length);
        for (uint i = 0; i < messages.length; i++) {
            contents[i] = messages[i].content;
        }
        return contents;
    }
}