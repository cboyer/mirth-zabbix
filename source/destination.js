/**
 * MIRTHIX - Zabbix agent implementation for Mirth Connect.
 * Copyright (C) 2018-2025 Cyril Boyer
 * https://github.com/cboyer/mirth-zabbix
 *
 * destination.js
 * Build response for Zabbix server
 *
 * Released under the GNU General Public License v3 (GPLv3)
 *
 * Zabbix Protocol documentation:
 * https://www.zabbix.com/documentation/4.0/manual/appendix/protocols/header_datalen
 */


//Get data for each part of the message, "reserved" is needed but not used
var protocol = "ZBXD";
var flag = "\x01";
var reserved = "\x00\x00\x00\x00";
var data = connectorMessage.getEncodedData();
var datalen = data.length();

//Get byte arrays from each part of the message, "reserved" is fixed with 0x00 bytes, no need to use bytebuffer with LITTLE_ENDIAN
var protocol_bytes = new java.lang.String(protocol).getBytes('UTF-8');
var flag_bytes = new java.lang.String(flag).getBytes('UTF-8');
var reserved_bytes = new java.lang.String(reserved).getBytes('UTF-8');
var data_bytes = new java.lang.String(data).getBytes('UTF-8');

//Encode data length (integer) to 4 bytes little endian
var datalen_bytes = Packages.java.nio.ByteBuffer.allocate(4);
datalen_bytes.order(java.nio.ByteOrder.LITTLE_ENDIAN);
datalen_bytes.putInt(data_bytes.length);

//Build message with 13 bytes header + data
var zabbix_message_bytes = Packages.java.nio.ByteBuffer.allocate(protocol_bytes.length + flag_bytes.length + datalen_bytes.array().length + reserved_bytes.length + data_bytes.length);
zabbix_message_bytes.put(protocol_bytes);
zabbix_message_bytes.put(flag_bytes);
zabbix_message_bytes.put(datalen_bytes.array());
zabbix_message_bytes.put(reserved_bytes);
zabbix_message_bytes.put(data_bytes);

//logger.info("Send data to server: "+ data); //Debug
//logger.info("Send bytes to server: " + Packages.org.apache.commons.codec.binary.Hex.encodeHexString(zabbix_message_bytes.array())); //Debug
return Packages.org.apache.commons.codec.binary.Base64.encodeBase64String(zabbix_message_bytes.array());
