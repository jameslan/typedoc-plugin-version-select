# Version Select Plugin for TypeDoc

This plugin adds a version select drop-down menu beside the title of the TypeDoc generated document.

TypeDoc generates documentation for current version as a sub-site,
allowing you to manage the overall site organization.

A dynamically loaded JSON file provides the data of items for the version select.


# Usage

## Install the plugin using npm:

```sh
npm install --save-dev typedoc-plugin-version-select
```

## Apply the plugin to your configuration file:

```json
"plugin": ["typedoc-plugin-version-select"],
```

## Options

Option `versionSpecHRef` is used to customize the url of the version data file.
This option can be set to an absolute URL or a relative path.
The default value is `../versions.json`.

## Format of version spec file

The version spec file is a JSON file containing an array of items, where each item represents a version.

| Key | Description |
|-|-|
| version | The version string displayed in the version select |
| url | The URL of the sub-site of this version |

Here’s an example of the version spec file:

```json
[
  {
    "version": "1.0.0",
    "url": "https://jameslan.github.io/typedoc-plugin-version-select/1.0.0"
  },
  {
    "version": "1.1.0",
    "url": "https://jameslan.github.io/typedoc-plugin-version-select/1.1.0"
  }
]
```

# Demo

The documentation site of this plugin hosted on GitHub is an example of itself.

https://jameslan.github.io/typedoc-plugin-version-select/

# Compatible TypeDoc versions

- 0.27.x
