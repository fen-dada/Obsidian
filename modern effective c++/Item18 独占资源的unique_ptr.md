`std::unique_ptr`体现了专有所有权（_exclusive ownership_）语义。移动一个`std::unique_ptr`将所有权从源指针转移到目的指针。（源指针被设为null。）因此，`std::unique_ptr`是一种只可移动类型（_move-only type_）。默认情况下，资源析构通过对`std::unique_ptr`里原始指针调用`delete`来实现。

## 自定义删除器
在构造对象时，可以自定义删除器来对指针定制
```cpp
auto delInvmt = [](Investment* pInvestment)         //自定义删除器
                {                                   //（lambda表达式）
                    makeLogEntry(pInvestment);
                    delete pInvestment; 
                };

template<typename... Ts>
std::unique_ptr<Investment, decltype(delInvmt)>     //更改后的返回类型
makeInvestment(Ts&&... params)
{
    std::unique_ptr<Investment, decltype(delInvmt)> //应返回的指针
        pInv(nullptr, delInvmt);
    if (/*一个Stock对象应被创建*/)
    {
        pInv.reset(new Stock(std::forward<Ts>(params)...));
    }
    else if ( /*一个Bond对象应被创建*/ )   
    {     
        pInv.reset(new Bond(std::forward<Ts>(params)...));   
    }   
    else if ( /*一个RealEstate对象应被创建*/ )   
    {     
        pInv.reset(new RealEstate(std::forward<Ts>(params)...));   
    }   
    return pInv;
}
```
对于函数对象形式的删除器来说，变化的大小取决于函数对象中存储的状态多少，无状态函数（stateless function）对象（比如不捕获变量的_lambda_表达式）对大小没有影响，这意味当自定义删除器可以实现为函数或者_lambda_时，尽量使用_lambda_
```cpp
auto delInvmt1 = [](Investment* pInvestment)        //无状态lambda的
                 {                                  //自定义删除器
                     makeLogEntry(pInvestment);
                     delete pInvestment; 
                 };

template<typename... Ts>                            //返回类型大小是
std::unique_ptr<Investment, decltype(delInvmt1)>    //Investment*的大小
makeInvestment(Ts&&... args);

void delInvmt2(Investment* pInvestment)             //函数形式的
{                                                   //自定义删除器
    makeLogEntry(pInvestment);
    delete pInvestment;
}
template<typename... Ts>                            //返回类型大小是
std::unique_ptr<Investment, void (*)(Investment*)>  //Investment*的指针
makeInvestment(Ts&&... params);                     //加至少一个函数指针的大小
```

**请记住：**

- `std::unique_ptr`是轻量级、快速的、只可移动（_move-only_）的管理专有所有权语义资源的智能指针
- 默认情况，资源销毁通过`delete`实现，但是支持自定义删除器。有状态的删除器和函数指针会增加`std::unique_ptr`对象的大小
- 将`std::unique_ptr`转化为`std::shared_ptr`非常简单