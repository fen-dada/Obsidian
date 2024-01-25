有些时候，对`move`的操作实际上变成了拷贝
```cpp
class Annotation {
public:
    explicit Annotation(const std::string text)
    ：value(std::move(text))    //“移动”text到value里；这段代码执行起来
    { … }                       //并不是看起来那样
    
    …

private:
    std::string value;
};
```
虽然考虑到构造函数不需要改变变量，声明为const，但`move`操作通常被认为要修改对象，所以不存在一个参数为`const`的右值移动构造函数
```cpp
class string {                  //std::string事实上是
public:                         //std::basic_string<char>的类型别名
    …
    string(const string& rhs);  //拷贝构造函数
    string(string&& rhs);       //移动构造函数
    …
};
```
因此移动变成了拷贝操作

**请记住：**

- `std::move`执行到右值的无条件的转换，但就自身而言，它不移动任何东西。
- `std::forward`只有当它的参数被绑定到一个右值时，才将参数转换为右值。
- `std::move`和`std::forward`在运行期什么也不做。