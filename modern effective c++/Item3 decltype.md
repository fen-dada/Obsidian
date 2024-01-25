一般情况下decltype都是推断出变量声明的类型
## 用于声明函数模板
我们可以通过这个方法计算返回值类型
```cpp
template<typename Container, typename Index>    //可以工作，
auto authAndAccess(Container& c, Index i)       //但是需要改良
    ->decltype(c[i])
{
    authenticateUser();
    return c[i];
}
```
当c++14允许多条语句的lambda推断后，可以这样写
```cpp
template<typename Container, typename Index>    //C++14版本，
auto authAndAccess(Container& c, Index i)       //不那么正确
{
    authenticateUser();
    return c[i];                                //从c[i]中推导返回类型
}
```

但`auto`会产生`non-reference`的类型推断，导致不可以
```cpp
std::deque<int> d;
…
authAndAccess(d, 5) = 10;               //认证用户，返回d[5]，
                                        //然后把10赋值给它
                                        //无法通过编译器！

```

因此最终可以写成
```cpp
template<typename Container, typename Index>    //C++14版本，
decltype(auto)                                  //可以工作，
authAndAccess(Container& c, Index i)            //但是还需要
{                                               //改良
    authenticateUser();
    return c[i];
}
```

考虑到如果容器传进来一个右值，那么将返回一个悬挂引用，所以改为通用引用
```cpp
template<typename Container, typename Index>    //最终的C++14版本
decltype(auto)
authAndAccess(Container&& c, Index i)
{
    authenticateUser();
    return std::forward<Container>(c)[i];
}
```

## 特殊情况
当`decltype`的参数是复杂的左值表达式的时候，它会产生意想不到的情况，通常是一个左值的引用
```cpp
decltype(auto) f1()
{
    int x = 0;
    …
    return x;                            //decltype(x）是int，所以f1返回int
}

decltype(auto) f2()
{
    int x = 0;
    return (x);                          //decltype((x))是int&，所以f2返回int&
}
//返回了一个悬空引用
```
## 请记住
- `decltype`总是不加修改的产生变量或者表达式的类型。
- 对于`T`类型的不是单纯的变量名的左值表达式，`decltype`总是产出`T`的引用即`T&`。
- C++14支持`decltype(auto)`，就像`auto`一样，推导出类型，但是它使用`decltype`的规则进行推导。