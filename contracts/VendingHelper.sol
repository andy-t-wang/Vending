pragma solidity ^0.8.0;

import "./VendingNexus.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract VendingHelper is Vending, ERC20 {
    using SafeMath for uint256;
    uint256 public shakeFee = 0.0021 ether;
    uint256 shakeSuccessProbability = 90;
    event itemFreed(string name, string imageUrl, string description);
    event failed();
    event withdrawEmit(uint256 balance);

    constructor(uint256 initialSupply) ERC20("Vending", "VEND") {
        _mint(msg.sender, initialSupply);
    }

    // Buy an item
    function buy(uint256 index) external {
        require(itemStock[index] > 0, "Out of Stock");
        require(
            balanceOf(msg.sender) >= items[index].vendCost,
            "Insufficient VEND for transaction"
        );
        itemStock[index]--;
        Item memory item = items[index];
        transfer(address(this), item.vendCost);
        if (stuck()) {
            emit itemStuck(item.name, item.imageUrl, item.description);
            stuckItems.push(item);
        } else {
            emit itemBought(item.name, item.imageUrl, item.description);
        }
    }

    function mint(address receiverAddress, uint256 amount) external onlyOwner {
        _mint(receiverAddress, amount);
    }

    function withdraw() external onlyOwner {
        address payable _owner = payable(owner());
        emit withdrawEmit(address(this).balance);
        _owner.transfer(address(this).balance);
    }

    function getBalance() external view onlyOwner returns (uint256) {
        return address(this).balance;
    }

    /// Shake shakes the vending machine and randomly frees something with low probability
    function shake() external payable {
        require(msg.value == shakeFee, "Insufficient Funds");
        if (stuckItems.length != 0) {
            uint256 length = stuckItems.length;
            uint256 randItem = randMod(length); // gets two digit number
            Item memory stuckItem = stuckItems[randItem];
            uint256 rand = randMod(100); // gets two digit number
            if (rand < shakeSuccessProbability) {
                emit itemFreed(
                    stuckItem.name,
                    stuckItem.imageUrl,
                    stuckItem.description
                );
                removeFromStuck(randItem);
            } else {
                emit failed();
            }
        }
    }

    function removeFromStuck(uint256 _index) internal {
        require(_index >= 0, "No stuck item found");
        if (stuckItems.length > 1) {
            stuckItems[_index] = stuckItems[stuckItems.length - 1];
        }
        stuckItems.pop();
    }

    function setShakeFee(uint256 _fee) external onlyOwner {
        shakeFee = _fee;
    }

    function getStuckItemCount() external view returns (uint256) {
        return stuckItems.length;
    }

    function getAllItems() public view returns (Item[] memory) {
        return items; // step 4 - return
    }

    function getStuckItems() public view returns (Item[] memory) {
        return stuckItems; // step 4 - return
    }
}
