## 第二章：Solidity 快速入门

### 一、填空题

1. Solidity中存储成本最高的变量类型是`_storage__`变量，其数据永久存储在区块链上。  
2. 使用`_constant__`关键字声明的常量可以节省Gas费，其值必须在编译时确定。  
4. 当合约收到不带任何数据的以太转账时，会自动触发`_receive__`函数。  

---

### 二、选择题

4. 函数选择器(selector)的计算方法是：  
   **A)** sha3(函数签名)  
   **B)** 函数名哈希的前4字节  
   **C)** 函数参数的ABI编码  
   **D)** 函数返回值的类型哈希  
答案：B
5. 以下关于mapping的叙述错误的是：  
   **A)** 键类型可以是任意基本类型  
   **B)** 值类型支持嵌套mapping  
   **C)** 可以通过`length`属性获取大小  
   **D)** 无法直接遍历所有键值对  
答案：C
---

### 三、简答题

6. 请说明`require`、`assert`、`revert`三者的使用场景差异（从触发条件和Gas退还角度）

   1. **require**
   - 使用场景：
     - 验证输入参数
     - 验证外部调用的返回值
     - 检查执行条件
     - 验证状态变量
   - Gas处理：
     - 会退还剩余的 gas 给用户
   - 示例：
   ```solidity
   function transfer(address to, uint amount) public {
       require(amount <= balance[msg.sender], "余额不足");
       require(to != address(0), "不能转账给零地址");
       // ... 执行转账逻辑
   }
   ```

   2. **assert**
   - 使用场景：
     - 检查内部错误
     - 验证不变量
     - 确保代码中不会出现的情况
   - Gas处理：
     - 消耗所有 gas（不退还）
     - 会触发 Panic 错误
   - 示例：
   ```solidity
   function divide(uint a, uint b) public pure returns (uint) {
       assert(b != 0); // 这是一个内部检查，正常情况下不应该发生
       return a / b;
   }
   ```

   3. **revert**
   - 使用场景：
     - 需要更复杂的条件判断
     - 需要提供详细的错误信息
     - 自定义错误类型
   - Gas处理：
     - 会退还剩余的 gas 给用户
   - 示例：
   ```solidity
   function complexCheck(uint value) public {
       if (value < 10) {
           revert("值必须大于10");
       }
       // 或使用自定义错误
       if (value > 100) {
           revert ValueTooHigh(value);
       }
   }

   // 自定义错误
   error ValueTooHigh(uint value);
   ```

   总结比较：
   1. Gas 退还：
      - `require` 和 `revert`: 会退还剩余 gas
      - `assert`: 消耗所有 gas

   2. 使用建议：
      - `require`: 用于验证外部输入和条件
      - `assert`: 用于确保内部逻辑永远正确
      - `revert`: 用于复杂条件判断和自定义错误

   3. 最佳实践：
   ```solidity
   contract Example {
       mapping(address => uint) public balances;

       function deposit() public payable {
           // require 用于验证外部输入
           require(msg.value > 0, "必须发送ETH");

           // assert 用于确保内部状态一致性
           uint oldBalance = balances[msg.sender];
           balances[msg.sender] += msg.value;
           assert(balances[msg.sender] > oldBalance);

           // revert 用于复杂条件
           if (balances[msg.sender] > 1000 ether) {
               revert BalanceTooHigh(msg.sender, balances[msg.sender]);
           }
       }

       error BalanceTooHigh(address user, uint balance);
   }
   ```
```


7. 某合约同时继承A和B合约，两者都有`foo()`函数：

```solidity
contract C is A, B {
    function foo() override(A,B) {...}
}
```

实际执行时会调用哪个合约的函数？为什么？

   会执行合约 C 中重写的 `foo()` 函数。这涉及到 Solidity 的继承和函数重写机制：

   1. **函数重写机制**
   - 使用 `override` 关键字表明这是一个重写函数
   - `override(A,B)` 明确指出重写了哪些合约的函数
   - C 合约中的 `foo()` 函数会完全覆盖父合约 A 和 B 中的同名函数

   2. **继承顺序**
   - Solidity 使用 C3 线性化算法来处理多重继承
   - 继承顺序是从右到左（在这里是 B -> A）
   - 如果不重写，默认会调用最右边合约（B）的函数

   3. **正确的重写方式**
   ```solidity
   contract C is A, B {
       // 必须使用 override 关键字并指明所有被重写的合约
       function foo() public override(A, B) {
           // 如果需要调用父合约的实现：
           A.foo();  // 调用 A 的实现
           B.foo();  // 调用 B 的实现
           // 自己的实现...
       }
   }
   ```

   4. **为什么需要明确指出所有被重写的合约？**
   - 避免意外重写
   - 提高代码可读性
   - 确保开发者了解所有被重写的函数来源
   - 编译器可以进行更好的检查

这种设计确保了在多重继承情况下的函数调用是明确和可预测的，避免了"钻石问题"（diamond problem）的歧义。


8. 当使用`call`方法发送ETH时，以下两种写法有何本质区别？

```solidity
(1) addr.call{value: 1 ether}("")
(2) addr.transfer(1 ether)
```

   1. **Gas限制**
      - `transfer`: 固定转发2300 gas，这个gas量只够执行基本的接收逻辑
      - `call`: 可以转发所有可用的gas，或通过{gas: value}指定gas数量

   2. **错误处理**
      - `transfer`: 如果执行失败会自动revert整个交易
      - `call`: 返回bool值表示执行结果，需要手动检查返回值并处理错误

   3. **安全性考虑**
      - `transfer`: 由于gas限制，可以预防重入攻击
      - `call`: 没有gas限制，调用者需要自行实现重入保护（如使用ReentrancyGuard）

   4. **推荐使用**
      - 目前推荐使用`call`方式，因为`transfer`的固定gas限制可能导致接收合约由于gas成本变化而永久无法接收ETH
      - 使用`call`时的最佳实践：
   ```solidity
   (bool success, ) = addr.call{value: 1 ether}("");
   require(success, "Transfer failed");
   ```

   5. **兼容性**
      - `transfer`: 在接收合约的fallback/receive函数gas消耗增加的情况下可能失败
      - `call`: 更灵活，适应性更强，是当前推荐的ETH转账方式

   总的来说，`call`提供了更大的灵活性但需要更谨慎的错误处理，而`transfer`则更简单但有其局限性。在现代智能合约开发中，`call`是更受欢迎的选择。