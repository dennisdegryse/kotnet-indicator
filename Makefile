SHELL = /bin/bash
SRC_DIR = src
GENERIC_DIR = $(SRC_DIR)/generic
SPECIAL_DIR = $(SRC_DIR)/special
BUILD_DIR = build
EXT_NAME = kotnet@dennisdegryse.be
DE = gnome-shell
INSTALL_DIR = ~/.local/share/gnome-shell/extensions/$(EXT_NAME)

all: clean merge

merge:
	@@cp -R $(GENERIC_DIR)/* $(BUILD_DIR)/
	@@cp -R $(SPECIAL_DIR)/$(DE)/* $(BUILD_DIR)/ 

clean:
	@@[ -d $(BUILD_DIR) ] && rm -Rf $(BUILD_DIR)/* || mkdir -p $(BUILD_DIR)

install:
	@@[ -d $(INSTALL_DIR) ] && rm -Rf $(INSTALL_DIR) || true;
	@@cp -R $(BUILD_DIR) $(INSTALL_DIR);
	@@echo "Successfully installed. Please hit Alt+F2 and run 'r' to restart Gnome Shell."
