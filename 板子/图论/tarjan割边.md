如果去掉这个边图的连通块数量增加，则这个边是割边（桥）。
割边的判定条件是存在`low[y]>dfn[x]`，其中y是以x为根的搜索树的子树的节点。这个条件说明了y不借助其他点到不了x或者更小的地方。
另外割边不允许我们走一条边的反边，因此需要存边和边的编号。在存边是，同一条边的正反编号为相邻的奇偶数，只有二进制第一位不一样，因此可以用异或判定是否为反边。
```cpp
void dfs(int u,int in_edge){
    dfn[u] = low[u] = ++tot;
    for(int i=0;i<h[u].size();++i){
        int j = h[u][i];
        int v = e[j].v;
        if(!dfn[v]){
            dfs(v,j);
            low[u] = min(low[v],low[u]);
            if(low[v]>dfn[u]){
                ans.push_back({u,v});
            }
        }else if(j!=(in_edge^1)){
            low[u] = min(low[u],dfn[v]);
        }
    }
}
```