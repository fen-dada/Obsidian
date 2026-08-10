要想实现两个多项式的乘法，每一项相乘O(n^2)，于是考虑点值相乘，这个阶段的复杂度是O(n)的。
在将一个多项式变成n=2^k个点值时，有规律地取点可以帮助我们简化计算，例如当函数是偶函数时，取两个相反的x会得到同一个y，因此我们将多项式分解成奇函数和偶函数相加，并且提出奇函数中的一个x使剩下的部分变成偶函数。然后我们取n个单位复根，也就是z^n=1的n个复根，通过递归算出只有一项的值，再返回通过单位复根的性质计算出多项式的函数值，最后得出n=2^k个点值。
逆变换时思路同样如此，现在得到的相乘以后的复根相当于是一个向量，它可以通过要求的函数的系数向量左乘上单位复根组成的矩阵得到。因此我们只需要取它的逆矩阵，也就是在正变换的基础上把所有的单位复根改为倒数再除以多项式项数n，就可以得到每一项的系数。
递归版
```cpp
void DFT(Comp* f, int n, int rev) {
  if (n == 1) return;
  for (int i = 0; i < n; ++i) tmp[i] = f[i];
  // 偶数放左边，奇数放右边
  for (int i = 0; i < n; ++i) {
    if (i & 1)
      f[n / 2 + i / 2] = tmp[i];
    else
      f[i / 2] = tmp[i];
  }
  Comp *g = f, *h = f + n / 2;
  DFT(g, n / 2, rev), DFT(h, n / 2, rev);
  Comp cur(1, 0), step(cos(2 * M_PI / n), sin(2 * M_PI * rev / n));
  for (int k = 0; k < n / 2;++k) {
    tmp[k] = g[k] + cur * h[k];
    tmp[k + n / 2] = g[k] - cur * h[k];
    cur *= step;
  }
  for (int i = 0; i < n; ++i) f[i] = tmp[i];
}
```

迭代版
```cpp
void change(Complex y[], int len) {
  for (int i = 0; i < len; ++i) {
    rev[i] = rev[i >> 1] >> 1;
    if (i & 1) {  
      rev[i] |= len >> 1;
    }
  }
  for (int i = 0; i < len; ++i) {
    if (i < rev[i]) {  
      swap(y[i], y[rev[i]]);
    }
  }
  return;
}
void fft(Complex y[], int len, int on) {
  change(y, len);
  for (int h = 2; h <= len; h <<= 1) {
    Complex wn(cos(2 * PI / h), sin(on * 2 * PI / h));
    for (int j = 0; j < len; j += h) {
      Complex w(1, 0);
      for (int k = j; k < j + h / 2; k++) {
        // 左侧部分和右侧是子问题的解
        Complex u = y[k];
        Complex t = w * y[k + h / 2];
        // 这就是把两部分分治的结果加起来
        y[k] = u + t;
        y[k + h / 2] = u - t;
        w = w * wn;
      }
    }
  }
  if (on == -1) {
    for (int i = 0; i < len; i++) {
      y[i].x /= len;
      y[i].y /= len;
    }
  }
}
```