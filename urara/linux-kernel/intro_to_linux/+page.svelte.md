---
title: 'Intro to Linux Kernel Hacking in Rust'
image: '/linux-kernel/kernel.jpg'
created: 2022-10-15
updated: 2022-10-15
tags:
  - 'Linux Kernel'
  - 'Rust for Linux'
---

I start to get involved in the [Rust-for-Linux](https://github.com/Rust-for-Linux) project, and one of the problem was that I did not know where to start, also because I was new to the kernel development, but at the same time I did not want spent to much time on the project without adding value to it. So in some sense I would like to contribute in something meaningful but that give me the possibility to learning other than struggling with the compiler errors.

So in order to achieve this goal I start to read the LDD3 book and translate some of the book chapters before in a reproducible C code that run inside the CI, and after that move the implementation to rust. All the code is available on [my codeberg repository](https://codeberg.org/vincenzopalazzo/linux-kernel-drivers)

This process give me the flexibility to understand the actual difficulties to write a kernel module in Rust and also to speed up my understanding of the kernel crates already developed in Rust.

So with this blog series I will try to describe my experience in this adventure through the following blog posts:

- 💬 Hello World module in Rust for the Linux Kernel;
- 💭 Scull Character module in Rust for the Linux Kernel;
- 💭 Async Programming in the Linux Kernel
- 💤 More idea will come!

## License

All the blog posts and the related code are released under the [following License](https://codeberg.org/vincenzopalazzo/linux-kernel-drivers/src/branch/main/hello_module_rust/LICENSE).
