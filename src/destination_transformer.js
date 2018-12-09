/**
 * MIRTHIX - Zabbix agent implementation for Mirth Connect.
 * Copyright (C) 2018 Cyril Boyer
 * https://github.com/cboyer/mirth-zabbix
 *
 * destination_transformer.js
 * Process requested data (discovery, item).
 *
 * Released under the GNU General Public License v3 (GPLv3)
 */

var agent_version = '1.1.1';
var item_requested = msg.toString();
//logger.info("Zabbix requested: " + item_requested); //Debug

//Parse parameters in requested item
if (item_requested.indexOf('[') != -1 && item_requested.indexOf(']') != -1 ) {
	var connector_id = '';
	var channel_id = '';
	var metric = '';

	//Get connector id and/or channel id
	if (item_requested.indexOf('_') != -1) {

		if (item_requested.indexOf(',') != -1) {
			connector_id = item_requested.split('_')[1];
			connector_id = connector_id.split(',')[0];
		}
		else {
			connector_id = item_requested.split('_')[1].replace(']', '');
		}

		connector_id = parseInt(connector_id);
		channel_id = item_requested.split('_')[0];
		channel_id = channel_id.split('[')[1];
	}
	else {
		channel_id = item_requested.split('[')[1];
		channel_id = channel_id.replace(']', '');
	}

	//Get metric parameter
	if (item_requested.indexOf(',') != -1) {
		metric = item_requested.split(',')[1].replace(']', '');
	}

	item_requested = item_requested.split('[')[0];
}


/*
 * Zabbix agent passive checks implementation
 * https://www.zabbix.com/documentation/4.0/manual/appendix/items/activepassive
 */

switch (item_requested) {

	case 'agent.ping':
		msg = 1;
		//logger.info("Agent ping: " + msg); //Debug
		break;

	case 'agent.version':
		msg = 'Mirthix ' + agent_version;
		//logger.info("Agent version: " + msg); //Debug
		break;

	case 'agent.hostname':
	case 'system.uname':
		msg = com.mirth.connect.server.controllers.ConfigurationController.getInstance().getServerName();
		//logger.info("System name: " + msg); //Debug
		break;

	case 'mirth.deployementdate':
		var controller = com.mirth.connect.server.controllers.ControllerFactory.getFactory().createEngineController();
		var channel_status = controller.getChannelStatus(channel_id);

		if (channel_status == null)
			msg = "ZBX_NOTSUPPORTED\x00Item became not available";
		else
			msg = channel_status.getDeployedDate().getTime().toString();

		//logger.info("Deployment date: " + channel_id + " " + msg); //Debug
		break;

	case 'mirth.statistics':
		switch (metric) {
			case 'received':
				msg = ChannelUtil.getReceivedCount(channel_id, connector_id);
				//logger.info("Received: " + channel_id + " " + connector_id + " : " + msg); //Debug
				break;
			case 'sent':
				msg = ChannelUtil.getSentCount(channel_id, connector_id);
				//logger.info("Sent: " + channel_id + " " + connector_id + " : " + msg); //Debug
				break;
			case 'errored':
				msg = ChannelUtil.getErrorCount(channel_id, connector_id);
				//logger.info("Errored: " + channel_id + " " + connector_id + " : " + msg); //Debug
				break;
			case 'queued':
				msg = ChannelUtil.getQueuedCount(channel_id, connector_id);
				//logger.info("Queued: " + channel_id + " " + connector_id + " : " + msg); //Debug
				break;
			case 'filtered':
				msg = ChannelUtil.getFilteredCount(channel_id, connector_id);
				//logger.info("Filtered: " + channel_id + " " + connector_id + " : " + msg); //Debug
				break;
			default:
				msg = "ZBX_NOTSUPPORTED\x00Metric not implemented in Mirthix: " + metric;
		}

		if (msg == null)
			msg = "ZBX_NOTSUPPORTED\x00Item became not available";

		break;

	case 'mirth.channel.status':
	case 'mirth.connector.status':
		var item_status = '';

		if (item_requested == 'mirth.connector.status')
			item_status = ChannelUtil.getConnectorState(channel_id, connector_id) + ""; //toString() not effective in switch

		if (item_requested == 'mirth.channel.status')
			item_status = ChannelUtil.getChannelState(channel_id) + ""; //toString() not effective in switch

		switch (item_status) {
			case 'Started':
				msg = 0;
				break;
			case 'Stopped':
				msg = 1;
				break;
			case 'Paused':
				msg = 2;
				break;
			case 'Deploying':
				msg = 3;
				break;
			case 'Pausing':
				msg = 4;
				break;
			case 'Starting':
				msg = 5;
				break;
			case 'Stopping':
				msg = 6;
				break;
			case 'Undeploying':
				msg = 7;
				break;
			default:
				msg = "ZBX_NOTSUPPORTED\x00Item became not available";
		}

		//logger.info("Status: " + msg); //Debug
		break;

	/*
	 * Zabbix low level discovery implementation (JSON) for deployed channels and enabled connectors
	 * https://www.zabbix.com/documentation/4.0/manual/discovery/low_level_discovery
	 */

	//Autodiscovery for deployed channels
	case 'mirth.discovery.channel':
		var deployed_channel_ids = ChannelUtil.getDeployedChannelIds().toArray();
		var controller = com.mirth.connect.server.controllers.ControllerFactory.getFactory().createChannelController();
		var zabbix_autodiscovery = {
			"data" : []
		};

		//Loop over deployed channels
		for (var i = 0; i < deployed_channel_ids.length; i++) {
			var channel_id = deployed_channel_ids[i];
			var channel_name = ChannelUtil.getDeployedChannelName(channel_id);
			var channel = {
				"{#ID}" : new String(channel_id),
				"{#NAME}" : new String(channel_name)
			}

			zabbix_autodiscovery.data.push(channel);
		}

		msg = JSON.stringify(zabbix_autodiscovery);
		break;

	//Autodiscovery for enabled connectors
	case 'mirth.discovery.connector':
		var deployed_channel_ids = ChannelUtil.getDeployedChannelIds().toArray();
		var controller = com.mirth.connect.server.controllers.ControllerFactory.getFactory().createChannelController();
		var zabbix_autodiscovery = {
			"data" : []
		};

		//Loop over deployed channels
		for (var i = 0; i < deployed_channel_ids.length; i++) {
			var channel_id = deployed_channel_ids[i];
			var channel_name = ChannelUtil.getDeployedChannelName(channel_id);

			//Deployed channel always has a Source connector with MetaDataId=0
			//MetaDataId only unique in channel context, so concatenate with ChannelId
			if (ChannelUtil.getConnectorState(channel_id, 0) != null) {
				var source_connector = {
					"{#ID}" : new String(channel_id + "_0"),
					"{#NAME}" : new String(channel_name + " | Source")
				}

				zabbix_autodiscovery.data.push(source_connector);
			}

			//Loop over destination connectors
			var channel_controller = controller.getChannelById(channel_id);
			for (var destination in Iterator(channel_controller.getDestinationConnectors())) {

				if (ChannelUtil.getConnectorState(channel_id, destination.getMetaDataId()) != null) {
					var destination_connector = {
						"{#ID}" : new String(channel_id + "_" + destination.getMetaDataId()),
						"{#NAME}" : new String(channel_name+" | "+destination.getName())
					}

					zabbix_autodiscovery.data.push(destination_connector);
				}
			}
		}

		msg = JSON.stringify(zabbix_autodiscovery);
		break;

	default:
		msg = "ZBX_NOTSUPPORTED\x00Key not implemented in Mirthix: " + item_requested;
}
