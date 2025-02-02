# Version Select Plugin for Typedoc

This plugin adds a version select drop-down besides the title.

A json file describing the items in this select is loaded dynamically.

Typedoc will generate the doc of the current version as a sub-site.
You can manage how the entire site is organized.

# Usage

## Install the plugin

```sh
npm install --save-dev typedoc-plugin-version-select
```

## Apply the plugin in the config

```json
"plugin": ["typedoc-plugin-version-select"],
```

## Options

Option `versionSpecUrl` is used to customize the url of the version data file.
It can be an absolute URL or a relative path.
The default value of this option is `../versions.json`.

## Format of version spec file

It is a json file of an array, each item represent one version.

| Key | Description |
|-|-|
| version | The version string displayed in the version select |
| url | The URL of the sub-site of this version |


# Example

The doc site of this plugin hosted on GitHub is an example of itself.

https://jameslan.github.io/typedoc-plugin-version-select/

# Compatible Typedoc versions

- 0.27.x
