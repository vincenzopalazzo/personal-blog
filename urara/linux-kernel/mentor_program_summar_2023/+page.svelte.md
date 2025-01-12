---
title: 'My Journey as a Software Engineer Mentee in a Linux Kernel Mentoring Program'
image: '/linux-kernel/kernel.jpg'
created: 2023-09-03
updated: 2023-09-03
tags:
  - 'Linux Kernel'
  - 'Rust for Linux'
---

In this blog post, I will delve into my experiences within the Linux Kernel mentoring program and recount the strides I made throughout this journey.

## Why I Chose this Mentoring Program

While contributing to the Rust compiler, I stumbled upon [Josh Triplett](https://joshtriplett.org/) involvement in 'Rust for Linux' and, more broadly, the Linux kernel itself.

As a child, I was always fascinated by the Linux kernel, but my English proficiency held me back from diving in. Now, as an adult, I felt the timing was just right to immerse myself in the Linux kernel. Consequently, I decided to contribute to the Rust for Linux project.

Yet, despite my enthusiasm, my Achilles heel was hardware. Recognizing my expertise in C, I surmised that acquainting myself with the C aspect of the kernel could be a sensible starting point. As I delved deeper, my inexperience posed challenges. This led me to discover the Linux Kernel Patch mentoring program, to which I promptly applied.

## Setting My Goals

The driving force behind my application was to familiarize myself with the Linux Kernel workflow. I believed that absorbing knowledge from those wiser than me would augment my skills as a Software Engineer.

I had previously reviewed the Rust code being incorporated into the Linux kernel from the Linux subsystem. Moreover, I had the privilege of guiding certain design aspects concerning problems within the Rust susystem, particularly those tied to Rust macros.

Thus, my ultimate aim for this mentorship was to venture into the C domain of the kernel, understanding the nuances of working on and testing it. This would bolster my confidence when contributing to the Rust subsystem.

Furthermore, I had established contact with the maintainer of Manjaro ARM images. Being a user of Manjaro on ARM, I seized the opportunity to assist the Manjaro team in upstreaming, or at the very least, discussing with the kernel mainline certain patches applied by Manjaro's CI during the image-building phase.

Admittedly, my goals were lofty, but the journey and its culmination were worth exploring.

## What I Achieved

During my onboarding with the codebase, I submitted several PRs which helped me quickly get up to speed with pushing code to the kernel. Currently, I have the following patches merged:

```
d87e89c2735772fbed933be0d19e032c1910a51f x86/irq/i8259: Fix kernel-doc annotation warning
1fffe7a34c89b12b58f88b280bc10ce034477c3a script: modpost: emit a warning when the description is missing
1c5f054f0b12875096e339861c7f44a7c952ce56 rust: build: Fix grep warning
ad4bf5f2406f6a2e29266bbad74e18f0d955ac4c net: socket: suppress unused warning
02c1820345e795148e6b497ef85090915401698e usb: dwc3: Fix a typo in field name
```

I also engaged in insightful discussions regarding some intricate bugs in ARM. The full discussion can be read [here](https://lore.kernel.org/all/20230509153912.515218-1-vincenzopalazzodev@gmail.com/).

Moreover, I discovered a bug concerning my display and the Linux kernel version 6.3 and above. Although I haven't addressed it yet, I was able to reproduce the issue. You can view the details on my [issue tracker](https://git.hedwing.dev/vincenzopalazzo/linux/issues/12).

While discussing long-term contributions with Skhan, I was assigned the task of running cyclic tests on an ARM device and reporting a comparison of the results between the mainline kernel and the rt-kernel. The results haven't been posted to the mainline list yet, but they'll be available soon.

To cap it off, I will be attending the Rust for Linux Kernel Summit, where I'll discuss a project I'm currently working on named [kproc-macros](https://github.com/rsmicro/kproc-macros). I'll be sharing my insights on why integrating it directly into the kernel could be beneficial over leveraging user space libraries.

You can see all my contributions on the [Linux kernel mailing list](https://lore.kernel.org/all/?q=vincenzopalazzodev@gmail.com).

## Conclusion

Embarking on the journey of kernel development is no simple feat, yet it's been an enlightening experience. From familiarizing myself with the intricate codebase, actively participating in bug discussions, and submitting patches to spotting bugs, every step has been a learning curve.

My forthcoming appearance at the Rust for Linux Kernel Summit, coupled with my ongoing project [kproc-macros](https://github.com/rsmicro/kproc-macros), underpins my commitment and enthusiasm towards enhancing the Linux Kernel ecosystem. As I continue to delve deeper, my aim remains not just to contribute but also to drive innovation.
