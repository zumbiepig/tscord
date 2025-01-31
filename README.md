<p align="center">
    <img height="450" src="https://github.com/user-attachments/assets/29813885-469c-4601-a4e7-3bc0296c3781"></img>
</p>

<div align="center">

[![Latest version](https://img.shields.io/github/v/release/barthofu/tscord?color=4b38ff&label=latest%20version&logo=github&logoColor=white&colorA=4b38ff&style=flat)](https://github.com/barthofu/tscord/releases/latest)

[![Build state](https://img.shields.io/github/actions/workflow/status/barthofu/tscord/build.yml?branch=main&colorB=4b38ff&colorA=4b38ff&style=flat)](https://github.com/barthofu/tscord/actions/workflows/build.yml)
![Repo size](https://img.shields.io/github/repo-size/barthofu/tscord?colorB=4b38ff&colorA=4b38ff&style=flat)
![Stars count](https://img.shields.io/github/stars/barthofu/tscord?colorB=4b38ff&colorA=4b38ff&style=flat)

[![Crowdin](https://badges.crowdin.net/tscord/localized.svg)](https://crowdin.com/project/tscord)

<table>
  <tr>
    <td align="center">

# What is TSCord

#### **TSCord** is a fully-featured **[discord bot](https://discord.com/developers/docs/quick-start/overview-of-apps)** _template_ written in [Typescript](https://www.typescriptlang.org/), intended to provide a framework that's easy to use, extend and modify.

It uses [`discordx`](https://github.com/discordx-ts/discordx) and [`discord.js v14`](https://github.com/discordjs/discord.js) under the hood to simplify the development of discord bots.

This template was created to give developers a starting point for new Discord bots, so that much of the initial setup can be avoided and developers can instead focus on meaningful bot features. Developers can simply follow the [installation](https://tscord.bartho.dev/docs/bot/get-started/installation) and the [configuration](https://tscord.bartho.dev/docs/bot/get-started/configuration) instructions, and have a working bot with many boilerplate features already included!

</td>

  </tr>
</table>

<table>
<tr>
<td align="center">

Getting started is as easy as one command

```bash
npx tscord init bot my-bot
```

**[To know how to use TSCord and all its components, check the documentation here](https://tscord.bartho.dev/)** ㅤ

</td>
</tr>
</table>

_But TSCord is not only a Discord bot template..._

<table>
<tr>
<td align="center" width="50%">

### [Dashboard](https://github.com/barthofu/tscord-dashboard)

A ready-to-use fancy dashboard for your TSCord bot

<img src="https://github.com/user-attachments/assets/2d0ac860-64d4-4beb-8b3c-d633e04c5ba4"></img>

</td>
<td align="center">

### [Website](https://github.com/barthofu/tscord-website)

Customizable static homepage for your TSCord-based bot

https://github.com/user-attachments/assets/d3e4d01a-60a6-4787-9b06-8c6d4aa32c37

</td>
</tr>
<tr></tr>
<tr>
<td align="center">

### [CLI](https://github.com/barthofu/tscord-cli)

Really useful CLI meant to initialize a new TSCord project, generate files by type or even manage plugins

https://github.com/user-attachments/assets/c97c172c-dbcb-4717-94dc-c25f6efff459

</td>
<td align="center">

### [Plugins](https://github.com/barthofu/tscord-plugins)

Fully extensible thanks to the plugin ecosystem

<img width="50%" src="https://github.com/user-attachments/assets/bc182248-0d8d-4ace-a230-a0a9f41e45f0"></img>

</td>
</tr>
</table>
</div>

<br>

<div align="center">
    <a href="https://discord.gg/GsYF4xceZZ" target="_blank">
        <img width="17.5%" src="https://github.com/user-attachments/assets/e8a9f890-42b1-447c-b80c-5770ecb5b463"></img>
    </a>
</div>

## 📜 Features

Talking about features, here are some of the core features of the template:

- Advanced **handlers** for:
  - Interactions (slash, context menu, button, modal, select menu, etc)
  - Simple message commands
  - Discord events listeners
- **Guards** functions, acting like middlewares on handlers with some built-ins:
  - Rate limiter
  - Maintenance mode
  - Disabling command
  - Guild only command (no DMs)
  - NSFW only command
  - Message's content match using regex
- Internal **API** to interact with the bot from external services, with built-in useful endpoints
- Multiple **databases** support out-of-the-box using [Mikro-ORM](https://github.com/mikro-orm/mikro-orm)
- **Migrations** system to keep a safe database
- **Custom events** handlers
- Advanced **error handler**
- Fully-typed **localization** (i18n)
- Local **store** to manage global state through the app
- Advanced **logger** with log files and discord channels support
- **Scheduler** for cron jobs
- Built-in rich **statistics** system
- Automatic **static assets upload** to [imgur](https://imgur.com/)

This template is also developer friendly and follow strict design patterns to ease its maintenance:

- Written in **Typescript**
- Built around the **Dependency Injection** and **Singleton** patterns
- **HMR** on events and commands for a faster development
- Use of battle-tested **libraries** under the hood (_discordx_ and _discord.js_)
- **Linting** and **formatting** thanks to a top-notch ESLint config
- Typesafe and validated **environment variables**
- Built-in **debugging** setup for VSCode
- Support for running with the **[PM2](https://github.com/Unitech/pm2)** process manger
- Support for running with **[Docker](https://www.docker.com/)**
- CI/CD integration with **Github Actions**

_and many more!_

## 📚 Documentation

### Check the [**official documentation**](https://tscord.bartho.dev/) to get started and understand how to use this template.

You can also find useful documentations at:

- [Discord's developer portal](https://discord.com/developers/docs)
- [discord.js documentation](https://discord.js.org/docs)
- [discord.js Guide](https://discordjs.guide/)
- [discordx documentation](https://discordx.js.org/docs/discordx/)

## 📢 Support

If you need support on the template or just want to exchange with us, don't hesitate to join the **[official Discord support server](https://discord.gg/GsYF4xceZZ)**!

## Roadmap

[Click here](https://github.com/barthofu/tscord/milestones) to access the milestone roadmap.

## 📑 License

MIT License

Copyright (c) 2025 Bartholomé Gili
