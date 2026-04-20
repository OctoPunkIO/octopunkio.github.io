---
title: Code intelligence
order: 1
---

# Code intelligence

Code intelligence utilizes LSP servers to allow intelligent navigation of a
repository's code.

<video src="/screens/octopunk-code-int.mp4" controls width="100%" loop muted></video>

When code intelligence is enabled on a repository the repository is cloned
locally and the appropriate set of LSPs is started if they exist on the
host. From this point on Octopunk will track branch changes, pushes, and
tab switches to keep the cloned repo in-sync with Octopunk.

Code intelligence provides the following features:

1. Hover documentation
2. Go to symbols
3. Find references
4. Workspace symbol search
5. Document outline

The following LSPs are supported:

| Language | LSP Server |
|----------|------------|
| Go | gopls |
| TypeScript / JavaScript | typescript-language-server |
| Rust | rust-analyzer |
| Python | pyright |
| C / C++ / Objective-C | clangd |
| Java | jdtls |


LSPs are enabled on a per-repository basis. Tabs of the same repository share
the LSP instances. Octopunk will update the code and manage the LSPs as you
change tabs of the same repository.

Once all tabs of a particular repository with code intelligence enabled are
closed, the LSPs will be shut down.

## Discovering LSPs

Octopunk must find a given LSP in path, or you must tell Octopunk where the
LSP can be found on the file system. The latter is done in the settings panel.

The settings panel will visually display if it can find a supported LSP successfully.

## Configuring and enabling code intelligence

Octopunk will automatically detect if one or more LSPs can be used for the repo,
based on the repo's reported language content.

Clicking on the code intelligence icon on the top right of the repository page
will open the code intelligence configuration menu.

This menu will display the appropriate LSPs for the repository, and allow you to
click on each one.

When you click on a particular LSP you can provide pre-launch commands. Pre-launch
commands are run, on a clean repository, prior to the LSP starting. This can be
useful for LSPs, such as `clangd` which require artifacts to be created prior to
starting. Pre-launch commands are remembered, on a per-repository basis.

Once individual LSPs are configured you can click the 'Enable' button to begin the
initialization flow. This flow has several steps outlined in the configuration
menu. Each step can be clicked on to show any logs associated with the step.


<video src="/screens/octopunk-code-int-config.mp4" controls width="100%" loop muted></video>


