# SOS DP：区域赛常用模板与推导

> C++17。重点掌握子集／超集求和、逆变换、最值查询和 OR／AND 卷积；不交子集卷积作为进阶备用。本文所有集合都用二进制掩码表示，子集和超集均包含自身。

## 1. 约定与选型

令位数为 $n$，$N=2^n$，全集掩码为 $U=N-1$。掩码 $S$ 对应一个集合，$|S|$ 表示 `popcount(S)`；空集对应掩码 `0`。

- $A\subseteq B$：`(A & B) == A`。
- $A\cup B$：`A | B`；$A\cap B$：`A & B`。
- 全集内的补集：`U ^ S`。不要直接用 `~S`。
- 下面模板默认数组长度为 $2^n$，且输入位宽能安全地使用 `1 << n`。实际限制通常首先来自指数级内存。

| 题目结构 | 应使用的工具 | 时间 |
| --- | --- | --- |
| 对所有 $T\subseteq S$ 求和／最值／存在性 | 子集 SOS | $O(n2^n)$ |
| 对所有 $T\supseteq S$ 求和／最值／存在性 | 超集 SOS | $O(n2^n)$ |
| 从所有子集和／超集和恢复原数组 | 莫比乌斯逆变换 | $O(n2^n)$ |
| $A\cup B=S$ 的加乘贡献 | OR 卷积 | $O(n2^n)$ |
| $A\cap B=S$ 的加乘贡献 | AND 卷积 | $O(n2^n)$ |
| $A\cup B=S$ 且 $A\cap B=\varnothing$ | 不交子集卷积 | $O(n^2 2^n)$ |

代码块默认已有以下公共头部。带函数名的模板可以按需要拼接；应用片段放在自己的函数中。

```cpp
#include <bits/stdc++.h>
using namespace std;
using ll = long long;
```

`T` 可以是 `long long`，也可以是第 9 节的模整数 `Mint`。使用整数时必须保证中间结果也不溢出；模数题不要先用普通整数算完整个变换再取模。

## 2. 基础 SOS 与逆变换【必会】

### 2.1 子集求和：从去掉一位的状态转移

目标是计算每个集合的子集和：

$$
F[S]=\sum_{T\subseteq S}f[T].
$$

暴力对每个 $S$ 枚举子集，所有状态合计 $3^n$ 次。SOS 按位处理，把它降到 $O(n2^n)$。

设 $D_b[S]$ 表示：已经允许删除前 $b$ 个二进制位，尚未处理的位必须与 $S$ 一致时，所有对应原始状态的贡献之和。初始 $D_0[S]=f[S]$。

处理第 $b$ 位时，如果 $S$ 这一位为 1，所有方案分为“保留这一位”和“删除这一位”两类：

$$
D_{b+1}[S]=D_b[S]+D_b[S\setminus\{b\}].
$$

两类互不相交，也覆盖全部方案。如果这一位为 0，则不能再删除，状态不变。处理完 $n$ 位，所有子集恰好被统计一次。

```cpp
template<class T>
void subset_zeta(vector<T>& f, int n, bool inverse = false) {
    int N = 1 << n;
    assert((int)f.size() == N);
    for (int b = 0; b < n; ++b) {
        for (int s = 0; s < N; ++s) {
            if (s & (1 << b)) {
                if (inverse) f[s] -= f[s ^ (1 << b)];
                else         f[s] += f[s ^ (1 << b)];
            }
        }
    }
}
```

**必须把位循环放外层。** 同一轮只修改第 $b$ 位为 1 的状态，读取的来源状态第 $b$ 位为 0，本轮不会修改，因此可以原地转移。该轮内掩码正序或倒序都可以。

### 2.2 超集求和：从补上一位的状态转移

目标为：

$$
G[S]=\sum_{T\supseteq S}f[T].
$$

把过程改成“逐位允许添加元素”。当 $S$ 的第 $b$ 位为 0 时，把包含这一位的状态合并进来。

```cpp
template<class T>
void superset_zeta(vector<T>& f, int n, bool inverse = false) {
    int N = 1 << n;
    assert((int)f.size() == N);
    for (int b = 0; b < n; ++b) {
        for (int s = 0; s < N; ++s) {
            if (!(s & (1 << b))) {
                if (inverse) f[s] -= f[s | (1 << b)];
                else         f[s] += f[s | (1 << b)];
            }
        }
    }
}
```

记忆：**子集，1 从 0 来；超集，0 从 1 来。** 两者时间均为 $O(n2^n)$，原地变换的额外空间为 $O(1)$。

