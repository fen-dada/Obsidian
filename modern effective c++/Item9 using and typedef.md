# alias template
```cpp
template<typename T>                            //MyAllocList<T>是
using MyAllocList = std::list<T, MyAlloc<T>>;   //std::list<T, MyAlloc<T>>
                                                //的同义词

MyAllocList<Widget> lw;                         //用户代码
```

如果使用typedef，就只能：
```cpp
template<typename T>                            //MyAllocList<T>是
struct MyAllocList {                            //std::list<T, MyAlloc<T>>
    typedef std::list<T, MyAlloc<T>> type;      //的同义词  
};

MyAllocList<Widget>::type lw;                   //用户代码
```

更糟糕的是，如果你想使用在一个模板内使用`typedef`声明一个链表对象，而这个对象又使用了模板形参，你就不得不在`typedef`前面加上`typename`：
```cpp
template<typename T>
class Widget {                              //Widget<T>含有一个
private:                                    //MyAllocLIst<T>对象
    typename MyAllocList<T>::type list;     //作为数据成员
    …
}; 
```

这里`MyAllocList<T>::type`使用了一个类型，这个类型依赖于模板参数`T`。因此`MyAllocList<T>::type`是一个依赖类型（_dependent type_），在C++很多讨人喜欢的规则中的一个提到必须要在依赖类型名前加上`typename`。

**请记住：**

- `typedef`不支持模板化，但是别名声明支持。
- 别名模板避免了使用“`::type`”后缀，而且在模板中使用`typedef`还需要在前面加上`typename`
- C++14提供了C++11所有_type traits_转换的别名声明版本