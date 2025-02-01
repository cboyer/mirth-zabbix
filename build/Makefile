VERSION ?= 2.0.1
LASTMODIFIED := $(shell date +"%s%3N")
SOURCES = $(wildcard ../source/*.js)
OBJECTS = $(notdir $(SOURCES))
TARGET = ../release/Mirthix_channel.xml

.INTERMEDIATE: $(OBJECTS)

all: $(TARGET)

$(OBJECTS): %: ../source/%
	sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g; s/"/\&quot;/g; s/'"'"'/\&apos;/g' $< > $@

$(TARGET): $(OBJECTS)
	cpp -C template.xml $@
	sed -i '/^#.*$$/d' $@
	sed -i "s/\[LAST_MODIFIED\]/$(LASTMODIFIED)/" $@
	sed -i "s/\[AGENT_VERSION\]/$(VERSION)/" $@

clean:
	$(RM) $(TARGET)