### 2.3 为什么逆变换只需把加法改为减法？

对某一位，正变换只做 `目标 += 来源`，来源本轮不变，所以逆操作是 `目标 -= 来源`。不同位的操作彼此可交换，因此逆变换仍可按原来的位序执行。

对应的容斥公式为：

$$
f[S]=\sum_{T\subseteq S}(-1)^{|S|-|T|}F[T],
\qquad
f[S]=\sum_{T\supseteq S}(-1)^{|T|-|S|}G[T].
$$

例如只有一位时，子集和为 $F[0]=f[0]$、$F[1]=f[0]+f[1]$，还原只需 $f[1]=F[1]-F[0]$。

```cpp
auto sub = a;
subset_zeta(sub, n);        // sub[s] = 所有子集的和
subset_zeta(sub, n, true);  // 恢复成 a

auto sup = a;
superset_zeta(sup, n);      // sup[s] = 所有超集的和
superset_zeta(sup, n, true); // 恢复成 a
```

严格子集和等于 `sub[s] - a[s]`，必须保留原数组。逆变换需要减法；最值和存在性不能照搬这个逆操作。

## 3. 最值、存在性与位运算查询【必会】

### 3.1 把求和换成合并操作

原来的划分证明不依赖加法，可以把贡献合并换成 `max`、`min`、逻辑或等满足结合律和交换律的操作。

```cpp
template<class T, class Merge>
void subset_fold(vector<T>& f, int n, Merge merge) {
    int N = 1 << n;
    for (int b = 0; b < n; ++b)
        for (int s = 0; s < N; ++s)
            if (s & (1 << b))
                f[s] = merge(f[s], f[s ^ (1 << b)]);
}

template<class T, class Merge>
void superset_fold(vector<T>& f, int n, Merge merge) {
    int N = 1 << n;
    for (int b = 0; b < n; ++b)
        for (int s = 0; s < N; ++s)
            if (!(s & (1 << b)))
                f[s] = merge(f[s], f[s | (1 << b)]);
}
```

```cpp
auto best = value;  // 不存在的掩码初始化为 LLONG_MIN
subset_fold(best, n, [](ll x, ll y) { return max(x, y); });
// best[s] = max{value[t] : t 是 s 的子集}

auto low = value;   // 不存在的掩码初始化为 LLONG_MAX
superset_fold(low, n, [](ll x, ll y) { return min(x, y); });
// low[s] = min{value[t] : t 是 s 的超集}
```

存在性可以使用 `vector<int>` 存 0/1，用按位 OR 合并。求最大值时，有负权不能把不存在状态初始化为 0。

### 3.2 频次数组的四种常用查询

设 `cnt[x]` 是值为 $x$ 的元素个数，`sub` 是它的子集和，`sup` 是它的超集和。

| 查询的元素 $x$ 满足 | 集合解释 | 答案 |
| --- | --- | --- |
| `(x \| s) == s` | $x\subseteq s$ | `sub[s]` |
| `(x & s) == s` | $x\supseteq s$ | `sup[s]` |
| `(x & s) == 0` | $x\subseteq U\setminus s$ | `sub[U ^ s]` |
| `(x \| s) == U` | $x\supseteq U\setminus s$ | `sup[U ^ s]` |

如果把子集和换成子集最大值，`best[U ^ s]` 就是所有与 $s$ 按位 AND 为 0 的候选中的最大权值。

若需要具体方案，可存 `{权值, 下标}` 后按权值取最大值。若还要求候选下标不能等于自己，应维护两个不同下标的最优候选，查询时排除自己；只有一个最优值可能丢失合法答案。

### 3.3 无序、不同下标、AND 为 0 的数对

```cpp
ll count_disjoint_pairs(const vector<ll>& cnt, int n) {
    auto sub = cnt;
    subset_zeta(sub, n);
    int N = 1 << n, U = N - 1;
    ll ordered = 0;
    for (int x = 0; x < N; ++x)
        ordered += cnt[x] * sub[U ^ x];
    return (ordered - cnt[0]) / 2;
}
```

乘积先统计有序下标对。自己和自己 AND 为 0 当且仅当值为 0，因此减去 `cnt[0]` 个自配对；剩下的每个无序对被计数两次，再除以 2。整数计算需保证总数的平方不溢出。

## 4. OR 卷积【常用进阶】

### 4.1 定义与推导

计算有序集合对的贡献，允许 $A,B$ 相交：

