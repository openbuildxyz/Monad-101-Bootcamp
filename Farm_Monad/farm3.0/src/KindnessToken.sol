// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract KindnessToken is ERC20, Ownable {
    uint256 public constant DAILY_HELP_LIMIT = 15;
    uint256 public constant HELP_REWARD = 1 * 10**18; // 1 KIND token
    
    mapping(address => mapping(uint256 => uint256)) public dailyHelpCount;
    mapping(address => uint256) public lastHelpDay;
    
    event KindnessRewarded(address indexed helper, address indexed helped, uint256 amount);
    event DailyLimitReached(address indexed helper, uint256 day);
    
    constructor() ERC20("Kindness Token", "KIND") Ownable(msg.sender) {}
    
    function rewardKindness(address helper, address helped) external onlyOwner {
        require(helper != helped, "KIND: Cannot help yourself");
        
        uint256 currentDay = block.timestamp / 1 days;
        
        if (lastHelpDay[helper] < currentDay) {
            dailyHelpCount[helper][currentDay] = 0;
            lastHelpDay[helper] = currentDay;
        }
        
        require(dailyHelpCount[helper][currentDay] < DAILY_HELP_LIMIT, "KIND: Daily help limit reached");
        
        dailyHelpCount[helper][currentDay]++;
        _mint(helper, HELP_REWARD);
        
        emit KindnessRewarded(helper, helped, HELP_REWARD);
        
        if (dailyHelpCount[helper][currentDay] == DAILY_HELP_LIMIT) {
            emit DailyLimitReached(helper, currentDay);
        }
    }
    
    function getRemainingDailyHelps(address helper) external view returns (uint256) {
        uint256 currentDay = block.timestamp / 1 days;
        
        if (lastHelpDay[helper] < currentDay) {
            return DAILY_HELP_LIMIT;
        }
        
        uint256 used = dailyHelpCount[helper][currentDay];
        return used >= DAILY_HELP_LIMIT ? 0 : DAILY_HELP_LIMIT - used;
    }
    
    function getDailyHelpCount(address helper, uint256 day) external view returns (uint256) {
        return dailyHelpCount[helper][day];
    }
    
    function getCurrentDay() external view returns (uint256) {
        return block.timestamp / 1 days;
    }
    
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }
}