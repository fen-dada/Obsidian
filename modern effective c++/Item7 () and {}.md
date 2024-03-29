C++规定任何**可以被解析**为一个声明的东西**必须被解析**为声明。这个规则的副作用是让很多程序员备受折磨：他们可能想创建一个使用默认构造函数构造的对象，却不小心变成了函数声明。问题的根源是如果你调用带参构造函数，你可以这样做：

```cpp
Widget w1(10);                  //使用实参10调用Widget的一个构造函数
```


但是如果你尝试使用相似的语法调用`Widget`无参构造函数，它就会变成函数声明：
```cpp
Widget w2();                    //最令人头疼的解析！声明一个函数w2，返回Widget
```


由于函数声明中形参列表不能带花括号，所以使用花括号初始化表明你想调用默认构造函数构造对象就没有问题：
```cpp
Widget w3{};                    //调用没有参数的构造函数构造对象
```


当有参数为`std::initializer_list`的构造函数时，任何使用花括号的构造函数都会优先使用这个构造函数。当其中的类型为变窄的转换时，编译报错。当其中的类型不存在隐式转换时，会考虑其他的有参构造。

如果你**想**用空`std::initializer`来调用`std::initializer_list`构造函数，你就得创建一个空花括号作为函数实参——把空花括号放在圆括号或者另一个花括号内来界定你想传递的东西。
```cpp
Widget w4({});                  //使用空花括号列表调用std::initializer_list构造函数 
Widget w5{{}};                  //同上
```

**请记住：**

- 花括号初始化是最广泛使用的初始化语法，它防止变窄转换，并且对于C++最令人头疼的解析有天生的免疫性
- 在构造函数重载决议中，编译器会尽最大努力将括号初始化与`std::initializer_list`参数匹配，即便其他构造函数看起来是更好的选择
- 对于数值类型的`std::vector`来说使用花括号初始化和圆括号初始化会造成巨大的不同
- 在模板类选择使用圆括号初始化或使用花括号初始化创建对象是一个挑战。