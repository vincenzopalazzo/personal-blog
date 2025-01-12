---
title: 'Introduction to lnprototest: What Is It and Why Does It Matter?'
created: 2024-09-15
updated: 2024-09-25
---

Today, I’m kicking off a series of blog posts to introduce one of the projects I maintain: [lnprototest](https://github.com/rustyrussell/lnprototest).

I believe now is a great time to spotlight this project because the Lightning Network is rapidly evolving, with many new features being introduced. These updates have the potential to create regressions and affect interoperability between nodes.

More importantly, every Lightning node must ensure compliance with the protocol specifications before upgrading to a new version. Otherwise, we could see forced channel closures across the network—something nobody wants, right?

### How lnprototest Works

As of September 15th, lnprototest is a Python library capable of communicating via BOLT8, allowing it to establish connections and send noise messages to another peer. Pretty straightforward, right?

To work with lnprototest, a Lightning implementation needs to develop a `Runner` in Python. This `Runner` interacts with lnprototest's workflow, essentially acting as a bridge between the test framework and the Lightning node.

### What lnprototest Tests Look Like Today

If you're curious about how lnprototest integrates with `pytest`, check out the [lampo](https://github.com/vincenzopalazzo/lampo.rs/tree/main/tests/lnprototest) project, where you can see it in action.

Here's a simple test to give you an idea of how it works:

```python
def test_on_simple_init(runner: Runner, namespaceoverride: Any) -> None:
    """
    Send from the runner to ldk a fist `init` connection
    as specified in the BOL1
    """
    namespaceoverride(bolt1.namespace)
    test = [
        Connect(connprivkey="03"),
        ExpectMsg("init"),
        Msg("init", globalfeatures="", features=""),
        # optionally disconnect that first one
        TryAll([], Disconnect()),
        Connect(connprivkey="02"),
        # You should always handle us echoing your own features back!
        ExpectMsg("init"),
        Msg("init", globalfeatures="", features=""),
    ]

    run_runner(runner, test)
```

How it is possible the `run_runner` take in input a running interface, that in the case of lampo is a [`LampoRunner`](https://github.com/vincenzopalazzo/lampo.rs/blob/main/tests/lnprototest/lampo_lnprototest/runner.py) but can be any, like a ldk-node or a core lightning one.


### lnprototest problems

The main challenge with this approach is that you need to adopt Python within your codebase and run it in your CI environment. While this isn’t a huge problem by itself, it’s not exactly user-friendly, and certain communities have strong opinions about incorporating specific languages. For example, take a look at the [ongoing discussion in the Linux kernel community regarding Rust](https://www.phoronix.com/news/Rust-Linux-Maintainer-Step-Down) or check out [this short video](https://youtu.be/WiPp9YEBV0Q?t=1529) to see some of the sentiments around this issue.

### lnprototest as a library

When lnprototest was released in 2019, it was a monolithic application that contained everything within its repository. However, as the Lightning Network has grown and introduced optional features, defined in [BLIPs](https://github.com/lightning/blips), maintaining a large monolithic codebase has become less efficient.

In response to this, lnprototest has evolved into a library that can be imported, allowing anyone to write their own runners and tests outside the main repository.

For example, let’s say Matt proposes [BLIP 32](https://github.com/lightning/blips/blob/master/blip-0032.md) (Onion Message DNS Resolution), and LDK provides a reference implementation. It would be a good practice for LDK to create tests ensuring this feature works as expected across the network by writing test cases with lnprototest.

In this case, the LDK team would follow these steps:

- Importanting the [lnprototest library inside a new project](https://pypi.org/project/lnprototest/)
- Developing a ldk runner like library. See the [lampo runner](https://pypi.org/project/lampo-lnprototest/) as an example
- Implementing tests to support the BLIP 32
- Run the tests.

Here, LDK keeps the tests within its own codebase, avoiding the need to add code to the lnprototest repository that might not be relevant to other implementations. However, if LDK releases the runner library as a package, the lnprototest repository can include a CI job to download the LDK runner and run the pre-existing tests without any additional setup.

This approach benefits everyone. For example, when a new implementation develops its own runner, LDK can run interoperability tests with different runners by simply running the BLIP 32 tests.

### Conclusion

In this post, we’ve discussed the current state of lnprototest and one of its recent features: allowing implementations to create out-of-tree `Runner`.

In the next post in this series, we’ll explore the steps required to support a new implementation in lnprototest using the lnprototest library.