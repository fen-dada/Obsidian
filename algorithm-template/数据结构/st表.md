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