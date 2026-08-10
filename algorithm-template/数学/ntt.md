```cpp
using ll = long long;

const int MOD = 998244353;
const int G = 3;

int qpow(int a, int b)
{
    int res = 1;

    while(b)
    {
        if(b & 1)
        {
            res = (ll)res * a % MOD;
        }

        a = (ll)a * a % MOD;
        b >>= 1;
    }

    return res;
}

void ntt(vector<int> &a, bool invert)
{
    int n = a.size();

    for(int i = 1, j = 0; i < n; ++i)
    {
        int bit = n >> 1;

        while(j & bit)
        {
            j ^= bit;
            bit >>= 1;
        }

        j ^= bit;

        if(i < j)
        {
            swap(a[i], a[j]);
        }
    }

    for(int len = 2; len <= n; len <<= 1)
    {
        int wlen = qpow(G, (MOD - 1) / len);

        if(invert)
        {
            wlen = qpow(wlen, MOD - 2);
        }

        for(int i = 0; i < n; i += len)
        {
            int w = 1;

            for(int j = 0; j < len / 2; ++j)
            {
                int u = a[i + j];
                int v = (ll)a[i + j + len / 2] * w % MOD;

                a[i + j] = u + v;

                if(a[i + j] >= MOD)
                {
                    a[i + j] -= MOD;
                }

                a[i + j + len / 2] = u - v;

                if(a[i + j + len / 2] < 0)
                {
                    a[i + j + len / 2] += MOD;
                }

                w = (ll)w * wlen % MOD;
            }
        }
    }

    if(invert)
    {
        int inv_n = qpow(n, MOD - 2);

        for(auto &x : a)
        {
            x = (ll)x * inv_n % MOD;
        }
    }
}

vector<int> convolution(vector<int> a, vector<int> b)
{
    if(a.empty() || b.empty())
    {
        return {};
    }

    int need = a.size() + b.size() - 1;

    int n = 1;

    while(n < need)
    {
        n <<= 1;
    }

    a.resize(n);
    b.resize(n);

    ntt(a, false);
    ntt(b, false);

    for(int i = 0; i < n; ++i)
    {
        a[i] = (ll)a[i] * b[i] % MOD;
    }

    ntt(a, true);

    a.resize(need);

    return a;
}
```