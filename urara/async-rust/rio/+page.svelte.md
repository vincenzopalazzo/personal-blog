---
title: 'Rio: an experimental and minimal runtime'
image: '/async-rust/async-rust.svg'
created: 2022-10-25
updated: 2022-10-25
tags:
  - 'Rust Lang'
  - 'Async Rust'
---

If you are a fan of TV series I think you already got the analogy between
a runtime called _rio_ and the _async rust_. If not, you may need to take
some time to see the popular TV series [Money Heist](https://en.wikipedia.org/wiki/Money_Heist) 😆

However, I will spoil it, Rio a name a character in the tv series that is
fall in love with another character that it is called Tokio (you got the analogy, right?), in the async rust there is a popular runtime called [Tokio](https://tokio.rs) and I named my experimental runtime Rio because
Rio in the TV Serie is a Computer science Nerd and falls in love with Tokyo
that was a completely different person from him.

In fact, my [Rio runtime](https://github.com/vincenzopalazzo/rio) has a dream, to use all the new features of the rust compiler regarding async programming to be a minimal portable runtime,
instead, Tokio runtime is a little bit more limited on this side, in fact
if you run with Rio runtime a code depending on Tokio API you will
see the following stack trace

```
thread 'main' panicked at 'there is no reactor running, must be called from the context of Tokio runtime'
```

In fact, tokio API work only with the Tokio runtime.

However, I decided to start writing Rio not because I would like to solve
the async runtime fragmentation problem in Rust (well, maybe yes who knows 😆), but because I was new to the async programming concept, and
it was a place challenged enough to contribute to that attract me.

In fact, the proposal to write a small runtime is not from me, but from one
of the team member of the rust compiler [@eholk](https://blog.theincredibleholk.org) that is a great source of inspiration for me, and a source of learning.

In conclusion, [Rio](https://github.com/vincenzopalazzo/rio) is born as a hello async world async runtime with a big aspiration that is
to begin an experimental runtime for rust ecosystem - where you can find
the more recent proposal implemented as crates.

## Rio overview

Rio is available on GitHub at [https://github.com/vincenzopalazzo/rio](https://github.com/vincenzopalazzo/rio) and the architecture is divided into different sub crates, that are:

- [rio_rt](https://github.com/vincenzopalazzo/rio/tree/main/rt): Rio minimal async Runtime;
- [rio_io](https://github.com/vincenzopalazzo/rio/tree/main/io): Rio async IO from async IO portability proposal (in progress)
- [rio_lib](https://github.com/vincenzopalazzo/rio/tree/main/lib): Rio experimental standard library (in progress)

## Rio Design and Examples

The Rio API is really minimal, it contains just three procedure call, `block_on` and `spawn` and the most important is `wait` which allow waiting for the async execution
to terminate.

A daily example can be the following code

```rust
#![feature(async_fn_in_trait)]
#![feature(associated_type_defaults)]
use log::{debug, info};
use rio_rt::runitime as rio;
use surf;

pub(crate) mod extractor;
mod github;

use extractor::Extractor;

async fn run(extractor: &impl extractor::Extractor<Output = String>) -> Result<(), surf::Error> {
    let content = extractor.search_new().await?;
    info!("{}", content);
    Ok(())
}

fn main() {
    env_logger::init();
    debug!("Here we go, we are all good");

    let github = github::GithubExtractor::new();
    rio::block_on(async move {
        run(&github).await.unwrap();
    });

    rio::wait();
}
```

A complete example can be found at the [following link](https://github.com/vincenzopalazzo/rio/tree/main/examples/rio_triage_await)

## Rio into the Future

The future of rio is for sure experimental, but we also try to be a real runtime
where people can rely on to build real software but at the same time
keep the code base simple and easy to understand just a hello world application.

In conclusion, see [Build Rio from scratch](https://blog.hedwing.dev/async-rust/rio/write_runtime) to know how to implement your own
async runtime in rust, and to understand what are the challenges around the
async rust.

If you find interested in this blog post please consider sponsoring me through [Github Sponsor](https://github.com/sponsors/vincenzopalazzo), this
will help me to keep able to work with the async-wg and help in improving the async programming in rust.

## Credits

Thanks to [@eholk](https://blog.theincredibleholk.org) to review my blog post and give some feedback about the blog (he did not understand the analogy between rio and tokio, maybe it was not so funny :’) )

In addition, the [whorl](https://github.com/mgattozzi/whorl) was a great source of inspiration.
