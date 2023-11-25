#!/usr/bin/env bash
root_project = ..

appname := ingestor
build = build
target = target

BG =\n\033[0;36m-- # Beginning
NC =\033[0m\n# No Color

$(shell git config --global --add safe.directory /www)

version := $(shell git describe --tags --match="v*")

.PHONY: all
all: clean package

.PHONY: npm
npm:
	@(printf "${BG}Installing NPM dependencies${NC}")
	    cd $(root_project) && npm install --ci --no-audit

.PHONY: clean
clean:
	@(printf "${BG}Cleaning project${NC}")
		rm -rf $(build)
		rm -rf $(target)
		rm -rf $(root_project)/log/*
		rm -rf $(root_project)/tmp/*

.PHONY: app
app: npm
	@(printf "${BG}Creating build directory${NC}")
		mkdir -p $(build) $(target)

	@(printf "${BG}Preparing build directory${NC}")
		mkdir -p $(build)/app $(build)/node_modules
		chmod -R 777 $(build)

	@(printf "${BG}Generating version file${NC}")
		echo "VERSION=$(version)" >$(build)/version.txt
		echo "BUILD_DATE=$(shell date --utc +%FT%TZ)" >>$(build)/version.txt
		echo "BUILD_TAG=$(shell echo $$BUILD_TAG)" >>$(build)/version.txt

	@(printf "${BG}Copying app to build directory${NC}")
		cp -r $(root_project)/app/config $(build)/app/
		cp -r $(root_project)/node_modules $(build)/
		cp $(root_project)/package.json $(build)/
		cp $(root_project)/package-lock.json $(build)/

	@(printf "${BG}Create artifact${NC}")
		cd $(root_project) && npm run build -- --outDir release/$(build)
		cd $(build) && npm prune --omit=dev --no-audit
		rm $(build)/package.json $(build)/package-lock.json

.PHONY: package
package: app
	@(printf "${BG}Creating package for backend service${NC}")
		cd $(build) && zip -urq ../$(target)/$(appname).zip ./*

	@(printf "${BG}Package version $(version) is ready${NC}")
		echo $(version) > $(target)/latest.version

.PHONY: qa
qa:
	@(printf "${BG}Prepare log directory${NC}")
		mkdir -p /www/log
		chmod -R 777 /www/log

	@(printf "${BG}Running tests${NC}")
		cd $(root_project) && export FORCE_COLOR=1 && npm test || true

.PHONY: release
release:
	@(printf "${BG}Upload package to S3 repository${NC}")
		aws s3 cp ${target}/latest.version "s3://biohazard-release/dev/biohazard-${appname}.version";
		aws s3 cp ${target}/${appname}.zip "s3://biohazard-release/dev/biohazard-${appname}.zip";
		aws s3 cp ${target}/${appname}.zip "s3://biohazard-release/dev/biohazard-${appname}-$(version).zip";

		if [ `echo ${version} | egrep "^v[0-9]+(+\.[0-9]+){2}$$"` ]; then \
			aws s3 cp ${target}/latest.version "s3://biohazard-release/stable/biohazard-${appname}.version"; \
            aws s3 cp ${target}/${appname}.zip "s3://biohazard-release/stable/biohazard-${appname}.zip"; \
			aws s3 cp ${target}/${appname}.zip "s3://biohazard-release/stable/biohazard-${appname}-$(version).zip"; \
        fi
