```cpp
for(int i=1;i<=n;i++) scanf("%d",&f[i][0]);
  for(int j=1;j<=20;j++)
    for(int i=1;i+(1<<j)-1<=n;i++) 
      f[i][j]=max(f[i][j-1],f[i+(1<<(j-1))][j-1]);
  
  for(int i=1,l,r;i<=m;i++){
    scanf("%d%d",&l,&r);
    int k=log2(r-l+1); 
    printf("%d\n",max(f[l][k],f[r-(1<<k)+1][k]));
  }
```

```cpp
template<typename T>
struct sparse_table {
public:
    sparse_table() {}

    // source 必须是 1-indexed：source[1..n]
    sparse_table(function<T(T,T)> merger, vector<T>& source) {
        size = (int)source.size() - 1; // 因为 source[0] 不用
        merge = merger;

        int lg = __lg(size);
        st = vector<vector<T>>(lg + 1, vector<T>(size + 1));

        // k = 0，对应区间长度 1
        for (int i = 1; i <= size; i++) {
            st[0][i] = source[i];
        }

        // 构建 ST
        for (int k = 1; k <= lg; k++) {
            for (int i = 1; i + (1 << k) - 1 <= size; i++) {
                st[k][i] = merge(
                    st[k - 1][i],
                    st[k - 1][i + (1 << (k - 1))]
                );
            }
        }
    }

    // 查询区间 [L, R]，1-based
    T query(int L, int R) {
        int k = __lg(R - L + 1);
        return merge(
            st[k][L],
            st[k][R - (1 << k) + 1]
        );
    }

private:
    int size; // n
    function<T(T,T)> merge;
    vector<vector<T>> st;
};
```