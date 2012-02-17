SHELL = /bin/bash
SRC_DIR = src
GENERIC_DIR = $(SRC_DIR)/generic
SPECIAL_DIR = $(SRC_DIR)/special
BUILD_DIR = build
EXT_NAME = kotlan@dennisdegryse.be
DE = gnome-shell

all: clean build

build: 
	@@cp -R $(GENERIC_DIR)/* $(BUILD_DIR)/
	@@cp -R $(SPECIAL_DIR)/$(DE_DIR)/* $(BUILD_DIR)/ 

clean:
	@@[ -d $(BUILD_DIR) ] && rm -Rf $(BUILD_DIR)/* || mkdir -p $(BUILD_DIR)

install:
	@@cp -R $(BUILD_DIR) ~/.local/share/gnome-shell/extensions/$(EXT_NAME)
