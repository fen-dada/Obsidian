# z函数

[左神原版 Java](https://github.com/algorithmzuo/algorithm-journey/blob/main/src/class103/Code02_ExpandKMP.java)，以下按原版直接翻译为 C++，保留全局数组和变量含义。

```cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 20000001;
int z[MAXN];
int e[MAXN];

void zArray(const string& s, int n) {
    z[0] = n;
    for (int i = 1, c = 1, r = 1, len; i < n; i++) {
        len = r > i ? min(r - i, z[i - c]) : 0;
        while (i + len < n && s[i + len] == s[len]) {
            len++;
        }
        if (i + len > r) {
            r = i + len;
            c = i;
        }
        z[i] = len;
    }
}

void eArray(const string& a, const string& b, int n, int m) {
    for (int i = 0, c = 0, r = 0, len; i < n; i++) {
        len = r > i ? min(r - i, z[i - c]) : 0;
        while (i + len < n && len < m && a[i + len] == b[len]) {
            len++;
        }
        if (i + len > r) {
            r = i + len;
            c = i;
        }
        e[i] = len;
    }
}

// 洛谷 P5410 要求的数组权值：各项的异或和
long long eor(const int arr[], int n) {
    long long ans = 0;
    for (int i = 0; i < n; i++) {
        ans ^= 1LL * (i + 1) * (arr[i] + 1);
    }
    return ans;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    string a, b;
    getline(cin, a);
    getline(cin, b);

    zArray(b, b.length());
    eArray(a, b, a.length(), b.length());
    cout << eor(z, b.length()) << '\n';
    cout << eor(e, a.length()) << '\n';
    return 0;
}
```

## 数组与变量含义

`a` 是文本串，`b` 是模式串。下标从 `0` 开始，`[L,R)` 包含 `L`、不包含 `R`。

- `z[i]`：`b` 从 `i` 开始的后缀与整个 `b` 的最长公共前缀长度。**`z[0] = b.length()`**。
- `e[i]`：`a` 从 `i` 开始的后缀与整个 `b` 的最长公共前缀长度。
- `c`：当前右边界最远的匹配区间的起点，**不是回文中心**。
- `r`：该匹配区间右端点的下一个位置，不包含 `r`。
- `len`：当前已匹配的长度，最小为 `0`。

在 `[c,r)` 内，位置 `i` 对应模式串前缀的位置 `i-c`，所以借用 `z[i-c]`，最多借到 `r`，然后继续比较。

**先求 `b` 的 `z` 数组，再求 `e` 数组。求 `e` 时借用的也是 `z[i-c]`，不是 `e[i-c]`。**

## 长度与区间

Z 函数不插入分隔符，没有半径换算，**数组值本身就是原串的匹配长度**。

| 信息 | 公式 |
| --- | --- |
| `z[i]` 对应的相等片段 | `b[i, i+z[i]) == b[0, z[i])` |
| `e[i]` 对应的相等片段 | `a[i, i+e[i]) == b[0, e[i])` |
| 匹配长度为 `len` 时的最后一个下标 | `i+len-1`（`len > 0`） |
| 取出 `a` 中匹配片段 | `a.substr(i, e[i])` |
| 非空模式串在 `a` 的位置 `i` 完整匹配 | `e[i] == b.length()` |

```text
b = ababa
z = 5 0 3 0 1
z[2] = 3：b 从下标 2 开始的 aba，与 b 的前 3 个字符相等。

a = abababa，b = ababa
e = 5 0 5 0 3 0 1
e[0] = e[2] = 5：模式串在 a 的下标 0、2 处完整出现。
e[4] = 3：只匹配了 aba，不是完整匹配。
```

`eor` 只是 [洛谷 P5410](https://www.luogu.com.cn/problem/P5410) 的输出要求，与算法本身无关；题目权值使用从 `1` 开始的位置，所以代码中乘的是 `i+1`，并用 `1LL` 防止整数乘法溢出。

求 `z` 的时间复杂度 `O(m)`，求 `e` 的时间复杂度 `O(n+m)`，其中 `n`、`m` 分别为 `a`、`b` 的长度。
