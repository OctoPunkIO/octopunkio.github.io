---
title: Getting started
order: 2
---

# Getting started

Get up and running with Octopunk in just a few minutes.

## Download

Octopunk is available for macOS, Windows, and Linux:

Visit the [Homepage](/) page to download the latest version.

See below for additional installation methods.

## Additional installation options

### macOS

#### Brew

TODO: add brew install instructions

#### App store

TODO: add app store install instructions


### Windows

1. Run the downloaded installer
2. Follow the installation wizard
3. Launch Octopunk from the Start menu

### Linux

TODO: add flathub installation info

## Authentication

When Octopunk is launched for the first time you are presented with a welcome
screen.

<video src="/screens/octopunk-authenticate.mp4" controls width="100%"></video>

This screen will ask you to authenticate to GitHub.

You have two options for authentication, OAuth based and PAT based. PAT is
recommended.

### PAT authentication

A PAT is a personal access token.

PATs can be created by going to the following settings page:
https://github.com/settings/tokens

Either a classic or fine-grained token can be used. Octopunk is a full GitHub
client which aims to support all GitHub features. Therefore, Octopunk expects
a token with all scopes enabled.

However, if there are privileges you do not want to grant to Octopunk, leaving
them out of the PAT scope is suggested. Some of Octopunk's functionality may
not work however.

PAT is the preferred authentication method. PAT is the authentication method the
`GH` CLI uses as well. A PAT is a token that directly identifies your user to
GitHub.

### OAuth

Some users are more comfortable with using the OAuth flow. This typically stems
from not needing to generate any type of token and manage it.

Octopunk supports OAuth, however, GitHub's implementation of OAuth requires
each repository to allow an OAuth application access.

Therefore, if you plan on using OAuth authentication, all GitHub resources you
plan to access must allow the Octopunk application access. This access can
only be granted from the GitHub web app.

This is less ideal from the perspective of a GitHub client, as a client's model
is more aligned to acting as the user, not as a 3rd party application.
