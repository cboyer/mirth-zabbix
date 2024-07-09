#!/bin/bash
set -eo pipefail

API_ZABBIX_URL="http://localhost:8080/api_jsonrpc.php"
API_ZABBIX_LOGIN="Admin"
API_ZABBIX_PASSWORD="zabbix"
HOSTNAME="mirth"
PORT=10050

API_MIRTH_URL="https://localhost:8444/api"
API_MIRTH_LOGIN="admin"
API_MIRTH_PASSWORD="admin"
MIRTH_COOKIE="/tmp/mirth-cookie.txt"


ZABBIX_SERVER_IP=$(docker inspect --format '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $(docker ps -a --format '{{.Names}}' | grep "zabbix-server"))
TEMPLATE_MIRTH=$(curl -s https://raw.githubusercontent.com/cboyer/mirth-zabbix/master/release/Mirthix_channel.xml | sed "s/127.0.0.1/$ZABBIX_SERVER_IP/g")

curl -k -X POST "$API_MIRTH_URL/users/_login" \
-H "accept: application/json" \
-H "Content-Type: application/x-www-form-urlencoded" \
-H "X-Requested-With: OpenAPI" \
-d "username=$API_MIRTH_LOGIN&password=$API_MIRTH_PASSWORD" \
-c $MIRTH_COOKIE

curl -k -b $MIRTH_COOKIE -X POST "$API_MIRTH_URL/channels" \
-H "accept: application/json" \
-H "Content-Type: application/xml" \
-H "X-Requested-With: OpenAPI" \
-d "$TEMPLATE_MIRTH"

curl -k -b $MIRTH_COOKIE -X POST "$API_MIRTH_URL/channels/_redeployAll?returnErrors=true" -H "accept: application/json" -H "X-Requested-With: OpenAPI"
curl -k -b $MIRTH_COOKIE -X POST "$API_MIRTH_URL/users/_logout" -H  "accept: application/json" -H  "X-Requested-With: OpenAPI"
rm -f $MIRTH_COOKIE


AUTH=$(curl -s -X POST -H "Content-type: application/json-rpc" $API_ZABBIX_URL -d @- << EOF | jq -r .result
{
  "jsonrpc": "2.0",
  "method": "user.login",
  "params": {
    "username": "$API_ZABBIX_LOGIN",
    "password": "$API_ZABBIX_PASSWORD"
  },
  "id": 1
}
EOF
)

TEMPLATE=$(curl -s https://raw.githubusercontent.com/cboyer/mirth-zabbix/master/release/Zabbix_template.xml | sed 's/"/\\"/g')

curl -X POST -H "Content-type: application/json-rpc" -H "Authorization: Bearer $AUTH" $API_ZABBIX_URL -d @- << EOF
{
  "jsonrpc": "2.0",
  "method": "configuration.import",
  "params": {
    "format": "xml",
    "rules": {
      "templates": {
        "createMissing": true,
        "updateExisting": true
      },
      "discoveryRules": {
        "createMissing": true,
        "updateExisting": true,
        "deleteMissing": true
      },
      "items": {
        "createMissing": true,
        "updateExisting": true,
        "deleteMissing": true
      },
      "triggers": {
        "createMissing": true,
        "updateExisting": true,
        "deleteMissing": true
      },
      "valueMaps": {
        "createMissing": true,
        "updateExisting": false
      }
    },
    "source": "$TEMPLATE"
  },
  "id": 2
}
EOF


TEMPLATE_ID=$(curl -s -X POST -H "Content-type: application/json-rpc" -H "Authorization: Bearer $AUTH" $API_ZABBIX_URL -d '
{
  "jsonrpc": "2.0",
  "method": "template.get",
  "params": {
    "output": ["hostid"],
    "filter": {
      "host": [
        "Template App Mirth"
      ]
    }
  },
  "id": 3
}' | jq -r .result.[0].templateid)


GROUP_ID=$(curl -s -X POST -H "Content-type: application/json-rpc" -H "Authorization: Bearer $AUTH" $API_ZABBIX_URL -d '
{
  "jsonrpc": "2.0",
  "method": "hostgroup.get",
  "params": {
    "output": ["groupid"],
    "filter": {
      "name": [
        "Applications"
      ]
    }
  },
  "id": 4
}' | jq -r .result.[0].groupid)


curl -X POST -H "Content-type: application/json-rpc" -H "Authorization: Bearer $AUTH" $API_ZABBIX_URL -d @- << EOF
{
  "jsonrpc": "2.0",
  "method": "host.create",
  "params": {
    "host": "$HOSTNAME",
    "interfaces": [
      {
        "type": 1,
        "main": 1,
        "useip": 0,
        "ip": "",
        "dns": "$HOSTNAME",
        "port": "$PORT"
      }
    ],
    "groups": [
      {
        "groupid": "$GROUP_ID"
      }
    ],
    "tags": [],
    "templates": [
      {
        "templateid": "$TEMPLATE_ID"
      }
    ],
    "macros": [],
    "inventory_mode": 0,
    "inventory": {}
  },
  "id": 5
}
EOF
