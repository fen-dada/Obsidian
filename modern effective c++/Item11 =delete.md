# 禁止函数被调用
## 成员函数
c++98中将不希望被调用的成员函数声明为`private`，而c++11中的可以通过`=delete`来实现。
这样可以在编译时就产生报错而不是在链接时。

## 一般函数
考虑我们不希望一些函数被隐式转换的数据调用：
```cpp
bool isLucky(int number);       //原始版本
bool isLucky(char) = delete;    //拒绝char
bool isLucky(bool) = delete;    //拒绝bool
bool isLucky(double) = delete;  //拒绝float和double
```

## 奇怪的特性
c++不能给特化的成员模板函数指定一个不同于主函数模板的访问级别
考虑：
```cpp
class Widget {
public:
    …
    template<typename T>
    void processPointer(T* ptr)
    { … }

private:
    template<>                          //错误！
    void processPointer<void>(void*);
    
};
```
函数模板在`public`中，而特化的函数在`private`中，这不被允许。
因此考虑`=delete`，因为它不需要一个不同的访问级别，且他们可以在类外被删除（因此位于命名空间作用域）
```cpp
class Widget {
public:
    …
    template<typename T>
    void processPointer(T* ptr)
    { … }
    …

};

template<>                                          //还是public，
void Widget::processPointer<void>(void*) = delete;  //但是已经被删除了
```



**请记住：**

- 比起声明函数为`private`但不定义，使用_deleted_函数更好
- 任何函数都能被删除（be deleted），包括非成员函数和模板实例（译注：实例化的函数）