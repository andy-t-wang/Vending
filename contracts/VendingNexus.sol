pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "hardhat/console.sol";

contract Vending is Ownable {
    using SafeMath for uint256;

    uint256 stuckProbability = 30;
    uint256 randNonce = 0;

    struct Item {
        string name;
        string imageUrl;
        string description;
        uint8 vendCost;
        uint16 initialStock;
    }

    Item[] public items;
    mapping(uint256 => uint256) public itemStock;
    Item[] public stuckItems;

    constructor() {
        items.push(
            Item(
                "Coke Poster",
                "https://images.unsplash.com/photo-1622281587418-f2f4fc06ae7a?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=668&q=80",
                "Woman holding Coke",
                4,
                5
            )
        );
        itemStock[0] = 0;
        items.push(
            Item(
                "National Park Poster",
                "https://images.unsplash.com/photo-1506318195885-cad052e78271?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2601&q=80",
                "Some fking mountain somewhere",
                8,
                5
            )
        );
        itemStock[1] = 3;
        items.push(
            Item(
                "Stars",
                "https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=640&q=80",
                "Some nice stars in the woods",
                3,
                5
            )
        );
        itemStock[2] = 6;
    }

    event itemStuck(string name, string imageUrl, string description);
    event itemBought(string name, string imageUrl, string description);
    event restockSuccess();
    modifier validIndex(uint256 index) {
        require(index < items.length);
        _;
    }

    // Check if Item gets stuck
    function stuck() internal returns (bool) {
        uint256 rand = randMod(100);
        if (rand < stuckProbability) {
            return false;
        }
        return true;
    }

    function reStock() external onlyOwner {
        for (uint256 i = 0; i < items.length; i++) {
            uint16 stock = items[i].initialStock;
            itemStock[i] = stock;
        }
        emit restockSuccess();
    }

    function randMod(uint256 _modulus) internal returns (uint256) {
        randNonce = randNonce.add(1);
        return
            uint256(
                keccak256(
                    abi.encodePacked(block.timestamp, msg.sender, randNonce)
                )
            ) % _modulus;
    }

    function getLength() external view returns (uint256) {
        return items.length;
    }

    function getItemCount(uint256 index)
        external
        view
        validIndex(index)
        returns (uint256)
    {
        return itemStock[index];
    }

    function getItemPrice(uint256 index)
        public
        view
        validIndex(index)
        returns (uint8)
    {
        return items[index].vendCost;
    }
}
