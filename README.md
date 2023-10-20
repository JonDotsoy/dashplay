# dashplay

A Log stream service to collect and analyze service.

## Bin Compile

```shell
bun run build
#   [9ms]  bundle  41 modules
# [116ms] compile  dist/dashplay
```

### Sample

```shell
bunx serve . &>2 | dashplay put-log-events --log-group-name asd --log-stream-name asd --event-stream
```

List events stored

```shell
dashplay list-log-events --log-group-name asd --log-stream-name asd
# TIMESTAMP                 MESSAGE
# 10/19/2023, 11:50:57 PM   INFO  Accepting connections at http://localhost:3000
# 10/19/2023, 11:51:10 PM   INFO  Accepting connections at http://localhost:3000
# 10/19/2023, 11:51:12 PM   HTTP  10/19/2023 11:51:12 PM ::1 GET /
# 10/19/2023, 11:51:12 PM   HTTP  10/19/2023 11:51:12 PM ::1 Returned 200 in 29 ms
# 10/19/2023, 11:51:36 PM   HTTP  10/19/2023 11:51:36 PM ::1 GET /.editorconfig
# 10/19/2023, 11:51:36 PM   HTTP  10/19/2023 11:51:36 PM ::1 Returned 304 in 14 ms
# 10/19/2023, 11:52:12 PM   HTTP  10/19/2023 11:52:12 PM ::1 GET /.editorconfig
# 10/19/2023, 11:52:13 PM   HTTP  10/19/2023 11:52:13 PM ::1 GET /.editorconfig
# 10/19/2023, 11:52:13 PM   HTTP  10/19/2023 11:52:13 PM ::1 Returned 304 in 4 ms
# 10/19/2023, 11:52:13 PM   HTTP  10/19/2023 11:52:13 PM ::1 GET /.editorconfig
# 10/19/2023, 11:52:13 PM   HTTP  10/19/2023 11:52:13 PM ::1 GET /.editorconfig
# 10/19/2023, 11:52:13 PM   HTTP  10/19/2023 11:52:13 PM ::1 Returned 304 in 9 ms
```


## The Dashplay Cli

### `dashplay create-log-group`
### `dashplay list-log-group`
### `dashplay list-log-stream`
### `dashplay list-log-events`
### `dashplay create-log-stream`
### `dashplay put-log-events`
### `dashplay put-log-events`
