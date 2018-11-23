# MIRTHIX

Zabbix protocol implementation for [Mirth Connect](https://www.nextgen.com/products-and-services/NextGen-Connect-Integration-Engine-Downloads) integration engine. Provides direct monitoring capabilities with a channel acting like Zabbix agent.

## Implemented functionalities

- [Low level discovery](https://www.zabbix.com/documentation/4.0/manual/discovery/low_level_discovery) for deployed channels and enabled connectors in Mirth Connect.
- [Passive agent checks](https://www.zabbix.com/documentation/4.0/manual/appendix/items/activepassive) for data collection (polling):
  - Agent ping (agent.ping)
  - Host name of zabbix_agentd running (agent.hostname, system.uname)
  - Version of zabbix_agent(d) running (agent.version)
  - Channel deployment date (mirth.deployementdate)
  - Connector statistics: received, errored, filtered, queued, sent (mirth.statistics)
  - Channel status (mirth.channel.status)
  - Connector status (mirth.connector.status)

## Getting Started

### Prerequisites

- Mirth Connect ≥ 3.2.1
- Zabbix ≥ 3.4.12
- Zabbix template (Zabbix_template.xml)
- Zabbix value map (Zabbix_valuemap.xml)
- Mirthix channel (Mirthix_channel.xml)


### Installing

1. Import Mirthix channel `Mirthix_channel.xml` in Mirth Connect Administrator.
2. Configuration settings for Mirthix channel:
  - TCP Listener: don't use port 10050 if Zabbix agent is already running on the server.
  - Message storage/pruning is disabled by default because the channel will produce a lot of messages and full your database/file system. It should be activated only for debug purposes.
3. Import Zabbix template `Zabbix_template.xml` and value map `Zabbix_valuemap.xml` in Zabbix console.
4. Create host (or use an existing one) in Zabbix console with Mirth server IP address as Agent interface (with TCP Listener port) and add templates `Template App Mirth` and `Template App Zabbix Agent` (default agent availability template provided by Zabbix).


### Trigger adjustment

Trigger adjustment is done with template [macros](https://www.zabbix.com/documentation/3.4/manual/config/macros/usermacros) and [macro contexts](https://www.zabbix.com/documentation/3.4/manual/config/macros/usermacros#user_macro_context): Templates > Template App Mirth > Macro

Example:
To trigger "Queue on Zabbix Monitoring | Zabbix Server" problem when queued > 20, add macro `{$QUEUED:"Zabbix Monitoring | Zabbix Server"}` with value `20`. If no context is set on a macro, default macro `{$QUEUED}` will be used.

To disable unwanted item/trigger creation, you have to disable item/trigger prototype in template discovery rules (Templates > Template App Mirth > Discovery rules).  

## What's next ?

- IP source filtering for security
- [UserParameter](https://www.zabbix.com/documentation/4.0/manual/config/items/userparameters) functionality to trigger custom actions in Mirth.

## License

This project is licensed under the GNU General Public License v3 (GPLv3) - see the [LICENSE](LICENSE) file for details.
