# 手写一个vector容器
[跳转到视频](https://www.bilibili.com/video/BV1iX4y1w7x4/?spm_id_from=333.999.0.0&vd_source=5b642dc5ae3b0c1cf2f2ea15435ac7a6)
## 关于`new`
new是一个全局的函数，会先调用`operator new`和元素的构造函数
而`::new`也是一个全局的函数，称为**placement new**，它将在传入指针的地址中调用指定元素的构造函数从而构造出一个对象

## 关于`operator new`
`operator new`是一个全局的函数，不可被重载，一般被`new`调用
而`::operator new` 则可以被重载，完成自定义的内存分配
两者都是申请一块指定大小的空间

## 关于可变参数的模板函数调用
```cpp
template<Args... args>
...
void foo(std::forward<Args>(args)...);
```

## TODO
如何实现对于左值和右值的=的重载？