$$
h[S]=\sum_{A\cup B=S}a[A]b[B].
$$

“并集恰好为 $S$”约束了两边，不能独立选择。先求答案的子集和：

$$
H[S]=\sum_{R\subseteq S}h[R]
=\sum_{A\cup B\subseteq S}a[A]b[B].
$$

利用关键等价关系：

$$
A\cup B\subseteq S\iff A\subseteq S\ \text{且}\ B\subseteq S.
$$

此时两边独立，双重求和可拆为乘积：

$$
H[S]=\left(\sum_{A\subseteq S}a[A]\right)
     \left(\sum_{B\subseteq S}b[B]\right)=F[S]G[S].
$$

所以流程是：**子集求和 → 逐点相乘 → 子集逆变换**。逐点乘积得到的是答案的子集和，不是精确答案。

### 4.2 模板

依赖第 2 节 `subset_zeta`。传参按值复制，因此不修改调用者的输入数组。

```cpp
template<class T>
vector<T> or_convolution(vector<T> a, vector<T> b, int n) {
    assert(a.size() == b.size());
    subset_zeta(a, n);
    subset_zeta(b, n);
    for (int s = 0; s < (1 << n); ++s)
        a[s] *= b[s];
    subset_zeta(a, n, true);
    return a;
}
```

时间 $O(n2^n)$，空间 $O(2^n)$。

### 4.3 一位例子：逆变换到底减掉了什么？

$$
H[0]=a_0b_0,\qquad
H[1]=(a_0+a_1)(b_0+b_1).
$$

$H[1]$ 包含 OR 为 0 的 $a_0b_0$，因此：

$$
h[1]=H[1]-H[0]=a_0b_1+a_1b_0+a_1b_1.
$$

剩下的正好是 OR 为 1 的三种组合。

## 5. AND 卷积【常用进阶】

计算：

$$
h[S]=\sum_{A\cap B=S}a[A]b[B].
$$

这次先求答案的超集和：

$$
H[S]=\sum_{R\supseteq S}h[R]
=\sum_{A\cap B\supseteq S}a[A]b[B].
$$

关键等价关系为：

$$
A\cap B\supseteq S\iff A\supseteq S\ \text{且}\ B\supseteq S.
$$

因此：

$$
H[S]=\left(\sum_{A\supseteq S}a[A]\right)
     \left(\sum_{B\supseteq S}b[B]\right).
$$

流程是：**超集求和 → 逐点相乘 → 超集逆变换**。

```cpp
template<class T>
vector<T> and_convolution(vector<T> a, vector<T> b, int n) {
    assert(a.size() == b.size());
    superset_zeta(a, n);
    superset_zeta(b, n);
    for (int s = 0; s < (1 << n); ++s)
        a[s] *= b[s];
    superset_zeta(a, n, true);
    return a;
}
```

依赖第 2 节 `superset_zeta`。时间 $O(n2^n)$，空间 $O(2^n)$，统计的是有序集合对。

若 `a = b = cnt`，卷积统计的是有序下标对，包含自配对。无论 AND 还是 OR，值为 $s$ 的每个元素与自身运算的结果都是 $s$，因此精确结果为 $s$ 的无序不同下标对数为：

$$
\frac{h[s]-\operatorname{cnt}[s]}{2}.
$$

该式是在整数计数意义下成立；模数题若要除以 2，应检查 2 是否可逆，不能对取模后的普通整数直接整除。

## 6. 选若干元素，OR／AND 恰好为 S【计数题常用】

元素按下标区分；相同值的不同元素仍是不同选择。这里只统计非空下标子集。

### 6.1 OR 恰好为 S

令 $c[S]$ 是值为 $S$ 的子集的元素总数。所有所选元素的 OR 都包含在 $S$ 中，当且仅当每个被选元素都包含在 $S$ 中。因此可从这 $c[S]$ 个元素中任选非空子集：

$$
F[S]=2^{c[S]}-1=\sum_{R\subseteq S}h[R].
$$

对 $F$ 做子集逆变换，就得到 OR 恰好为各个掩码的方案数。

### 6.2 AND 恰好为 S

令 $d[S]$ 是值为 $S$ 的超集的元素总数。同理：

$$
G[S]=2^{d[S]}-1=\sum_{R\supseteq S}g[R].
$$

对 $G$ 做超集逆变换即可。两种情况均减去 1，是为了排除空选择，避免空集合的 OR／AND 约定带来边界混淆。

### 6.3 通用模板

