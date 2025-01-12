---
title: 'Brink Grant 2022'
image: '/ln/grant2022/brink.png'
created: 2022-11-01
updated: 2023-02-12
---

Starting to be interested in Bitcoin in 2018 while I was digging into
my bachelor's thesis. After one year I decided that working on the Bitcoin
ecosystem was what I want to do full-time.

So, interestingly I came across one of the Segregated Witness BIP and it was
at this point that I read the word _Lightning Network_, and then 4 years
later here I am.
I contribute for the first time in [core-lightning](https://corelightning.org/)
on Jul 25, 2020, and this was the moment when I stump into a very great
ecosystem full of people whom I can steal knowledge from.

With time I start to implement tooling around the ecosystem to try to solve
some of the problems that I had with core lightning, such as the possibility
to write plugins in different languages like [Java/Kotlin/Scala](https://github.com/clightning4j), [rust](https://github.com/laanwj/cln4rust), [golang](https://github.com/vincenzopalazzo/cln4go) and [dart](https://github.com/dart-lightning),
In addition, one of the difficulties as a master student with no much money was to run a real
a core lightning node on testnet and mainet with a very minimal amount of disk space, so
I created [btcli4j](https://github.com/clightning4j/btcli4j) to support the bitcoin pruning mode,
as well as the Rest API with esplora. Currently, [btcli4j](https://github.com/clightning4j/btcli4j) is
one of the most stable bitcoin backend alternatives for core lightning that can
provide [99.9% uptime](https://bruce.lnmetrics.info/metrics) and able to run core lightning in a 5 dollar server.

Therefore while I was implementing all my fancy toys for core lightning I
start to propose some improvements on the command line interface, and in the
plugin interface as well as fixing some issues around core lightning reported by
people, so in September 2021, I became the more active first-time contributor on
core lightning as well as the official maintainer of the opinionated but unique
Lightning BOLT Protocol Test Framework [lnprototest](https://github.com/rustyrussell/lnprototest)
developed by Rusty Russell.

In November 2022, I became a full-time grantee at Brink
(which supports already my development from January 2021 as a part-time grantee)
to work full-time on core lightning (and lnprototest) and [open ln metrics](https://github.com/LNOpenMetrics)
research that is my attempt to build tooling and start a standardization process
in order to collect metrics on a real lightning network environment in order to provide
realistic number estimated on the real node and provide data to researchers and
universities in order to join us to improve the lightning network protocol.

In addition, the brink grant give me the time to implement my vision of of a
new core lightning plugin manager that is [coffee](https://github.com/coffee-tools)
that will try to solve a couple of issue that we had around the core lightning
plugins ecosystem.

As all this can sound a lot of stuff, I'm hoping that all this hard work is
just the beginning and at the end of my lnmetrics research I would like to
work more closely to the development of the lightning network protocol by
implementing some of the already proposed feature such as [trampoline](https://lists.linuxfoundation.org/pipermail/lightning-dev/2019-August/002100.html)
and/or implementing the solution of the jamming attack in core lightning, as
well as reimplementing [lnprototest](https://github.com/rustyrussell/lnprototest) with the
needs that the ecosystem to support all the implementation that wants to be spec compliant.

Follow [Brink](https://twitter.com/bitcoinbrink) and [subscribe to the newsletter](https://dev.us7.list-manage.com/subscribe/post?u=51fa227f2f3d1d13916156e4f&id=d139d52c54)
for updates, and follow me on [GitHub](https://github.com/vincenzopalazzo) to track my progress!
