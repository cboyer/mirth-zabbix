/**
 * MIRTHIX - Zabbix agent implementation for Mirth Connect.
 * Copyright (C) 2018 Cyril Boyer
 * https://github.com/cboyer/mirth-zabbix
 *
 * destination.js
 * Build response for Zabbix server
 *
 * Released under the GNU General Public License v3 (GPLv3)
 */

/*
 * Zabbix Protocol
 * https://www.zabbix.com/documentation/4.0/manual/appendix/protocols/header_datalen
 */

var header = "ZBXD\x01";
var data = connectorMessage.getEncodedData();

//logger.info("Sent to Zabbix: "+ data); //Debug

var header_bytes = new java.lang.String(header).getBytes('UTF-8');
var data_bytes = new java.lang.String(data).getBytes('UTF-8');

if (data_bytes.length + 1 >= 134217728) { // +1 for final 0x0A (LF)
  throw('Message exceeds the maximum size 134217728 bytes.');
}

var length_bytes = Packages.java.nio.ByteBuffer.allocate(8);
length_bytes.order(java.nio.ByteOrder.LITTLE_ENDIAN);
length_bytes.putInt(data_bytes.length + 1); // +1 for final 0x0A (LF)

var zabbix_message_bytes = Packages.java.nio.ByteBuffer.allocate(header_bytes.length + length_bytes.array().length + data_bytes.length);
zabbix_message_bytes.put(header_bytes);
zabbix_message_bytes.put(length_bytes.array());
zabbix_message_bytes.put(data_bytes);

return Packages.org.apache.commons.codec.binary.Base64.encodeBase64String(zabbix_message_bytes.array());
