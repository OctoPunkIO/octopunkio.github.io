---
title: Notifications
order: 1
---

# Notifications

Octopunk implements an advanced notification system.

<video src="/screens/octopunk-notifications.mp4" controls width="100%" loop muted></video>

One of the biggest complaints with GitHub is how difficult it is to manage
notifications. It is often hard to make sense of your notifications and these
notifications act more as a fire-hose than a fine-grained system.

Octopunk fixes this issue by allowing the user to filter exactly what
notifications they want in their [inbox](/docs/features/dashboard#inbox).

When Octopunk first starts all notifications are forwarded to your inbox.

The notification page can be opened via the [command palette](/docs/features/omnibar#command-palette)
or by clicking the link icon in the notification card's header.

Within the notifications page a new notification filter tab can be created.
Clicking on the settings icon of the tab will allow you to set a name, filter and a color
for the tab. Additionally, if you click the subscribe icon notifications which
match this filter will be forwarded to your [inbox](/docs/features/dashboard#inbox).

When the subscribe button is clicked the `all` tab which forwards all notifications
to your inbox is unsubscribed, favoring your custom set of filters. If you
would like to have all notifications along with your custom filtered notifications
appear in the inbox, simply replicate the 'all' tab by creating a notification
filter tab with no search query, and subscribe to this.

Color coding notifications can be helpful to quickly identify why the notification
has been received. The notifications which match a filter will show their filter
names in the associated color in the inbox.

![Filtered notifications](/screens/octopunk-filtered-notification-screenshot.png)

## Enriched filters

Because Octopunk is a layer of intelligence on top of GitHub's notification
system, it can enrich the notification prior to evaluating it.

This allows Octopunk to create new and advanced filter types for notifications
not possible in the GitHub web app.

Two of these filters exist, fixing one of the complaints we hear the most about
notifications.

`reason: user-review-requested` - This is a Octopunk only feature which filters
requested review from your username directly. This is contrary to GitHub's
`review-requested` which is coarse grain and fires when a review is requested
for any group or org your user is apart of, in addition to your username.

`reason: team-review-requested` - This is an Octopunk only feature which filters
requested review from any team your user is apart of but will not fire
when a review is requested for your username directly.

All other GitHub support filters are also supported by Octopunk.
