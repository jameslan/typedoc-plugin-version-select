# How This Site Is Built

## Hosting

This documentation site is stored in the `gh-pages` branch and hosted on GitHub Pages.

To create a standalone branch, separate from your source code branches, you can use the `--orphan` argument of git:

```sh
git switch --orphan gh-pages
touch .nojekyll
git add .nojekyll
git commit -m "Initial commit for web site storing branch"
git push --set-upstream origin gh-pages
```

The `.nojekyll` file is used to prevent Jekyll from processing the files stored in this branch.

Now, go to the project's `Settings` tab on GitHub to set up your Pages site.

Under the `Build and deployment` section in the `Pages` section,
set the `Source` to `Deploy from a branch` and the `Branch` to the root directory of the `gh-pages` branch.

This will create an empty site that can be accessed even without a homepage.

## Directory Structure

Here’s the file structure of the `gh-pages` branch, which is also this documentation site:

```
gh-pages
  |-index.html
  |-versions.json
  |-.nojekyll
  |-dev
  |  |-index.html
  |  |-modules.html
  |  |-.nojekyll
  |  |-functions
  |  |  |-index.load.html
  |  |-documents
  |  |  |-example.html
  |  |-modules
  |  |  |-index.html
  |  |-assets
  |  |  |-icons.js
  |  |  |-hierarchy.js
  |  |  |-highlight.css
  |  |  |-version-select.css
  |  |  |-main.js
  |  |  |-version-select.js
  |  |  |-navigation.js
  |  |  |-style.css
  |  |  |-search.js
  |  |  |-icons.svg
  |-v1
  |  |-index.html
  |  |-modules.html
  |  |-.nojekyll
  |  |-functions
  |  |  |-index.load.html
  |  |-documents
  |  |  |-example.html
  |  |-modules
  |  |  |-index.html
  |  |-assets
  |  |  |-icons.js
  |  |  |-hierarchy.js
  |  |  |-highlight.css
  |  |  |-version-select.css
  |  |  |-main.js
  |  |  |-version-select.js
  |  |  |-navigation.js
  |  |  |-style.css
  |  |  |-search.js
  |  |  |-icons.svg
  |-.git
```

### Document for multiple versions

This document contains multiple versions of the website.

The first-level directories, `dev` and `v1`, represent two different versions.

- When the `master` branch has a new commit,
a GitHub workflow generates the updated document and commits it to the `dev` directory in the `gh-pages` branch.
- When a new version `1.*.*` is released,
the generated document is checked into the `v1` directory.

Once the content in the `gh-pages` branch changes,
GitHub deploys the updated assets to GitHub Pages.

### index.html

The website needs to redirect the browser to the default version when the user accesses the root homepage.
Since GitHub Pages doesn’t allow you to configure redirect responses,
we use the `<meta>` tag in the [index.html](https://github.com/jameslan/typedoc-plugin-version-select/blob/gh-pages/index.html#L7) head to make the browser jump to another URL.

This file needs to be manually updated when the default version changes.
For example, a new major version is released and stored in a new directory,
so it becomes the new default version.

### versions.json

[versions.json](https://github.com/jameslan/typedoc-plugin-version-select/blob/gh-pages/versions.json) contains the configuration of the content of the version select dropdown menu.

## GitHub Action

This project uses [a GitHub workflow](https://github.com/jameslan/typedoc-plugin-version-select/blob/master/.github/workflows/doc.yml) to automatically generate and check-in the document site.

### Triggering

The workflow is triggered when a new commit is pushed to the `master` branch or a new release is published.

### Permission

Since we need to commit to the `gh-pages` branch and push,
we require write permission.

### Steps

- In the step `Checkout the site branch`, we check out `gh-pages` branch into directory `site`.
- In the step `Build doc`, the documents are built into `docs` directory.
Due to our directory structure,
the default value of option `versionSpecHRef` works, so we don't need to customize it.
- In the step `Find variables`, shell script is used to set up some workflow variables
- In the `Find variables` step, a shell script is employed to set up essential workflow variables,
including the version (directory name) and commit message.
This step is identified by the id `vars` to facilitate referencing of these variables as `steps.vars.outputs.*`.
- Next, in the `Build site` step, the newly generated documents replace the subdirectory.
- Finally, in the `Commit to site branch` step, the changes are committed and pushed to the `gh-pages` branch.

By executing these steps, the documentation site is automatically updated in accordance with the latest commit.

However, it’s important to note that this workflow does not update the `versions.json` file.
Therefore, manual updates to this file are necessary when required.
