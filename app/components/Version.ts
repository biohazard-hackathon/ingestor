import {existsSync, readFileSync} from 'fs';
import {resolve} from 'path';

export default class Version {
	private version = 'dev';
	private buildDate: Date | null = null;
	private stable = false;

	constructor(basePath: string = resolve(__dirname + '/../../')) {
		const filePath = `${basePath || ''}/version.txt`;
		if (!existsSync(filePath)) {
			return;
		}
		const lines = readFileSync(filePath).toString().split(/\r?\n/);
		const versionRe = /^VERSION=(.*)$/;
		const buildDateRe = /^BUILD_DATE=(.*)$/;
		lines.forEach(line => {
			if (versionRe.test(line)) {
				this.version = (line.match(versionRe) || [])[1];
			} else if (buildDateRe.test(line)) {
				this.buildDate = new Date((line.match(buildDateRe) || [])[1]);
			}
		});

		this.stable = Boolean(this.version.match(/v(\d+).(\d+).(\d+)$/g));
	}

	getVersion(): string {
		return this.version;
	}

	getBuildDate(): Date | null {
		return this.buildDate;
	}

	isStable(): boolean {
		return this.stable;
	}
}
