## 倍增法
首先跳到同一层，然后一起跳
每次先比较两者的祖先，如果不一样再跳，这样可以保证慢慢接近lca，最后整好跳到
```cpp
auto dfs = [&](auto&& self,int u,int f) -> void {
	dep[u] = dep[f]+1;
	fa[u][0]=f;
	for(int i=1;i<=19;++i){
		fa[u][i] = fa[fa[u][i-1]][i-1];
	}
	for(auto v:e[u]){
		if(f==v) continue;
		self(self,v,u);
	}
};
auto lca = [&](int u,int v) -> int {
	if(dep[u]<dep[v]) swap(u,v);
	for(int i=19;i>=0;--i){
		if(dep[fa[u][i]]>=dep[v]){
			u = fa[u][i];
		}
	}
	if(v==u) return v;
	for(int i=19;i>=0;--i){
		if(fa[u][i]!=fa[v][i]){
			u=fa[u][i];
			v=fa[v][i];
		}
	}
	return fa[u][0];
};
```

## tarjan算法
利用并查集来维护
先dfs搜索树，在搜索完某一个节点的孩子节点以后才会将自己指向自己的父亲
利用这个特性，可以得知当在搜索u和v的lca时，这个节点一定没有连接父节点，也就是lca没有连接到lca的父节点，保证了每次的答案一定是lca
```cpp
int find(int x){
    if(x==fa[x]) return x;
    return fa[x] = find(fa[x]);
}
void tarjan(int u){
    vis[u]=1;
    for(auto v:e[u]){
        if(vis[v]) continue;
        tarjan(v);
        fa[v]=u;
    }
    for(auto p:query[u]){
        int v = p.first;
        int i = p.second;
        if(vis[v]){
            ans[i] = find(v);
        }
    }
}
```

## 树链剖分
将一颗树分成若干个重链
查询时两点分别向上跳，每次跳到当前重链顶点的父节点，直到两者处于同一重链上，深度小的节点即为lca
第一次dfs解决son，fa，sz数组的赋值问题，第二次dfs解决top数组问题
一棵树上的任意两个节点，肯定是在某个节点的地方分开来，类似于一个”人“字形，因此两者往上跳时，当处于同一个重链时肯定就是找到了lca，这是充分条件。
而当某一个节点跳到lca位置时，两者肯定在同一个重链上，这是必要条件。
而剖分的目的就是加速节点的跳跃，任意一个路径会分成不超过`logn`条树链。
```cpp
void dfs1(int u,int f){
    dep[u] = dep[f]+1;
    sz[u]=1;
    fa[u]=f;
    for(auto v:e[u]){
        if(v==f) continue;
        dfs1(v,u);
        sz[u]+=sz[v];
        if(sz[son[u]]<sz[v]) son[u]=v;
    }
}
void dfs2(int u,int t){
    top[u] = t;
    if(!son[u]) return;
    dfs2(son[u],t);
    for(auto v:e[u]){
        if(v==fa[u] || v==son[u]) continue;
        dfs2(v,v);
    }
}
int lca(int x,int y){
    while(top[x]!=top[y]){
        if(dep[top[x]]<dep[top[y]]) swap(x,y);
        x=fa[top[x]];
    }
    return dep[x]<dep[y]?x:y;
}
```

## 利用lca求两点间的距离
```cpp
int dist(int x,int y){
	int z=lca(x,y); 
	return dep[x]+dep[y]-dep[z]*2; 
}
```