依赖第 2 节变换。`cnt` 用普通整数存真实频次，不能把频次先对答案模数取模。模板中的 `T` 通常取第 9 节的 `Mint`。

```cpp
template<class T>
vector<T> count_nonempty_selections(
        const vector<int>& cnt, int n, bool use_and = false) {
    int N = 1 << n;
    vector<ll> c(cnt.begin(), cnt.end());
    if (use_and) superset_zeta(c, n);
    else         subset_zeta(c, n);

    ll m = accumulate(cnt.begin(), cnt.end(), 0LL);
    vector<T> pow2(m + 1);
    pow2[0] = T(1);
    for (ll i = 1; i <= m; ++i)
        pow2[i] = pow2[i - 1] + pow2[i - 1];

    vector<T> ans(N);
    for (int s = 0; s < N; ++s)
        ans[s] = pow2[c[s]] - T(1);
    if (use_and) superset_zeta(ans, n, true);
    else         subset_zeta(ans, n, true);
    return ans;
}
```

时间 $O(n2^n+m)$，空间 $O(2^n+m)$，其中 $m$ 是元素个数。若要求恰好选择 $k\ge 1$ 个元素，把 $2^{c[S]}-1$ 换成 $\binom{c[S]}{k}$ 即可；组合数的预处理条件应另外检查。

## 7. 不交子集卷积【进阶备用】

当题目明确出现“集合拆成两个互不相交的部分，贡献为两部分权值相乘再求和”时使用：

$$
h[S]=\sum_{A\subseteq S}a[A]b[S\setminus A].
$$

等价条件是 $A\cup B=S$ 且 $A\cap B=\varnothing$。普通 OR 卷积只有并集限制，不能直接代替。两部分有顺序，且模板包含空部分；若不允许某一部分为空，把对应输入数组的 0 号值设为 0。

### 7.1 为什么按集合大小分层？

利用恒等式：

$$
|A|+|B|=|A\cup B|+|A\cap B|.
$$

已经满足 $A\cup B=S$ 时，$|A|+|B|=|S|$ 当且仅当 $A\cap B=\varnothing$。

先把原数组按集合大小分层：

$$
a_i[S]=[|S|=i]a[S],\qquad b_i[S]=[|S|=i]b[S].
$$

方括号表示条件成立取 1，否则取 0。每层子集求和后：

$$
F_i[S]=\sum_{\substack{A\subseteq S\\|A|=i}}a[A],
\qquad
G_j[S]=\sum_{\substack{B\subseteq S\\|B|=j}}b[B].
$$

枚举两边大小之和 $k$：

$$
C_k[S]=\sum_{i=0}^{k}F_i[S]G_{k-i}[S]
=\sum_{\substack{A,B\subseteq S\\|A|+|B|=k}}a[A]b[B].
$$

对每一层 $C_k$ 做子集逆变换，把“并集包含在 $S$ 中”收紧为“并集恰好等于 $S$”：

$$
c_k[S]=\sum_{\substack{A\cup B=S\\|A|+|B|=k}}a[A]b[B].
$$

最后只取：

$$
\boxed{h[S]=c_{|S|}[S]}.
$$

**逆变换负责并集恰好，大小分层负责交集为空。** 例如 $A=\{0\}$、$B=\{0,1\}$ 的并集大小为 2，两边大小之和为 3，它会落在第 3 层，不会进入最终取出的第 2 层。

### 7.2 模板与资源限制

依赖第 2 节 `subset_zeta`。下面逐层处理输出，避免再开一个完整的分层结果表。

```cpp
template<class T>
vector<T> subset_convolution(const vector<T>& a,
                             const vector<T>& b, int n) {
    int N = 1 << n;
    assert((int)a.size() == N && (int)b.size() == N);
    vector<int> pc(N);
    for (int s = 1; s < N; ++s)
        pc[s] = pc[s >> 1] + (s & 1);

    vector<vector<T>> A(n + 1, vector<T>(N));
    auto B = A;
    for (int s = 0; s < N; ++s) {
        A[pc[s]][s] = a[s];
        B[pc[s]][s] = b[s];
    }
    for (int k = 0; k <= n; ++k) {
        subset_zeta(A[k], n);
        subset_zeta(B[k], n);
    }

    vector<T> ans(N), c(N);
    for (int k = 0; k <= n; ++k) {
        fill(c.begin(), c.end(), T{});
        for (int i = 0; i <= k; ++i)
            for (int s = 0; s < N; ++s)
                c[s] += A[i][s] * B[k - i][s];
        subset_zeta(c, n, true);
        for (int s = 0; s < N; ++s)
            if (pc[s] == k) ans[s] = c[s];
    }
    return ans;
}
```

