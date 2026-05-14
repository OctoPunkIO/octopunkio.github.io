---
title: "Introducing Octopunk: who we are, what we're building, and how to try it"
date: 2026-05-12
author: The Octopunk team
excerpt: We've been living inside a browser tab for ten years. The beta is open.
---

We've been living inside a browser tab for ten years. We want out.

GitHub is where the work happens, so the work has been stuck in Chrome, Firefox, or (*shivers*) Internet Explorer. Tab 14 is a pull request, tab 22 is an issue we meant to triage three days ago, the notifications bell is red and that means absolutely nothing. We've trained ourselves to ignore it.

Octopunk is what we built when we couldn't take it anymore. Not a `git` GUI with a "Create PR" button bolted on, a real client for the GitHub platform. The whole thing. On the desktop, where you actually work.

Today the beta is open.

<div class="demo-frame">
  <video src="/screens/octopunk-demo-reel.mp4" controls autoplay muted loop playsinline></video>
</div>

## The notification thing

<div class="demo-frame" style="--cycle-offset: 0s;">
  <div class="demo-cycle">
    <img src="/screens/frames/notifications-1.png" alt="Octopunk notifications inbox with multiple filter tabs across the top" />
    <img src="/screens/frames/notifications-2.png" alt="Creating a new notification filter with a custom query" />
    <img src="/screens/frames/notifications-3.png" alt="Custom 'reason: assign' filter showing only assigned-to-me notifications" />
  </div>
</div>

The first thing Octopunk fixes is notifications. Anyone who has worked on a busy repo has seen this play out. GitHub gives you a firehose, no real filters, and a notification system that makes the things you actually care about hard to surface. Review requests assigned to a team you're on, for example. You end up either turning the bell off entirely or pretending it isn't blinking.

Octopunk lets you build filters by query, same query language you already know from issue search. Each filter gets a name, a color, and a subscribe button. The matched notifications land in your dashboard inbox with a colored pill so you can tell at a glance what kind of thing each one is. It is the first time in a long time we haven't been mad at the notifications bell.

More in the [notifications docs](/docs/features/notifications).

## The dashboard

<div class="demo-frame" style="--cycle-offset: -1.4s;">
  <div class="demo-cycle">
    <img src="/screens/frames/dashboard-1.png" alt="Octopunk dashboard with the inbox, recently viewed, and feed cards on the left and pull-request and issue widgets on the right" />
    <img src="/screens/frames/dashboard-2.png" alt="Sidebar card visibility menu — hide and reorder dashboard cards" />
    <img src="/screens/frames/dashboard-3.png" alt="Dragging a widget into a 2x2 layout on the dashboard" />
  </div>
</div>

Open github.com and the first thing you see is a feed. An algorithmic scroll of stars, follows, and "someone you follow forked something three days ago". That made sense in 2010, when every web product was trying to be a social network. It does not make sense in 2026 if your job is shipping code. GitHub is not Instagram, and a timeline of stargazer activity is not a tool.

Octopunk opens to a dashboard, not a feed. A customizable heads-up display you build yourself. Widgets are search queries, your activity feed (if you still want one), the GitHub activity graph, things like that. Drag them around, name them, build a layout that matches the streams of work you actually care about, ignore the rest. Search widgets take the full GitHub search syntax so you can express "all open PRs in my org that haven't been reviewed in three days" and just leave it on screen.

Navigation around the rest of the app keeps the same vibe. An omnibar for cross-repo GitHub search, recently visited items, and open tabs. A context-aware command palette that gives you different commands on a PR than on an issue or a user page. Both fuzzy searchable, both keyboard-first.

More in the [dashboard](/docs/features/dashboard), [omnibar](/docs/features/omnibar), and [command palette](/docs/features/command-palette) docs.

## Code intelligence

<div class="demo-frame" style="--cycle-offset: -2.9s;">
  <div class="demo-cycle">
    <img src="/screens/frames/code-intelligence-1.png" alt="Octopunk detects a supported language server for the repo and offers to enable it" />
    <img src="/screens/frames/code-intelligence-2.png" alt="Go to definition working locally and across files in a code review" />
    <img src="/screens/frames/code-intelligence-3.png" alt="Searching symbols in real time across every file in the repo" />
  </div>
</div>

Code review is the thing we cared about most. Reading diffs in the GitHub web UI is fine for ten lines and miserable for two hundred. Octopunk wires a local LSP into the file viewer. Hover for type info, jump to definitions, search symbols, all of it works on the code you are reviewing, in the same window. There is a per-repo settings panel for things like `compile_commands.json` for `clangd`, so the LSPs that need a bit of setup get one without sending you off to write a wrapper script.

More in the [code intelligence docs](/docs/features/code-intelligence).

## Yes, AI

