# npm Registry

An extension to help with adding dependencies to your project from the npm public registry.

## Completions

For those who can't quite remember a package name or can't keep up with the current version number, completions in your **package.json** can help. Within your `dependencies` or `devDependencies` objects, you can:

1. On a new line, start typing a package name like `html-webpack-plugin` to see completion suggestions.
2. After selecting the package name, the "compatible with" (caret prefixed) latest version is pre-filled. Hit **Enter** to accept this version.
3. To select a different version, start typing a release tag like **'latest'** or major version number to see version suggestions.

> **NOTE:** Nova currently sorts my carefully ordered list in a less useful manner. I've reached out to Panic to see if they can retain my ordering, but in the meantime I passive-aggressively show my ranking before the package name to demonstrate how useful it could be.

## Entitlements

- **Network:** this extension contacts the APIs of [npms.io](https://npms.io/) and [npmjs.com](https://www.npmjs.com/) to pull suggestions of package names and versions.

## Disclaimer

npm is a registered trademark of npm, Inc. The npm public registry and the npm logo are the property of npm, Inc. The npm logo is used here with permission.

_This extension and its author are not affiliated with npm, Inc._
