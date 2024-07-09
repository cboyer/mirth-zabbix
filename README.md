# Mirthix

Zabbix protocol implementation for [Mirth Connect](https://www.nextgen.com/solutions/interoperability/mirth-integration-engine/mirth-connect-downloads) integration engine. Provides direct monitoring capabilities with a channel acting like Zabbix agent.

## Implemented functionalities

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

- Mirth Connect ≥ 3.2.1, latest tested version: 4.5.0
- Zabbix version ≥ 3, latest tested version: 7.0.0 LTS
- Zabbix template (release/Zabbix_template.xml)
- Mirthix channel (release/Mirthix_channel.xml)

### Installing

1. Import Mirthix channel `release/Mirthix_channel.xml` in Mirth Connect Administrator.
2. Configuration settings for Mirthix channel:
  - To monitor Mirth Connect with a dedicated host in Zabbix:
    - TCP Listener: port 10050 or the port of your choice.
    - Add Zabbix server IP in Source Filter (Edit channel > Source > Edit Filter > Rule > Values), change value from '127.0.0.1' to Zabbix server IP, save and deploy channel.

  - To monitor Mirth Connect with an existing host in Zabbix, you have to configure the running Zabbix agent as a proxy:
    - TCP Listener: change port to 10051.
    - Add '127.0.0.1' in Source Filter (Edit channel > Source > Edit Filter > Rule > Values).
    - Add the `config/zabbix_agentd.d/mirth.conf` file to your Zabbix agent's config folder.
	 In your zabbix_agentd.conf, make sure you have an Include option : "Include=C:\Program Files\Zabbix Agent\zabbix_agentd.conf.d\*.conf" for Windows or "Include=/etc/zabbix/zabbix_agentd.conf.d/*.conf" for Linux.
3. Import Zabbix template `release/Zabbix_template.xml` in Zabbix console, the template will by named `Template App Mirth`.
4. Associate the template to the host:
  - For a new host:
    - Create host in Zabbix console with Mirth server IP address as Agent interface (with TCP Listener port) and add templates:
      - `Template App Mirth`
      - `Template App Zabbix Agent` (pre Zabbix 5.0)
      - `Template Module Zabbix agent` (Zabbix 5.0)
      - `Zabbix agent` (Zabbix 6.0)
  - For an existing host:
    - Just add the template `Template App Mirth`.



> Message storage is disabled by default because the channel may produce a lot of messages and full your database/file system. It should be activated only for debug purposes.

### Testing

Mirthix can be tested with zabbix_get binary provided with [Zabbix agent](https://www.zabbix.com/download_agents):
```Console
./zabbix_get -s 127.0.0.1 -p 10050 -k agent.version
Mirthix 2.0.0
```

A Docker test environment with Zabbix and Mirth Connect is available in the [test](./test) directory.

### Trigger adjustment (Zabbix template)

Trigger adjustment is done with template [macros](https://www.zabbix.com/documentation/3.4/manual/config/macros/usermacros) and [macro contexts](https://www.zabbix.com/documentation/3.4/manual/config/macros/usermacros#user_macro_context): Templates > Template App Mirth > Macro.

*Example:*
To trigger "Queue on Zabbix Monitoring | Zabbix Server" problem when queued > 20, add macro `{$QUEUED:"Zabbix Monitoring | Zabbix Server"}` with value `20`. If no context is set on a macro, default macro `{$QUEUED}` will be used.

To disable unwanted item/trigger creation, you have to disable item/trigger prototype in template discovery rules (Templates > Template App Mirth > Discovery rules).

## License

This project is licensed under the GNU General Public License v3 (GPLv3) - see the [LICENSE](LICENSE) file for details.
