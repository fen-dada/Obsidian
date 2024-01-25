## `constexpr`对象

这样的对象要求在翻译期（编译+链接）可知，这样的对象包括数组大小，整数模板参数（包括`std::array`对象的长度），枚举名的值，对齐修饰符（译注：[`alignas(val)`](https://en.cppreference.com/w/cpp/language/alignas)），等等
```cpp
int sz;                             //non-constexpr变量
…
constexpr auto arraySize1 = sz;     //错误！sz的值在
                                    //编译期不可知
std::array<int, sz> data1;          //错误！一样的问题
constexpr auto arraySize2 = 10;     //没问题，10是
                                    //编译期可知常量
std::array<int, arraySize2> data2;  //没问题, arraySize2是constexpr
```
注意`const`不提供`constexpr`所能保证之事，因为`const`对象不需要在编译期初始化它的值。
```cpp
int sz;                            //和之前一样
…
const auto arraySize = sz;         //没问题，arraySize是sz的const复制
std::array<int, arraySize> data;   //错误，arraySize值在编译期不可知
```

## `constexpr`函数

这样的函数可以在参数列表为编译期可知时返回一个`constexpr`对象，也可以当作一个运行时函数来用
```cpp
constexpr                                   //pow是绝不抛异常的
int pow(int base, int exp) noexcept         //constexpr函数
{
	return (exp == 0 ? 1 : base * pow(base, exp - 1));                       
}
constexpr auto numConds = 5;                //（上面例子中）条件的个数
std::array<int, pow(3, numConds)> results;  //结果有3^numConds个元素

```

**请记住：**

- `constexpr`对象是`const`，它被在编译期可知的值初始化
- 当传递编译期可知的值时，`constexpr`函数可以产出编译期可知的结果
- `constexpr`对象和函数可以使用的范围比non-`constexpr`对象和函数要大
- `constexpr`是对象和函数接口的一部分