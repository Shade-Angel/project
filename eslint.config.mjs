import js from "@eslint/js";
import globals from "globals";

export default [
	{
		files: ["eslint.config.mjs"],
		languageOptions: {
			sourceType: "module",
		},
		rules: {
			indent: ["warn", "tab"],
		},
	},

	js.configs.recommended,

	{
		ignores: ["eslint.config.mjs"],
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: "script",
		},
		rules: {
			"no-console": "off",
			"no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
			eqeqeq: ["warn", "smart"],
			indent: ["warn", "tab"],
			curly: "warn",
			semi: ["warn", "always"],
			quotes: "off",
			"no-var": "warn",
			"prefer-const": "warn",
		},
	},

	{
		files: ["src/**/*.js", "server.js", "demo.js", "test/**/*.js"],
		languageOptions: {
			globals: {
				...globals.node,
				...globals.commonjs,
			},
		},
	},

	{
		files: ["public/**/*.js"],
		languageOptions: {
			globals: {
				...globals.browser,
			},
		},

		rules: {
			"no-unused-vars": [
				"warn",
				{
					argsIgnorePattern: "^_",
					varsIgnorePattern: "^(exportData|importData|addPlant|loadReport|api)$",
				},
			],
		},
	},

	{
		ignores: ["node_modules/**", "plant-care.exe", "data.json", "*.backup.*", "images/**", "*.log"],
	},
];
