## 和模板一样
情景二像你期待的一样运作：
```cpp
auto&& uref1 = x;               //x是int左值，
                                //所以uref1类型为int&
auto&& uref2 = cx;              //cx是const int左值，
                                //所以uref2类型为const int&
auto&& uref3 = 27;              //27是int右值，
                                //所以uref3类型为int&&
```

关于数组退化成指针，`auto`也同样适用
```cpp
const char name[] =             //name的类型是const char[13]
 "R. N. Briggs";

auto arr1 = name;               //arr1的类型是const char*
auto& arr2 = name;              //arr2的类型是const char (&)[13]

void someFunc(int, double);     //someFunc是一个函数，
                                //类型为void(int, double)

auto func1 = someFunc;          //func1的类型是void (*)(int, double)
auto& func2 = someFunc;         //func2的类型是void (&)(int, double)
```

## 一个比较特殊的例子
```cpp
int x1 = 27;

int x2(27);

int x3 = { 27 };

int x4{ 27 };
```
如果换成`auto`，则
```cpp
auto x1 = 27;                   //类型是int，值是27
auto x2(27);                    //同上
auto x3 = { 27 };               //类型是std::initializer_list<int>，
                                //值是{ 27 }
auto x4{ 27 };                  //同上
```
因此，这样是不正确的
```cpp
auto x5 = { 1, 2, 3.0 };        //错误！无法推导std::initializer_list<T>中的T
```

## 一个区别
```cpp
auto x = { 11, 23, 9 };         //x的类型是std::initializer_list<int>

template<typename T>            //带有与x的声明等价的
void f(T param);                //形参声明的模板

f({ 11, 23, 9 });               //错误！不能推导出T
```
`auto`可以推导出`initializer_list`而模板参数不可以
因此只能这样用
```cpp
template<typename T>
void f(std::initializer_list<T> initList);

f({ 11, 23, 9 });               //T被推导为int，initList的类型为
                                //std::initializer_list<int>
```

## c++14
C++14的_lambda_函数也允许在形参声明中使用`auto`。但是在这些情况下`auto`实际上使用**模板类型推导**的那一套规则在工作，而不是`auto`类型推导，所以说下面这样的代码不会通过编译：
```cpp
auto createInitList()
{
    return { 1, 2, 3 };         //错误！不能推导{ 1, 2, 3 }的类型
}
```

同样在C++14的lambda函数中这样使用auto也不能通过编译：
```cpp
std::vector<int> v;
…
auto resetV = 
    [&v](const auto& newValue){ v = newValue; };        //C++14
…
resetV({ 1, 2, 3 });            //错误！不能推导{ 1, 2, 3 }的类型
```

**请记住：**

- `auto`类型推导通常和模板类型推导相同，但是`auto`类型推导假定花括号初始化代表`std::initializer_list`，而模板类型推导不这样做
- 在C++14中`auto`允许出现在函数返回值或者_lambda_函数形参中，但是它的工作机制是模板类型推导那一套方案，而不是`auto`类型推导