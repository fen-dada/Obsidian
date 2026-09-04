无向图中一个没有割边的极大连通块成为边双连通分量。
当我们找到一条割边的时候，子节点y一定是一个eDCC的根，此时弹出栈内在y子树中的点，打上标记。
在离开点u的时候记录eDCC，因为不能跑反边，所以当有一个边是割边的时候，对应的子节点本身也满足`low[u]==dfn[u]`，
一个无向图完成eDCC缩点以后一定会变成一棵树，或者森林。其中树边都是无向图中的割边。
```cpp
void dfs(int u,int in_edge){
    dfn[u] = low[u] = ++tot;
    stk.push(x);
    for(int i=0;i<h[u].size();++i){
        int j = h[u][i];
        int v = e[j].v;
        if(!dfn[v]){
            dfs(v,j);
            low[u] = min(low[v],low[u]);
            if(low[v]>dfn[u]){
                bri[j] = bri[j^1] = 1;
            }
        }else if(j!=(in_edge^1)){
            low[u] = min(low[u],dfn[v]);
        }
    }
    if(dfn[u]==low[u]){
	    ++cnt;
	    while(1){
		    int y = stk.top();
		    stk.pop();
		    dcc[y] = cnt;
		    if(y==u) break;
	    }
    }
}
```