---
title: AI Assistant
order: 6
---

# AI Assistant

OctoPunk has an embedded AI assistant that will readily help explain issues,
pull requests, review code, open issues, and more.

The AI assistant can be opened with :command[open-ai-panel].

By holding :key[ALT] and clicking on an object you will make the AI aware of what
you are focusing on. From there you are able to ask it specific questions.

When there is no selection the AI assistant will evaluate the entire page as
context, still fulfilling your request intelligently.

<video src="/screens/ai-assistant.processed.mp4" controls autoplay muted loop playsinline></video>

## Configuration

OctoPunk's AI assistant allows you to use the AI provider of your choice.

The currently supported set of AI backends is

- Anthropic
- Google Gemini (coming soon)
- OpenAI (coming soon)

You must supply an API key from :command[global-settings] before the AI
assistant can respond to a prompt.

Once the API key is applied and validated a model can be selected.

<img src="/screens/ai-assistant-api-key.png"></img>

## Tools

The AI assistant has tools for performing code reviews, helping craft comments,
cloning code for better analysis and more.

We are constantly improving the capabilities of OctoPunk's AI assistant.
The best way to understand its capabilities is to prompt it with your tasks.
