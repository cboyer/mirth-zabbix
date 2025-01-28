lastmodified=$(shell date +"%s%3N")
version:=2.0.1

.INTERMEDIATE: destination.js source_transformer.js destination_transformer.js

build: destination.js source_transformer.js destination_transformer.js
	cpp -P -C template.xml ../release/Mirthix_channel.xml
	sed -i "s/\[LAST_MODIFIED\]/$(lastmodified)/" ../release/Mirthix_channel.xml
	sed -i "s/\[AGENT_VERSION\]/$(version)/" ../release/Mirthix_channel.xml

destination.js: ../source/destination.js
	sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g; s/"/\&quot;/g; s/'"'"'/\&apos;/g' ../source/destination.js > destination.js

source_transformer.js: ../source/source_transformer.js
	sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g; s/"/\&quot;/g; s/'"'"'/\&apos;/g' ../source/source_transformer.js > source_transformer.js

destination_transformer.js: ../source/destination_transformer.js
	sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g; s/"/\&quot;/g; s/'"'"'/\&apos;/g' ../source/destination_transformer.js > destination_transformer.js
