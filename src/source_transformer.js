/**
 * MIRTHIX - Zabbix agent implementation for Mirth Connect.
 * Copyright (C) 2018 Cyril Boyer
 * https://github.com/cboyer/mirth-zabbix
 *
 * source_transformer.js
 * Decode base 64 data from TCP Listener (binary mode).
 *
 * Released under the GNU General Public License v3 (GPLv3)
 */

 msg = new java.lang.String(FileUtil.decode(msg));
