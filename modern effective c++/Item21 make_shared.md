**请记住：**

- 和直接使用`new`相比，`make`函数消除了代码重复，提高了异常安全性。对于`std::make_shared`和`std::allocate_shared`，生成的代码更小更快。
- 不适合使用`make`函数的情况包括需要指定自定义删除器和希望用花括号初始化。
- 对于`std::shared_ptr`s，其他不建议使用`make`函数的情况包括(1)有自定义内存管理的类；(2)特别关注内存的系统，非常大的对象，以及`std::weak_ptr`s比对应的`std::shared_ptr`s活得更久。