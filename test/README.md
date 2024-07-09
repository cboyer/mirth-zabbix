# Test environment

This test environment provides the following docker images with `docker-compose`:

- PostgreSQL
- Zabbix server
- Zabbix web interface
- Mirth Connect

## Zabbix web interface
URL: http://localhost:8080

Login: Admin

Password: zabbix

## Mirth Connect
URL: https://localhost:8444

Login: admin

Password: admin

Mirth Connect Administrator is not provided and can be installed this way:
```
curl https://s3.amazonaws.com/downloads.mirthcorp.com/connect-client-launcher/mirth-administrator-launcher-latest-unix.sh -o mirth-administrator-launcher-latest-unix.sh
chmod +x mirth-administrator-launcher-latest-unix.sh
sudo ./mirth-administrator-launcher-latest-unix.sh
```

## Installation
You need `docker-compose`, `curl` and `jq` installed on your system.
```
make build configure
```

The Makefile performs `docker-compose up -d` then runs configure.sh to configure Mirth and Zabbix.