时间 $O(n^2 2^n)$，空间 $O(n2^n)$。以 $n=20$、每个模整数 4 字节为例，仅 `A`、`B` 就约占 168 MiB；加上输入、输出、临时数组和 `pc` 后约 188 MiB。若用 8 字节整数，内存进一步增加。是否能过还取决于时限和常数。

不要在逆变换之前仅保留 `k == popcount(s)` 的项。此时尚未排除并集较小的贡献，提前丢项会破坏容斥。

一般的 `min(dp[A] + dp[S ^ A])` 不符合这里的加乘结构，不能把本模板中的加法直接改成 `min` 来获得相同复杂度。

## 8. 配套枚举与赛场检查

### 8.1 子集与超集枚举

```cpp
// s 的所有子集，包含 s 和 0
for (int t = s; ; t = (t - 1) & s) {
    // 使用 t
    if (t == 0) break;
}

// s 的非空子集
for (int t = s; t; t = (t - 1) & s) {
    // 使用 t
}

// s 的所有超集：枚举补集内还能添加哪些位
int rest = U ^ s;
for (int t = rest; ; t = (t - 1) & rest) {
    int super = s | t;
    // 使用 super
    if (t == 0) break;
}
```

一个集合的子集数为 $2^{|S|}$。所有集合及其子集的总枚举次数为：

$$
\sum_{S\subseteq U}2^{|S|}
=\sum_{k=0}^{n}\binom nk 2^k=3^n.
$$

### 8.2 赛场检查表

1. 数组长度是否为 $2^n$，输入掩码是否都在范围内？
2. 是“子集”还是“超集”？子集从少一位来，超集从多一位来。
3. 位循环是否在最外层？原数组是否还需要保留？
4. 是否包含空集、自身、重复值和自配对？题目要求有序还是无序？
5. 最值不存在状态是否初始化为正确的无穷大／无穷小？
6. 补集是否限制在 $n$ 位内？
7. 整数中间结果是否可能溢出？模运算的减法是否正确归一化？
8. OR 卷积允许交集，不交卷积需要额外按大小分层。
9. 分层卷积的时间与内存是否满足限制？小规模可直接 $O(3^n)$ 枚举。
10. XOR 卷积使用另一套 FWHT 蝶形变换，不套子集／超集 SOS。

## 9. 模运算配套与调用示例

下列轻量模整数仅提供本文需要的加、减、乘，不涉及除法；模数不必是质数。所有函数模板可直接以 `Mint` 实例化。

```cpp
struct Mint {
    static constexpr int MOD = 998244353;
    int v;
    Mint(ll x = 0) : v(int((x % MOD + MOD) % MOD)) {}
    Mint& operator+=(Mint b) {
        v += b.v;
        if (v >= MOD) v -= MOD;
        return *this;
    }
    Mint& operator-=(Mint b) {
        v -= b.v;
        if (v < 0) v += MOD;
        return *this;
    }
    Mint& operator*=(Mint b) {
        v = int(1LL * v * b.v % MOD);
        return *this;
    }
    friend Mint operator+(Mint a, Mint b) { return a += b; }
    friend Mint operator-(Mint a, Mint b) { return a -= b; }
    friend Mint operator*(Mint a, Mint b) { return a *= b; }
};
```

本实现的 `int` 加法要求 $2(\mathrm{MOD}-1)$ 不超过 `INT_MAX`，默认模数满足；若改成更大的模数，应改用更宽的加法中间量。

```cpp
// 放在 main 中；需要此前粘贴所调用的模板和 Mint。
int n = 2, N = 1 << n;
vector<Mint> a(N), b(N);
a[1] = 2; b[2] = 3;

auto h_or = or_convolution(a, b, n);
auto h_and = and_convolution(a, b, n);
auto h_sub = subset_convolution(a, b, n);
cout << h_or[3].v << '\n';   // 6：01 | 10 = 11
cout << h_and[0].v << '\n';  // 6：01 & 10 = 00
cout << h_sub[3].v << '\n';  // 6：两部分互不相交

vector<int> cnt = {1, 1, 0, 0}; // 一个 0，一个 1
// 非空选择为 {0}、{1}、{0,1}
auto ways = count_nonempty_selections<Mint>(cnt, n);
cout << ways[0].v << ' ' << ways[1].v << '\n'; // 1 2
```
