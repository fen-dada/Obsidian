非限域`enum`会污染命名空间，存在隐式转换
限域`enum class`则相反

似乎比起非限域`enum`而言，限域`enum`有第三个好处，因为限域`enum`可以被前置声明。也就是说，它们可以不指定枚举名直接声明：
```cpp
enum Color;         //错误！
enum class Color;   //没问题
```
其实这是一个误导。在C++11中，非限域`enum`也可以被前置声明，但是只有在做一些其他工作后才能实现。这些工作来源于一个事实：在C++中所有的`enum`都有一个由编译器决定的整型的底层类型。

为了高效使用内存，编译器通常在确保能包含所有枚举值的前提下为`enum`选择一个最小的底层类型。在一些情况下，编译器将会优化速度，舍弃大小，这种情况下它可能不会选择最小的底层类型，而是选择对优化大小有帮助的类型。为此，C++98只支持`enum`定义（所有枚举名全部列出来）；`enum`声明是不被允许的。这使得编译器能在使用之前为每一个`enum`选择一个底层类型。

因此，非限域`enum`如果在后来追加枚举，那么所有的依赖要重新编译。

比如在社交网站中，假设我们有一个_tuple_保存了用户的名字，email地址，声望值：
```cpp
using UserInfo =                //类型别名，参见Item9
    std::tuple<std::string,     //名字
               std::string,     //email地址
               std::size_t> ;   //声望
```
我们更希望
```cpp
UserInfo uInfo;                 //tuple对象
…
auto val = std::get<Email>(uInfo);	//获取第一个字段
```
而不是
```cpp
UserInfo uInfo;                 //tuple对象
…
auto val = std::get<1>(uInfo);	//获取第一个字段
```

因此我们需要一个函数将`UserInfoFields`中的枚举名隐式转换成`std::size_t`
我们必须在编译期就知道`std::size_t`的值来决定如何实现，所以应当是`constexpr`
较之于返回`std::size_t`，我们更应该返回枚举的底层类型。这可以通过`std::underlying_type`这个_type trait_获得。
```cpp
template<typename E>
constexpr typename std::underlying_type<E>::type
    toUType(E enumerator) noexcept
{
    return
        static_cast<typename
                    std::underlying_type<E>::type>(enumerator);
}
```
优化后：
```cpp
template<typename E>                //C++14
constexpr std::underlying_type_t<E>
    toUType(E enumerator) noexcept
{
    return static_cast<std::underlying_type_t<E>>(enumerator);
}
```

**记住**

- C++98的`enum`即非限域`enum`。
- 限域`enum`的枚举名仅在`enum`内可见。要转换为其它类型只能使用_cast_。
- 非限域/限域`enum`都支持底层类型说明语法，限域`enum`底层类型默认是`int`。非限域`enum`没有默认底层类型。
- 限域`enum`总是可以前置声明。非限域`enum`仅当指定它们的底层类型时才能前置。