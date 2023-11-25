module.exports = {
	verbose: true,
	collectCoverage: true,
	collectCoverageFrom: [
		'<rootDir>/app/**/*.ts',
	],
	coverageDirectory: 'log',
	coverageReporters: ['lcov', 'text', 'cobertura'],
	reporters: [
		'default',
		[
			'jest-junit',
			{
				suiteName: "Jest",
				outputName: "log/junit.xml",
			},
		],
	],
	testMatch: [
		'<rootDir>/tests/**/*.ts',
	],
	testPathIgnorePatterns: [
		'<rootDir>/tests/testContainer.ts',
	],
	maxConcurrency: 1,
	transform: {
		"^.+\\.(ts)$": 'ts-jest',
	},
};
