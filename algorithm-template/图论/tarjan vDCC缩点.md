点双连通分量指的是一个无向图中不含割点的极大联通子图。
先跑一遍割点，然后在每一个节点u的儿子中找到一个子节点v，如果v满足`low[v]>=dfn[u]`，则v的子树加上u就可以构成一个点双连通分量。因为一个u可能有很多个儿子，因此需要裂点，也就是存在多个u。因此在构建vDCC时，从栈中弹出节点到v为止，然后再额外加上一个u（不弹出），保证了u有很多个。另外，原图中每一个割点也单独形成一个点双连通分量。
```cpp
void dfs(int u){
    dfn[u] = low[u] = ++tot;
    stk.push(u);
    if(!e[u].size()){
        eDCC[++cnt].push_back(u);
        return;
    }
    int c = 0;
    for(auto v:e[u]){
        if(!dfn[v]){
            dfs(v);
            low[u] = min(low[u],low[v]);
            if(low[v]>=dfn[u]){
                c++;
                if(u!=root || c>1){
                    cut[u] = 1;
                }
                ++cnt;
                while(1){
                    int y = stk.top();
                    stk.pop();
                    eDCC[cnt].push_back(y);
                    if(y==v) break;
                }
                eDCC[cnt].push_back(u);
            }
        }else{
            low[u] = min(low[u],dfn[v]);
        }
    }
}
```

缩完点以后，每一个点都是一个点双连通分量，每一个边都是裂开的割点和自己建的边。开始建新的图，每个vDCC向对应的割点连边。
```cpp
int num = cnt;
for(int i=1;i<=n;++i){
	if(cut[i]){
		id[i] = ++num;
	}
}
for(int i=1;i<=cnt;++i){
	for(int j=0;j<vDCC[i];++j){
		int x = vDCC[i][j];
		if(cut[x]){
			ne[i].push_back(id[x]);
			ne[id[x]].push_back(i);
		}
	}
}
```