IMAGES?=$(shell docker ps -a --format '{{.Names}}' | grep "^test" | tr '\n' ' ')

build:
	docker-compose up -d
	@docker rm -f $$(docker ps -a --format '{{.Names}}' | grep "mirthdb-init")

clean rm: stop
	docker rm -f $(IMAGES) > /dev/null 2>&1 || true

stop:
	docker stop $(IMAGES) > /dev/null 2>&1 || true

start:
	docker start $(IMAGES)

restart: stop start

reset: 	clean
	docker volume rm tests_pg_data

ps ls list:
	@docker ps -a
	@docker images

prune:  stop
	docker system prune --all --volumes --force

configure:
	bash configure.sh

test:
	docker exec $$(docker ps -a --format '{{.Names}}' | grep "zabbix-server") zabbix_get -s mirth -p 10050 -k mirth.discovery.channel
	docker exec $$(docker ps -a --format '{{.Names}}' | grep "zabbix-server") zabbix_get -s mirth -p 10050 -k agent.ping
	docker exec $$(docker ps -a --format '{{.Names}}' | grep "zabbix-server") zabbix_get -s mirth -p 10050 -k agent.version
