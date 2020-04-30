# Mirthix

Zabbix protocol implementation for [Mirth Connect](https://www.nextgen.com/products-and-services/NextGen-Connect-Integration-Engine-Downloads) integration engine. Provides direct monitoring capabilities with a channel acting like Zabbix agent.

## Implemented functionalities

- Compatibility with Zabbix version 3 and 4.
- [Low level discovery](https://www.zabbix.com/documentation/4.0/manual/discovery/low_level_discovery) for deployed channels and enabled connectors in Mirth Connect.
- [Passive agent checks](https://www.zabbix.com/documentation/4.0/manual/appendix/items/activepassive) for data collection (polling):
  - Connector statistics: received, errored, filtered, queued, sent (mirth.statistics)
  - Channel status (mirth.channel.status)
  - Connector status (mirth.connector.status)
  - Channel deployment date (mirth.deployementdate)
  - Agent ping (agent.ping)
  - Host name of zabbix_agentd running (agent.hostname, system.uname)
  - Version of zabbix_agent(d) running (agent.version)
- IP address filtering with Rule Builder and `$('remoteAddress')`.


## Getting Started

### Prerequisites

- Mirth Connect ≥ 3.2.1, previous versions are not tested
- Zabbix version 3 or 4
- Zabbix template (Zabbix_template.xml)
- Mirthix channel (Mirthix_channel.xml)


### Installing

1. Import Mirthix channel `Mirthix_channel.xml` in Mirth Connect Administrator.
2. Configuration settings for Mirthix channel:
   - TCP Listener: change port 10050 if Zabbix agent is already running on the server.
   - Add Zabbix server IP address in Source Filter values with Rule Builder (needs single or double quote).
   - Message storage is disabled by default because the channel may produce a lot of messages and full your database/file system. It should be activated only for debug purposes.
3. Import Zabbix template `Zabbix_template.xml` in Zabbix console.
4. Create host (or use an existing one) in Zabbix console with Mirth server IP address as Agent interface (with TCP Listener port) and add templates `Template App Mirth` and `Template App Zabbix Agent` (default agent availability template provided by Zabbix).

### Testing

Mirthix can be tested with zabbix_get binary provided with [Zabbix agent](https://www.zabbix.com/download_agents)
```Console
./zabbix_get -s 127.0.0.1 -p 10050 -k agent.version
Mirthix 2.0.0
```

### Trigger adjustment (Zabbix template)

Trigger adjustment is done with template [macros](https://www.zabbix.com/documentation/3.4/manual/config/macros/usermacros) and [macro contexts](https://www.zabbix.com/documentation/3.4/manual/config/macros/usermacros#user_macro_context): Templates > Template App Mirth > Macro.

*Example:*
To trigger "Queue on Zabbix Monitoring | Zabbix Server" problem when queued > 20, add macro `{$QUEUED:"Zabbix Monitoring | Zabbix Server"}` with value `20`. If no context is set on a macro, default macro `{$QUEUED}` will be used.

To disable unwanted item/trigger creation, you have to disable item/trigger prototype in template discovery rules (Templates > Template App Mirth > Discovery rules).  

## What's next ?

- ~~IP source filtering for security~~ done !
- ~~Zabbix version 4 compatibility~~ done !
- [UserParameter](https://www.zabbix.com/documentation/4.0/manual/config/items/userparameters) functionality to trigger custom actions in Mirth.

## License

This project is licensed under the GNU General Public License v3 (GPLv3) - see the [LICENSE](LICENSE) file for details.
