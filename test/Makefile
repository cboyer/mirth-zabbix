build:
	docker-compose up -d

clean rm:
	docker-compose down --volumes

prune:
	docker-compose down --rmi all --volumes

stop:
	docker-compose stop

start:
	docker-compose start

restart:
	docker-compose restart

ps ls list:
	@docker ps -a
	@docker images

configure:
	bash configure.sh

test:
	docker exec zabbix-server zabbix_get -s mirth -p 10050 -k mirth.discovery.channel
	docker exec zabbix-server zabbix_get -s mirth -p 10050 -k agent.ping
	docker exec zabbix-server zabbix_get -s mirth -p 10050 -k agent.version
