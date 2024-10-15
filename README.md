# Project management server

<b>Project management client</b> - <a href="https://github.com/Ayush8085/kira-client">click here</a>

## Server setup
```bash
git clone https://github.com/Ayush8085/kira-server.git server
npm run build
```

<b>
Rename <code>.env.example</code> to <code>.env</code>
</b></br>
</br>

*NOTE* - Complie typescript before running the actual file. ***DO NOT USE*** <code>nodemon / ts-node</code>.

```bash
npx tsc -b # to complie .ts files
node dist/index.js
```