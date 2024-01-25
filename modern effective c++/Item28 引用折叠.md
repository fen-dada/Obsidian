当存在通用引用时，左值被推倒为左值引用，右值被推倒为本身
而通常在通用引用中结合`std::forward`用
```cpp
template<typename T>
void f(T&& fParam)
{
    …                                   //做些工作
    someFunc(std::forward<T>(fParam));  //转发fParam到someFunc
}
```
其中，`std::forward`的实现为
```cpp
template<typename T>                        //C++14；仍然在std命名空间
T&& forward(remove_reference_t<T>& param)
{
  return static_cast<T&&>(param);
}
```
传左值则`T`为`T&`，`return`语句中`<T& &&>`折叠为`<T&>`最终转发左值引用
右值时则为`T`，`return`中为`<T&&>`不变

**请记住：**

- 引用折叠发生在四种情况下：模板实例化，`auto`类型推导，`typedef`与别名声明的创建和使用，`decltype`。
- 当编译器在引用折叠环境中生成了引用的引用时，结果就是单个引用。有左值引用折叠结果就是左值引用，否则就是右值引用。
- 通用引用就是在特定上下文的右值引用，上下文是通过类型推导区分左值还是右值，并且发生引用折叠的那些地方。