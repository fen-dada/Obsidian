我们基于一个模板来讨论这个问题
```cpp
template<typename T>
void f(ParamType param);

f(expr);                        //从expr中推导T和ParamType
```

# `ParamType`是一个指针或者引用，但非通用引用

```cpp
template<typename T>
void f(T& param);               //param是一个引用
```
这种情况下`T`的推导会忽略掉引用性

```cpp
template<typename T> 
void f(const T& param);      //param现在是reference-to-const
```
这种情况下`T`的常量性也会被忽略

# `ParamType`是一个通用引用

- 如果`expr`是左值，`T`和`ParamType`都会被推导为左值引用。这非常不寻常，第一，这是模板类型推导中唯一一种`T`被推导为引用的情况。第二，虽然`ParamType`被声明为右值引用类型，但是最后推导的结果是左值引用。
- 如果`expr`是右值，就使用正常的（也就是**情景一**）推导规则
```cpp
template<typename T>
void f(T&& param);              //param现在是一个通用引用类型
        
int x=27;                       //如之前一样
const int cx=x;                 //如之前一样
const int & rx=cx;              //如之前一样

f(x);                           //x是左值，所以T是int&，
                                //param类型也是int&

f(cx);                          //cx是左值，所以T是const int&，
                                //param类型也是const int&

f(rx);                          //rx是左值，所以T是const int&，
                                //param类型也是const int&

f(27);                          //27是右值，所以T是int，
                                //param类型就是int&&
```

# `ParamType`既不是指针也不是引用
既然这样，函数模板就是值传递
```cpp
template<typename T>
void f(T param);                //以传值的方式处理param
```


- 和之前一样，如果`expr`的类型是一个引用，忽略这个引用部分
- 如果忽略`expr`的引用性（reference-ness）之后，`expr`是一个`const`，那就再忽略`const`。如果它是`volatile`，也忽略`volatile`（`volatile`对象不常见，它通常用于驱动程序的开发中。关于`volatile`的细节请参见[Item40](https://cntransgroup.github.io/EffectiveModernCppChinese/7.TheConcurrencyAPI/item40.html)）

因此
```cpp
int x=27;                       //如之前一样
const int cx=x;                 //如之前一样
const int & rx=cx;              //如之前一样

f(x);                           //T和param的类型都是int
f(cx);                          //T和param的类型都是int
f(rx);                          //T和param的类型都是int
```
`param`只是`expr`的一个拷贝，其常量性和引用性与拷贝没有关系。


# 数组实参
数组常常退化为指向第一个元素的指针
```cpp
const char name[] = "J. P. Briggs";     //name的类型是const char[13]

const char * ptrToName = name;          //数组退化为指针
```

于是
```cpp
f(name);                        //name是一个数组，但是T被推导为const char*
```
因为数组形参会视作指针形参，所以传值给模板的一个数组类型会被推导为一个指针类型。`name`被推导为 `const char *` ，退化为指针

但是现在难题来了，虽然函数不能声明形参为真正的数组，但是**可以**接受指向数组的**引用**！所以我们修改`f`为传引用：
```cpp
template<typename T>
void f(T& param);                       //传引用形参的模板

f(name);
```
在这个例子中`T`被推导为`const char[13]`，`f`的形参（对这个数组的引用）的类型则为`const char (&)[13]`。

有趣的是，可声明指向数组的引用的能力，使得我们可以创建一个模板函数来推导出数组的大小：
```cpp
//在编译期间返回一个数组大小的常量值（//数组形参没有名字，
//因为我们只关心数组的大小）
template<typename T, std::size_t N>                     //关于
constexpr std::size_t arraySize(T (&)[N]) noexcept      //constexpr
{                                                       //和noexcept
    return N;                                           //的信息
}                                                       //请看下面
```

# 函数实参
函数类型也会退化为一个函数指针
```cpp
void someFunc(int, double);         //someFunc是一个函数，
                                    //类型是void(int, double)

template<typename T>
void f1(T param);                   //传值给f1

template<typename T>
void f2(T & param);                 //传引用给f2

f1(someFunc);                       //param被推导为指向函数的指针，
                                    //类型是void(*)(int, double)
f2(someFunc);                       //param被推导为指向函数的引用，
                                    //类型是void(&)(int, double)
```

**请记住：**

- 在模板类型推导时，有引用的实参会被视为无引用，他们的引用会被忽略
- 对于通用引用的推导，左值实参会被特殊对待
- 对于传值类型推导，`const`和/或`volatile`实参会被认为是non-`const`的和non-`volatile`的
- 在模板类型推导时，数组名或者函数名实参会退化为指针，除非它们被用于初始化引用