```cpp
int tr[N][30];
int fail[N];
int cnt = 0;
int ed[N];
void insert(string s, int id) {
    int u = 0;
    for (int i = 0; i < s.size(); ++i) {
        int cur = s[i] - 'a';
        if (tr[u][cur] == 0) {
            tr[u][cur] = ++cnt;
            u = cnt;
        } else {
            u = tr[u][cur];
        }
    }
    ed[id] = u;
}
void setFail() {
    queue<int> q;
    for (int i = 0; i < 26; ++i) {
        if (tr[0][i]) {
            q.push(tr[0][i]);
            fail[tr[0][i]] = 0;
        }
    }
    while (q.size()) {
        auto u = q.front();
        q.pop();
        for (int i = 0; i < 26; ++i) {
            if (tr[u][i]) {
                fail[tr[u][i]] = tr[fail[u]][i];
                q.push(tr[u][i]);
            } else {
                tr[u][i] = tr[fail[u]][i];
            }
        }
    }
}
```