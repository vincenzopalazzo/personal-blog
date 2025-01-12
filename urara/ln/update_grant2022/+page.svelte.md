---
title: 'Brink Grant 2022 - 2023 Update'
image: '/ln/grant2022/brink.png'
created: 2023-04-01
updated: 2023-04-01
---

Here we are 4 months later since my full-time grant with brink started, so in this blog post, we try to make a short summary of all my progress.

If you want to know a general overview of what I'm working on I think my [introduction blog post](https://blog.hedwing.dev/ln/grant2022/) is the good one to read before diffing into this one.

## Core Lightning and lnprototest

My core lightning contribution is growing during this time, and now I'm the 8th contributor with more changes in core lightning, and this in just less than 1 year. My current workaround core lightning other than pull request review and issue triage (and bug fixing) is to improve the RPC interface in order to improve the performance for high data plugins like [lnmetrics.reporter](https://github.com/LNOpenMetrics/go-lnmetrics.reporter) (that we describe later)

In addition, in the last months, I put a lot of effort to fix some bugs that we had in [lnprototest](https://github.com/rustyrussell/lnprototest) and to reintegrate it back inside the core lightning CI.

### Lightning Network protocol interoperability with lnprototest

[lnptorotest](https://github.com/rustyrussell/lnprototest) is an opinionated Lightning BOLT Protocol Test Framework developed by Rusty Russell (and I'm the official maintainer of it) that point to provide a test framework for a lightning network implementation such as core lightning.

In particular, with lnprototest it is the possible to test at the protocol level if an implementation behave correctly in the different use case, by allowing the developers to test more tricky cases and try to avoid regression during the development life cycle (and avoid potential incompatibility across implementations)

As this may sound great (maybe because it is), lnprototest is in its infancy and the are many problems that need to be solved, such as the integration with a new implementation or the possibility to write tests in a more light way. However, finding the problem and how they pop up during the usage of a framework is what we want and also what allows us to understand better the problem and to improve in future releases.

Therefore, lnprototest is helping us already to find some of the weakness of our test protocol architecture and as time pass we have always more idea on how to improve it. We may end up at the point to rewrite it and to simplify the code and its usage of it.

However, before starting to rewrite it from scratch I would like to continue to spend some time in write integration tests for core lightning with the hope that also other implementations came to share the difficulties that they have during their usage of it.

## Open Lightning Network Reseach (aka lnmetrics)

While I was trying to work around the lightning network specification and try to understand why we need a specific solution for a problem in the network I feel the necessity to collect some data in order to understand the problem. Also when I start my node I faced a problem where I was not able to find and judge a node which to open a channel with.

Therefore, in order to answer my own question I start to implement a core lightning plugin that is able to collect some data in my local system and help me judge my decision long the way.

However, around the same period the [lightning terminal](https://terminal.lightning.engineering/#/) came out and some people get confused about the scoring function used. So, I thought that join the idea of what preceded in the [lightning terminal](https://terminal.lightning.engineering/#/) and define the metrics/scoring function in a [open source RFC](https://github.com/LNOpenMetrics/lnmetrics.rfc) in a cross implementation way (where the implementation collect the own metrics on the local view of the network) could be a good thing to do around the lightning ecosystem and also it was what I was looking for to improve my data collection algorithm.

The current status of the lnmetrics tools is quite ready for a public beta, and the lnmetrics ecosystem is composed of the following parts:

- [lnmetrics RFC](https://github.com/LNOpenMetrics/lnmetrics.rfc): List of metrics defined as input and output data. It is not pointed to have standard metrics for one problem but more to have the definition of a metric where work together to improve the end goal for everyone.
- [lnmetrics.reporter](https://github.com/LNOpenMetrics/go-lnmetrics.reporter): a client tool that points to run with the lightning node and collects the metrics in an offline and online way. The online way is a way to report the data in a centralized (but not single) server where analyze the data collected, where the end goal user are the developers. For now, only core lightning is supported but with the [cln4go](https://github.com/vincenzopalazzo/cln4go) tool (described in the previous introductory blog post) it is easy to support more implementations.
- [lnmetrics.server](https://github.com/LNOpenMetrics/lnmetrics.server): A light way server that is able to receive the metrics from the report and exported via graphql API.
- A website is under design, and I hope to release also a simple UI to plag on top of the server https://api.lnmetrics.info
- Some analysis tools that are able to query the API
- API library written in different languages, for the moment there is a python library https://github.com/LNOpenMetrics/py-lnmetrics.api

## Core lightning tools

In the last year, I started to think of a way to standardize some processes that we had around core lightning, like installing a plugin or developing a plugin from scratch.

Currently, the installation and development of a plugin are a
language dependent and this makes a little bit difficult a new user
to understand what is required to run a plugin and for a new developer to change language because it is required to change also the API that is required to write a plugin.

So my attempt to standardize this process is to develop a family of libraries under the name _cln4\*_ that try to unify the API required to write a plugin in any language. Currently language such as [Java/Kotlin/Scala](https://github.com/clightning4j), [rust](https://github.com/laanwj/cln4rust), [golang](https://github.com/vincenzopalazzo/cln4go) and [dart](https://github.com/dart-lightning/lndart.cln) are supported.

In addition, to make life easy for the end user to start to use a plugin, I draft my idea of a plugin manager for core lightning called [coffee](https://github.com/coffee-tools/coffee), it is a reworking idea of the previous reckless plugin manager with some good new feature.

My end goal with it is to unify the plugin usage under a simple command and also make the integration of dynamic plugins inside tools like web UI or mobile apps.

Therefore, I will end up in a full prototype by the end of the summer but some basic functions are already provided, such as installing a plugin

```bash
git clone https://github.com/coffee-tools/coffee.git && cd coffee
cargo run -- setup /home/alice/.lightning
cargo run -- remote add lightningd https://github.com/lightningd/plugins.git
cargo run -- install btcli4j
```

In conclusion, this plugin manager will we also a helper tool for core lightning developers to start from scratch the development of a new plugin by having the analogous of `cargo new <project name>` we can have something like `coffee --lang dart new <plugin name>`

## Thought for the future

As far as I see the end of my grant year is still far from now, but I think also that this is the perfect time to think about what to do next, and my idea for the future is to use what I developed during my current grant to improve the lightning network at the protocol layer.

In fact, with the metrics project, it is possible to develop and implement the Jamming solution that is proposed in [1] and see an evaluation of a real environment of the reputation system proposed.

However, there is also a lot of movement in the lightning network specification with the standardization of the dual funding proposal and BOLT 12 that brink some basic features inside the spec to allow to implement or at least start to work on the Trampoline Specification [2].

So, there is a lot of stuff where it is possible to work on and I hope I had the possibility to focus on these problems when the time comes

[1] https://github.com/ClaraShk/LNJamming
[2] https://github.com/lightning/bolts/pull/654
