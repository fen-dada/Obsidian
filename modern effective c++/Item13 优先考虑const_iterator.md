我们更提倡在STL算法中使用`const_iterator`

考虑在c++11中写一个最大程度通用的库，而这样的库通常会优先考虑成员函数而非全局函数。在没有提供全局`cbegin()` `cend()` 函数时，
我们可以自己实现：
```cpp
template <class C>
auto cbegin(const C& container)->decltype(std::begin(container))
{
    return std::begin(container);   //解释见下
}
```

此时，如果穿进来的时容器，例如`std::vector<int>`，则`container`被推导为`std::const vector<int>`，此时自然生产出`const_iterator`

而对于原生的数组同样适用

**请记住：**

- 优先考虑`const_iterator`而非`iterator`
- 在最大程度通用的代码中，优先考虑非成员函数版本的`begin`，`end`，`rbegin`等，而非同名成员函数