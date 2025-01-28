/**
 * MIRTHIX - Zabbix agent implementation for Mirth Connect.
 * Copyright (C) 2018-2025 Cyril Boyer
 * https://github.com/cboyer/mirth-zabbix
 *
 * source_transformer.js
 * Decode data from TCP Listener (binary mode/base64) to get requested key.
 *
 * Released under the GNU General Public License v3 (GPLv3)
 *
 * Zabbix Protocol documentation: 
 * https://www.zabbix.com/documentation/4.0/manual/appendix/protocols/header_datalen
 */


msg = new java.lang.String(FileUtil.decode(msg));

//logger.info("Message from: " + $('remoteAddress')); //Debug
//logger.info("Received bytes from server: " + Packages.org.apache.commons.codec.binary.Hex.encodeHexString(msg.getBytes())); //Debug

//Check for Zabbix 4.X Protocol (request with header)
if (msg.substring(0, 5) == "ZBXD\x01" && msg.length() > 13) {

	//Requested key length is bytes 5 to 9
	var length_bytes = msg.substring(5, 9).getBytes();

	//Decode the 4 bytes little endian to integer
	var bytebuf = Packages.java.nio.ByteBuffer.wrap(length_bytes);
	bytebuf.order(java.nio.ByteOrder.LITTLE_ENDIAN);
	var length = bytebuf.getInt(0);

	//Requested key is bytes 13 to 13 + length
	msg = msg.substring(13, 13 + length);
}

//Check for Zabbix 3.X Protocol (request without header and ending with 0x0A)
else if (msg.charAt(msg.length() - 1) == 0x0A) {

	//Simply remove final 0x0A
	msg = msg.slice(0, -1);
}

//Else it's not a Zabbix request, ensure destination transformer will return ZBX_NOTSUPPORTED
else msg = 'UnknownProtocol';
