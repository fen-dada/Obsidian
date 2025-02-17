## 对于一个n元集合生成k元子集
```cpp
int x = (1<<k)-1;
int mx = (1<<n);
while(x<mx){
	int lb = x & -x;
	int left = x+lb;
	int right = (x^(x+lb))/lb>>2;
	x = left | right
}
```