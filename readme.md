# pm2-interactive-ui

> This is an interactive cli for pm2


## Install

```
$ npm install -g pm2-interactive-ui
```

![gif ftw](./pm2i.gif)

## Usage

```bash
$ pm2i
? Filter processes: foo
? Choose a process? (Use arrow keys)
❯ ✔ foo_proxy
  ✔ foo
? Choose a task? (Rslh)
  r) Restart
  s) Stop
  l) Logs
  h) Help, list all options
  Answer:


# You can pass a filter string to skip the filter prompt

$ pm2i foo
? Choose a process? (Use arrow keys)
❯ ✔ foo_proxy
  ✔ foo
? Choose a task? (Rslh)
  r) Restart
  s) Stop
  l) Logs
  h) Help, list all options
  Answer:


```


## License

MIT © [stoeffel](http://schtoeffel.ch)
