# underscore Source code analysis 

## underscore源码学习计划

![Alt text](docs/images/underscore.png)

我把这次underscore源码学习计划分为两大部分

>> 1、源码学习与分析

>> 2、实战练习与使用 

### 源码学习与分析

源码分析，我会跟着前辈(@captbaritone)的代码一行一行的敲，结合一些文章。

目的是学习前辈(@captbaritone)的代码思路和技巧

### 实战练习和使用

实战练习，我会结合我的JavaScript函数式编程这本书，对函数式编程做一个总体的学习、

----------

## 分析

### 集合函数
1) each
_.each(list, iteratee, [context]) Alias: forEach 遍历list中的所有元素，按顺序用每个元素当做参数调用 iteratee 函数。如果传递了context参数，则把iteratee绑定到context对象上。每次调用iteratee都会传递三个参数：(element, index, list)。如果list是个JavaScript对象，iteratee的参数是 (value, key, list))。返回list以方便链式调用。
 ```
_.each([1, 2, 3], alert);
=> alerts each number in turn...
_.each({one: 1, two: 2, three: 3}, alert);
=> alerts each number value in turn...
 ```
注意：集合函数能在数组，对象，和类数组对象，比如arguments, NodeList和类似的数据类型上正常工作。 但是它通过鸭子类型工作，所以要避免传递带有一个数值 length 属性的对象。每个循环不能被破坏 - 打破， 使用_.find代替，这也是很好的注意。  
 
 2)map
 _.map(list, iteratee, [context]) Alias: collect 
通过对list里的每个元素调用转换函数(iteratee迭代器)生成一个与之相对应的数组。iteratee传递三个参数：value，然后是迭代 index(或 key 愚人码头注：如果list是个JavaScript对象是，这个参数就是key)，最后一个是引用指向整个list。
```
_.map([1, 2, 3], function(num){ return num * 3; });
=> [3, 6, 9]
_.map({one: 1, two: 2, three: 3}, function(num, key){ return num * 3; });
=> [3, 6, 9]
_.map([[1, 2], [3, 4]], _.first);
=> [1, 3]
  ```
