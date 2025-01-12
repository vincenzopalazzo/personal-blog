---
title: 'Write an Async Runtime: Basic Concept'
image: '/async-rust/async-rust.svg'
created: 2022-10-27
updated: 2022-10-27
tags:
  - 'Rust Lang'
  - 'Async Rust'
---

In this blog post we will talk about the basic concept that
are around an async runtime in rust, and also the basic concept
of the async paradigm.

Let's get started 🦀

## Introduction

Before getting started to design our async runtime for rust, we should make clear the definition of async programming,
and I like to think of the async paradigm as a way to optimize a program
to waste less time in dead running periods like when you are reading a file or some
data from the socket.

But this is just what my mind has picked as a definition, maybe because for me this
side of async programming is fascinating. However, the chapter _Why Async?_ of the
[async rust book](https://rust-lang.github.io/async-book/01_getting_started/02_why_async.html)
is pretty completed, I will quote part of it there.

> Asynchronous programming, or async for short, is a concurrent programming model supported by an increasing number of programming languages. It lets you run a large number of concurrent tasks on a small number of OS threads while preserving much of the look and feel of ordinary synchronous programming, through the async/await syntax.

Well, why I'm writing this blog series on async rust and async runtime?

I was always a monkey user of async programming in JavaScript and in Dart, but I never
pay attention much to it! When I start to learn rust and use it heavily in my projects
I came across the rust async dilemma that is to choose a runtime to work with when
you want to use async programming, and this dilemma blue my mind 🤓. So this was the
moment when I start to remember that my master's was in designing a programming language,
and this was the perfect moment to test if my exam teach me something useful!

## Why there are so many async runtimes?

Knowing the answer to this question can clarify a lot of misconceptions about rust async programming.
The reason is not that the rust developers are lazy and want that the community will implement one for
them, but because when you are designing a language like Rust, you know
that a wrong decision that will begin stable in the language is forever!

However, this is not the reason to not having a runtime in rust, or official support to run
rust async code in the rust language, but the problem is to define if the rust compiler needs
a default runtime.

One of the main problems at the moment is migrating code written for a runtime like [Tokio](https://tokio.rs/) to
another runtime such [async-std](https://github.com/async-rs/async-std) is painful, mainly because the async
support in the rust language is minimal and this force the async runtime developer to implement
what they need in a custom way.

The problem with this approach is that an application that uses tokio runtime, required also
some API provided by the runtime itself that make the application coupled and difficult to migrate
to another runtime.

So, the main problem in the async programming in rust is divided into two parts, one is the fragmentation
of the many runtimes available across the ecosystem, and the second one is the choice of the runtime
will force other users to depend on it.

To solve this problem the [async-wg](https://rust-lang.github.io/wg-async/welcome.html) is working on a very
good road map that is available [here](https://rust-lang.github.io/wg-async/vision/roadmap.html).

## Requirements to run async code

In this section of the article, we will focus on what are the concept required to run an async code, and we will
introduce some code that will be available on [toy-async-rust](https://codeberg.org/vincenzopalazzo/toy-async-rust) Codeberg repository
to make the reader able to run and play with it.

Let's begin to analyze the previous chapter and some of the terminology use in it, such as _Task_, in fact
what is a Task?

To start simple, a task is a piece of code that the runtime run for us. Now the question is why we need to provide
a peace of code to the runtime, and the runtime will run it? Why we can not run it directly?

Good question! This is the part that I love about the async runtime, with the task the async runtime is able to organize
the running of different tasks in a concurrent way, by simple stop the execution while there is a long operation
where the current thread is not doing much, and move the context to another more prolific task.

So, now let's look to some real code of [rio](https://github.com/vincenzopalazzo/rio) runtime that implements the task,
and let's analyze it.

We can simply define a task like this:

```rust
type PinFuture = Mutex<Pin<Box<dyn Future<Output = ()> + Send + 'static>>>;

pub struct Task {
    /// This is the actual `Future` we will poll inside of a `Task`. We `Box`
    /// and `Pin` the `Future` when we create a task so that we don't need
    /// to worry about pinning or more complicated things in the runtime.
    future: PinFuture,
    /// We need a way to check if the runtime should block on this task and
    /// so we use a boolean here to check that!
    block: bool,
    // The waker is a self reference of the stack but if it is
    // not None, this mean that it is already been pool
    waker: Option<Arc<Waker>>,
}
```

While reading the Task definition we can note some other basic concepts of async rust, such as
`Waker` and `Future`. In fact, these are two types provided by the rust standard library, and they implements
the following concepts:

- `Future`: You may know this concept from JavaScript under the name Promise, and it is a way to say "Ehi we will return something in the future!"
  (or I promise you to return something in the future). This `Future` is a type where you can call `.await` on it.
- `Waker`: in my opinion, this concept is the more obscure concept, not because it is difficult but because I did not find any 101 docs
  that explains this concept other than the [async rust book](https://rust-lang.github.io/async-book/02_execution/03_wakeups.html).
  The `Waker` concept is where the magic happens, when a future is not completed (See next section) the `Waker` implement
  the logic to wake up the Task because there is more job to do.

## Future and Waker magic

The moment that I understand async programming while I was implementing [rio](https://github.com/vincenzopalazzo/rio) was when
I implement the `Task` and understand how to use the `Waker` trait.

However, before the deep dive into why we need a `Waker` we need to deep dive inside the `Future` concept, and
as introduced before I would like to think of the `Future` as a contract between the programmer and the language
where the programmer gives the possibility to run the code in an async way and the language promise to return something
in the future.

Let's see the following code to clarify a little bit the concept that the `Future` implement.

```rust
#![feature(async_fn_in_trait)]
#![feature(associated_type_defaults)]
use surf;
use log::{debug, info};
use rio_rt::runitime as rio;

/// Make an async http request to Github API and return the result.
async fn ping_github(&self) -> Result<String, surf::Error> {
    debug!("Running the https request");
    let mut res = surf::get("https://api.github.com/octocat").await?;
    let body = res.body_string().await?;
    info!("{}", body);
    Ok(body)
}


fn main() {
    env_logger::init();

    // Hey rio, run this function in an async way and
    // print the result
    rio::block_on(async move {
        let res = ping_github().await?;
        // print the option value
        println!("{:?}", res);
    });

    rio::wait();
}
```

In this case, the async runtime call `ping_github` function runs an async http request,
and in this case, the http request can take time to return the response. Therefore,
the async runtime can stop the `ping_github` task while it is waiting for the server and
try to run something else.

So, now the question is "How does the async runtime know that the server is taking time to answer the request?"
The answer is given by the `Future`, in fact, the runtime run the future, and in this case, the operation is
called `poll`, where the function returns two kinds of results:

- `Poll::Ready(_)`: is returned when the async function is completed and the result is ready;
- `Poll::Pending`: is returned when the async function is still waiting to complete the operation,
  where in this case is making the HTTP request.

You can imagine a `Future` implementation as follows:

```rust
use std::future::Future;
use std::pin::Pin;
use std::task::{Context, Poll};
use std::time::SystemTime;

/// Future sleep function
pub struct Sleep {
    /// When the future is created
    now: SystemTime,
    /// Waiting time specified by the user.
    waiting_ms: u128,
}

/// Plain Sleep impl.
impl Sleep {
    pub fn new(ms: u128) -> Self {
        Sleep {
            now: SystemTime::now(),
            waiting_ms: ms,
        }
    }
}

impl Future for Sleep {
    type Output = ();

    fn poll(self: Pin<&mut Self>, _cx: &mut Context<'_>) -> Poll<Self::Output> {
        if self.now.elapsed().unwrap().as_millis() >= self.waiting_ms {
            Poll::Ready(())
        } else {
            Poll::Pending
        }
    }
}
```

Now, that we know how the runtime knows the status of an async request, the other question is
"How does the runtime manage a future result?" and the answer to this question is through the `Waker` trait.

In fact, we said before that the `Waker` trait is the mechanism that rust uses to notify the runtime that
the task has some other work to do.

Now, In our `Task` implementation we need to define the implementation for the `Waker` trait with the following code:

```rust
impl Wake for Task {
    fn wake(self: Arc<Self>) {
        if self.is_blocking() {
            Runtime::get().inner_spawn_blocking(self);
        } else {
            Runtime::get().inner_spawn(self);
        }
    }
}
```

Where in this case the `wake` method will `spawn` the task again with some internal API of the runtime. We will
analyze the Runtime implementation in detail in the next [Blog post](). But for now, we need just to know
the `wake` function `spawn` again the task.

Now, we need to define only the Task interface, but it is simple, the task needs to have an implementation of the
`poll` function that simulates the `Future` behavior by returning `Poll::Ready(_)` or `Poll::Pending`.

The [rio](https://github.com/vincenzopalazzo/rio) Task implementation is the following one:

```rust
impl Task {
    pub(crate) fn new(block: bool, future: impl Future<Output = ()> + Send + 'static) -> Arc<Self> {
        Runtime::get().size.fetch_add(1, Ordering::Relaxed);
        Arc::new(Task {
            future: Mutex::new(Box::pin(future)),
            block,
            waker: None,
        })
    }

    /// Poll the following task!
    pub fn poll(self: &Arc<Self>) -> Poll<()> {
        // If the waker exist there is no need to
        // poll a new waker, this feature is already in the background
        if let None = self.waker {
            let waker = self.waker();
            let mut ctx = Context::from_waker(&waker);
            // FIXME: this is the good place where to remove the element
            // from the queue?
            self.future.lock().unwrap().as_mut().poll(&mut ctx)
        } else {
            Poll::Pending
        }
    }

    pub fn waker(self: &Arc<Self>) -> Waker {
        self.clone().into()
    }

    /// The Task is blocking.
    pub fn is_blocking(&self) -> bool {
        self.block
    }
}
```

This implementation of Task in Rio can be improved, and we will try to improve it later in the blogs series,
but for now we need just to know that to pool a `Future` we need to get a `Context` from a `Waker`.

In addition, before end this blog post, I left with a question that is:

> Is it possible improve the poll method and avoid to store the waker inside the task? or this is necessary.

If you know the answer, and the rio runtime still has the current implementation, you can submit a PR
that improve it and add the motivation inside the PR description and commit body!

### Final Thought

Our actual implementation of the Task is a very simple one, but this implementation gives the
flavor of some important core concept of async programming in rust. However,
we still do not have an answer to questions like:

- Why we do not have async runtime support in rust?
- Why these async apis are not implemented inside the rust standard library?

To answer this question we need to analyze how to implement the runtime API, and as a small
spoiler the runtime can be implementation specific, and we will make many opinionated choices.

### Credits

TODO