<div class="demo-frame" style="--cycle-offset: -0.6s;">
  <div class="demo-cycle">
    <img src="/screens/frames/ai-assistant-1.png" alt="Octopunk AI assistant panel with suggested prompts for finding PRs, summarizing changes, and posting comments" />
    <img src="/screens/frames/ai-assistant-2.png" alt="AI assistant analyzing a pull request and producing a structured review summary" />
    <img src="/screens/frames/ai-assistant-3.png" alt="Alt-clicking a specific comment in a PR to scope the AI assistant to that thread" />
  </div>
</div>

Octopunk ships with an AI assistant. Everyone is shipping one. The interesting question tho, is what to do with it.

Hold `Alt`, click something on the page, and you've given the assistant a precise piece of context. A comment, a PR, a file, a user. From there you can ask specific things. "What is this PR actually changing?" "Draft a reply to this thread." "Summarize this conversation for me." Without a selection it gets the whole page as context and figures it out. It has tools for code review, comment drafting, fetching code it does not already have, and a few other things. You bring your own API key (Anthropic, Gemini, or OpenAI) so the conversation stays on a provider you trust.

More in the [AI assistant docs](/docs/features/ai-assistant).

## The rest

The features above are the ones we wanted to call out first. They aren't the whole product. Octopunk also handles pull requests end-to-end, issues, projects, discussions, releases, actions and CI workflows. None of them are clones of the GitHub web UI. Anywhere the platform has a surface, Octopunk reworks it the way modern developer tools work. Outlines for navigating big PRs and issues. Context that stays with you when you jump between comments, files, and code. The rest is for future posts.

## Why bother

If you spend serious time on GitHub, the browser is the wrong interface. Octopunk is the only tool that gives you the actual GitHub platform on the desktop. Notifications you can triage. PRs you can review in one window. Issues, projects, discussions, actions, and a code-review surface with real LSPs. Keyboard-first, the whole thing, not a browser tab in sight.

## Getting the beta

On the home page, scroll to the download buttons and click the "Looking for the beta?" link underneath them. That puts you on the beta channel and shows you the latest beta builds for Mac, Linux (flatpak), and Windows. All three.

Free for public repos. Private repos need a Pro subscription, which you can set up from your account dashboard.

A couple of things to know going in.

- Beta builds break things. That's the deal.
- We may reset the app data directory between releases. That clears your settings and your sign-in, you'll need to log in again. We try not to do it for fun but it happens.
- File issues at the [community repo](https://github.com/octopunkio/community). Bugs, feature requests, just saying hi, all welcome.

## What this is, and what it is not

Octopunk is not a `git` GUI. There are great ones already, and you should be using one. `lazygit`, `tower`, `fork` are purpose-built tools that do git better than any "GitHub client" ever will. Interactive rebase, conflict editing, blame surfing, hunk-by-hunk staging, the works. Use them.

Octopunk is geared for developers who treat git and GitHub as separate things. Git is the version-control tool. GitHub is the collaboration platform on top of it. We don't try to be both. Use your favorite git tool when you're shaping commits and branches. Use Octopunk when you're working with the platform: reviewing PRs, triaging notifications, navigating issues, watching CI. The two coexist. That's the point.

## Who we are: the punk in Octopunk

Let's close this out with who we are as a software company.

We're a small team, tired in the specific way that comes from a decade-plus of tech-hype cycles. Crypto, NFTs, web3, the metaverse, agents-as-a-service, every other startup pitched as the future of [everything]. We sat through all of it. None of it changed how anyone we know fundamentally does their job.

No dark patterns. Octopunk doesn't nag, doesn't sell your data, doesn't ask for information it doesn't need. Sign in once with GitHub, that's the deal. We collect what we need to keep the lights on and nothing else. No engagement metrics dressed up as features, no "growth tactics" that exist to make a chart go up at your expense.

Yes, we have AI. It's in the middle of its own hype cycle and the hot air is impressive. It's also genuinely useful in a few specific places, like understanding a sprawling PR you've never seen or summarizing a thread you don't have time to read. Those are the places we put it. No agents looping in the background, no "AI-first" rebrand, no charging extra for it. Bring your own key, use it when it helps, ignore it when it doesn't.

The punk in Octopunk is the part that says no to all of the above.

## Already using the beta?

Tell us what's broken. Tell us what's missing. Tell us what's slightly annoying. Beta input is the most useful thing we have right now, and we built the filing workflow into Octopunk so the friction is as close to zero as we could make it.

From inside the app, open the command palette and run :command[report-a-bug] to file a bug. Or :command[suggest-a-feature] to pitch one you want us to build. Both land in our community repo. Both get read.

We've been using Octopunk full-time to build Octopunk for a while now. It is good enough that the browser tab habit is finally breaking. The beta is for everyone else who is sick of the tab graveyard.

Go grab it.
