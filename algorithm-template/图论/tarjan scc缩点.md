把一个有向有环图缩点以后变成一个有向无环图，并且缩点以后的编号是逆拓扑序的
```cpp
void dfs(int u){
    dfn[u] = low[u] = ++tot;
    stk[++top]=u;
    instk[u]=1;
    for(auto v:e[u]){
        if(!dfn[v]){
            dfs(v);
            low[u] = min(low[u],low[v]);
        }else if(instk[v]){
            low[u] = min(dfn[v],low[u]);
        }
    }
    if(dfn[u]==low[u]){
        int v;
        ++cnt;
        int siz=0;
        do{
            v = stk[top--];
            instk[v]=0;
            ++siz;
            scc[v]=cnt;
        }while(v!=u);
        sz[u]=siz;
    }
}
```