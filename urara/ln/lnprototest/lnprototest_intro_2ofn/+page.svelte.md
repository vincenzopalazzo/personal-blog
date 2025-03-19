---
title: 'How to Support lnprototest in Your Favorite Implementation'
created: 2025-02-15
updated: 2025-02-27
---
## Introduction

In this blog post, we follow up on a previous article where we introduced lnprototest, explaining its general purpose and the importance of such a tool. If you haven't read it yet, I recommend reviewing it first for essential background information, available [here](https://blog.hedwig.sh/ln/lnprototest/lnprototest_intro_1ofn).

This series aims to delve deeper into lnprototest, providing detailed insights and building a comprehensive understanding of its functionality. Writing these posts also helps me articulate my thoughts and clarify my approach at the code level.

In this post, we outline the requirements for integrating lnprototest into the testing workflow of a Lightning Network implementation.

## Prerequisites for lnprototest Compatibility

As detailed previously, lnprototest requires each Lightning implementation to develop a Python-based `Runner`. This `Runner` serves as an interface between lnprototest's testing framework and the specific Lightning node's API, facilitating test execution.

However, before full compatibility, implementations must support injecting predefined secrets, crucial for predicting cryptographic keys in tests to ensure deterministic behavior.

Certain implementations, such as Core Lightning and Lampo, already provide mechanisms for injecting these secrets. For instance, Core Lightning allows this through command-line options, as shown below:

```bash=
lightningd --developer --dev-force-privkey=... --dev-force-bip32-seed=... --dev-force-channel-secrets=..
```

Similarly, for LDK-based implementations like Lampo, you may need to create a custom wrapper for the `SignerProvider` to facilitate key injection, with an example provided below:

```rust
pub struct LampoKeysManager {
    pub(crate) inner: KeysManager,

    funding_key: Option<SecretKey>,
    revocation_base_secret: Option<SecretKey>,
    payment_base_secret: Option<SecretKey>,
    delayed_payment_base_secret: Option<SecretKey>,
    htlc_base_secret: Option<SecretKey>,
    shachain_seed: Option<[u8; 32]>,
}

impl LampoKeysManager {
    pub fn new(seed: &[u8; 32], starting_time_secs: u64, starting_time_nanos: u32) -> Self {
        let inner = KeysManager::new(seed, starting_time_secs, starting_time_nanos);
        Self {
            inner,
            funding_key: None,
            revocation_base_secret: None,
            payment_base_secret: None,
            delayed_payment_base_secret: None,
            htlc_base_secret: None,
            shachain_seed: None,
        }
    }

    // FIXME: put this under a debug a feature flag like `unsafe_channel_keys`
    #[cfg(debug_assertions)]
    pub fn set_channels_keys(
        &mut self,
        funding_key: String,
        revocation_base_secret: String,
        payment_base_secret: String,
        delayed_payment_base_secret: String,
        htlc_base_secret: String,
        _shachain_seed: String,
    ) {
        use std::str::FromStr;

        self.funding_key = Some(SecretKey::from_str(&funding_key).unwrap());
        self.revocation_base_secret = Some(SecretKey::from_str(&revocation_base_secret).unwrap());
        self.payment_base_secret = Some(SecretKey::from_str(&payment_base_secret).unwrap());
        self.delayed_payment_base_secret =
            Some(SecretKey::from_str(&delayed_payment_base_secret).unwrap());
        self.htlc_base_secret = Some(SecretKey::from_str(&htlc_base_secret).unwrap());
        self.shachain_seed = Some(self.inner.get_secure_random_bytes())
    }
}

impl SignerProvider for LampoKeysManager {
    // FIXME: this should be the same of the inner
    type EcdsaSigner = InMemorySigner;

    fn derive_channel_signer(
        &self,
        channel_value_satoshis: u64,
        channel_keys_id: [u8; 32],
    ) -> Self::EcdsaSigner {
        if self.funding_key.is_some() {
            // FIXME(vincenzopalazzo): make this a general
            let commitment_seed = [
                255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
                255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
            ];
            return InMemorySigner::new(
                &Secp256k1::new(),
                self.funding_key.unwrap(),
                self.revocation_base_secret.unwrap(),
                self.payment_base_secret.unwrap(),
                self.delayed_payment_base_secret.unwrap(),
                self.htlc_base_secret.unwrap(),
                commitment_seed,
                channel_value_satoshis,
                channel_keys_id,
                self.shachain_seed.unwrap(),
            );
        }
        self.inner
            .derive_channel_signer(channel_value_satoshis, channel_keys_id)
    }
}
```
If your implementation lacks such methods, similar functionality must be introduced.

Additionally, configure your implementation to poll the Bitcoin network more frequently for updates, ensuring test environment synchronization with the blockchain state. For example, Core Lightning provides a development flag `--dev-bitcoind-poll=1` for this purpose.

## Developing the Runner

Once your implementation supports secret injection, you can develop your own `Runner` for lnprototest. Before detailing requirements (hint: it involves implementing the `Runner` interface found [here](https://github.com/rustyrussell/lnprototest/blob/master/lnprototest/runner.py#L35)), understand the runner's role and how tests are structured.

Since 2019, I've contributed to lnprototest on my own time, initially focusing on maintenance and diagnosing test failures. Over time, it became clear we needed to define not just how tests are written at the code level, but which protocol aspects should be tested within the main lnprototest repository ([GitHub](https://github.com/rustyrussell/lnprototest)) and which externally.

Initially, centralizing all tests within lnprototest aimed to benefit even non-contributors, but this led to a bloated repository, raising maintenance concerns about who would add tests for new protocol features.

After consideration, I concluded the main lnprototest repository should focus on testing core, mandatory Lightning Network protocol features all implementations must support. Tests for optional features or those specific to certain implementations (e.g., certain BLIPs or experimental feature of the protocol) should be developed separately.

Last year, we restructured lnprototest as a standalone library, enabling developers to integrate runners into their repositories, writing and maintaining tests specific to their implementations. Once a feature becomes standard, it can be proposed for inclusion in the main repository as a universally supported test.

## Best Practices for Runner Development

It is recommended to develop the `Runner` in a dedicated repository, following examples like [Lampo](https://github.com/vincenzopalazzo/lampo.rs/tree/main/tests/lnprototest) and [LDK](https://github.com/Psycho-Pirate/ldk-sample/tree/main/Lnprototest_Testing). This allows creating tests tailored to specific features while ensuring compatibility with the main lnprototest test suite through continuous integration (CI).

For instance, lnprototest loads the runner at runtime using commands like `make check PYTEST_ARGS='--runner=lnprototest.clightning.Runner'`. In your CI pipeline, clone the lnprototest repository and execute tests with your custom runner, e.g., `make check PYTEST_ARGS='--runner=lampo_lnprototest.Runner'`, assuming the [lampo-lnprototest](https://pypi.org/project/lampo-lnprototest/) package is installed.

Once ready, implement the runner in Python, interacting with your Lightning node via subprocesses for command-line interactions or RPC protocols if supported.

For reference, here is an example of a runner implemented for Lampo:

```python
class LampoRunner(Runner):
    """
    Lampo Runner implementation, this is the entry point
    of runner implementation, so all the lampo interaction
    happens here!
    """

    def __init__(self, config: Any) -> None:
        """Init the runner."""
        super().__init__(config)
        self.directory = tempfile.mkdtemp(prefix="lnpt-lampo-")
        self.config = config
        self.node = None
        self.last_conn = None
        self.public_key = None
        self.bitcoind = None
        self.executor = futures.ThreadPoolExecutor(max_workers=20)
        self.fundchannel_future: Optional[Any] = None
        self.cleanup_callbacks: List[Callable[[], None]] = []
        self.is_fundchannel_kill = False

    def __lampod_config_file(self) -> None:
        self.lightning_dir = os.path.join(self.directory, "lampo")
        if not os.path.exists(self.lightning_dir):
            os.makedirs(self.lightning_dir)
        self.lightning_port = self.reserve_port()
        f = open(f"{self.lightning_dir}/lampo.conf", "w")
        f.write(
            f"port={self.lightning_port}\ndev-private-key=0000000000000000000000000000000000000000000000000000000000000001\ndev-force-channel-secrets={self.get_node_bitcoinkey()}/0000000000000000000000000000000000000000000000000000000000000010/0000000000000000000000000000000000000000000000000000000000000011/0000000000000000000000000000000000000000000000000000000000000012/0000000000000000000000000000000000000000000000000000000000000013/0000000000000000000000000000000000000000000000000000000000000014/FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF\n"
        )
        # configure bitcoin core
        f.write(
            f"backend=core\ncore-url=localhost:{self.bitcoind.port}\ncore-user=rpcuser\ncore-pass=rpcpass\nnetwork=regtest\n"
        )
        f.flush()
        f.close()

    # FIXME: move this in lnprototest runner API
    def reserve_port(self) -> int:
        """
        Reserve a port.

        When python asks for a free port from the os, it is possible that
        with concurrent access, the port that is picked is a port that is not free
        anymore when we go to bind the daemon like bitcoind port.

        Source: https://stackoverflow.com/questions/1365265/on-localhost-how-do-i-pick-a-free-port-number
        """
        with closing(socket.socket(socket.AF_INET, socket.SOCK_STREAM)) as s:
            s.bind(("", 0))
            s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            return s.getsockname()[1]

    def connect(self, event: Event, connprivkey: str) -> None:
        self.add_conn(LampoConn(connprivkey, self.public_key, self.lightning_port))

    def disconnect(self, event: Event, conn: Conn) -> None:
        if conn is None:
            raise SpecFileError(event, "Unknown conn")
        del self.conns[conn.name]
        self.check_final_error(event, conn, conn.expected_error, conn.must_not_events)

    def start(self) -> None:
        """Start the Runner."""
        self.bitcoind = Bitcoind(self.directory, with_wallet="lampo-wallet")
        try:
            self.bitcoind.start()
        except Exception as ex:
            logging.debug(f"Exception with message {ex}")
        logging.debug(f"running bitcoin core on port {self.bitcoind.port}")
        self.__lampod_config_file()
        self.node = LampoDaemon(self.lightning_dir)
        self.node.register_unix_rpc()
        self.node.listen()
        time.sleep(10)

        self.public_key = self.node.call("getinfo", {})["node_id"]
        self.running = True
        logging.info(f"run lampod with node id {self.public_key}")

    def shutdown(self, also_bitcoind: bool = True) -> None:
        # FIXME: stop the lightning node.
        if also_bitcoind:
            self.bitcoind.stop()

    def stop(self, print_logs: bool = False) -> None:
        """
        Stop the runner.

        The function will print all the log that the ln
        implementation produced.
        Print the log is useful when we have a failure e we need
        to debug what happens during the tests.
        """
        self.shutdown(also_bitcoind=True)
        self.running = False
        for c in self.conns.values():
            cast(LampoConn, c).connection.connection.close()
        del self.node
        shutil.rmtree(self.lightning_dir)

    def recv(self, event: Event, conn: Conn, outbuf: bytes) -> None:
        try:
            cast(LampoConn, conn).connection.send_message(outbuf)
        except BrokenPipeError:
            # This happens when they've sent an error and closed; try
            # reading it to figure out what went wrong.
            fut = self.executor.submit(
                cast(CLightningConn, conn).connection.read_message
            )
            try:
                msg = fut.result(1)
            except futures.TimeoutError:
                msg = None
            if msg:
                raise EventError(
                    event, "Connection closed after sending {}".format(msg.hex())
                )
            else:
                raise EventError(event, "Connection closed")

    # FIXME: this can stay in the runner interface?
    def get_output_message(
        self, conn: Conn, event: Event, timeout: int = TIMEOUT
    ) -> Optional[bytes]:
        fut = self.executor.submit(cast(LampoConn, conn).connection.read_message)
        try:
            return fut.result(timeout)
        except futures.TimeoutError as ex:
            logging.error(f"timeout exception {ex}")
            return None
        except Exception as ex:
            logging.error(f"{ex}")
            return None

    def getblockheight(self) -> int:
        return self.bitcoind.rpc.getblockcount()

    def trim_blocks(self, newheight: int) -> None:
        h = self.bitcoind.rpc.getblockhash(newheight + 1)
        self.bitcoind.rpc.invalidateblock(h)

    def add_blocks(self, event: Event, txs: List[str], n: int) -> None:
        for tx in txs:
            self.bitcoind.rpc.sendrawtransaction(tx)
        self.bitcoind.rpc.generatetoaddress(n, self.bitcoind.rpc.getnewaddress())

    def fundchannel(
        self,
        event: Event,
        conn: Conn,
        amount: int,
        feerate: int = 0,
        expect_fail: bool = False,
    ) -> None:
        # First, check that another fundchannel isn't already running
        if self.fundchannel_future:
            if not self.fundchannel_future.done():
                raise RuntimeError(
                    "{} called fundchannel while another channel funding (fundchannel/init_rbf) is still in process".format(
                        event
                    )
                )
            self.fundchannel_future = None

        def _fundchannel(
            runner: Runner,
            conn: Conn,
            amount: int,
            feerate: int,
            expect_fail: bool = False,
        ) -> str:
            peer_id = conn.pubkey.format().hex()
            # Need to supply feerate here, since regtest cannot estimate fees
            try:
                logging.info(
                    f"fund channel with peer `{peer_id}` with amount `{amount}`"
                )
                return (
                    runner.node.call(
                        "fundchannel",
                        {
                            "node_id": peer_id,
                            "amount": amount,
                            "public": True,
                        },
                    ),
                    True,
                )
            except Exception as ex:
                # FIXME: this should not return None
                # but for now that we do not have any
                # use case where returni value is needed
                # we keep return null.
                #
                # The main reason to do this mess
                # is that in lnprototest do not have
                # any custom way to report a spec violation
                # failure, so for this reason we have different exception
                # at the same time (because this mess is needed to make stuff async
                # and look at exchanged message before finish the call). So
                # the solution is that we log the RPC exception (this may cause a spec
                # validation failure) and we care just the lnprototest exception as
                # real reason to abort.
                return str(ex), False

        def _done(fut: Any) -> None:
            result, ok = fut.result()
            if not ok and not self.is_fundchannel_kill and not expect_fail:
                raise Exception(result)
            logging.info(f"funding channel return `{result}`")
            self.fundchannel_future = None
            self.is_fundchannel_kill = False
            self.cleanup_callbacks.remove(self.kill_fundchannel)

        fut = self.executor.submit(
            _fundchannel, self, conn, amount, feerate, expect_fail
        )
        fut.add_done_callback(_done)
        self.fundchannel_future = fut
        self.cleanup_callbacks.append(self.kill_fundchannel)

    def get_keyset(self) -> KeySet:
        return KeySet(
            revocation_base_secret="0000000000000000000000000000000000000000000000000000000000000011",
            payment_base_secret="0000000000000000000000000000000000000000000000000000000000000012",
            delayed_payment_base_secret="0000000000000000000000000000000000000000000000000000000000000013",
            htlc_base_secret="0000000000000000000000000000000000000000000000000000000000000014",
            shachain_seed="FF" * 32,
        )

    def get_node_privkey(self) -> str:
        return "01"

    def get_node_bitcoinkey(self) -> str:
        return "0000000000000000000000000000000000000000000000000000000000000010"
```

Refer to the latest lnprototest documentation and source code, as the library may change significantly between versions. The complete `Runner` interface is found [here](https://github.com/rustyrussell/lnprototest/blob/master/lnprototest/runner.py).

## Conclusion

In conclusion, integrating lnprototest into your Lightning Network implementation's testing workflow involves ensuring secret injection support for deterministic testing and configuring frequent Bitcoin network polling for synchronization. Once met, develop a Python-based `Runner` interfacing with your node's API to leverage lnprototest's comprehensive test suite.

By following best practices—developing your runner in a separate repository and staying updated with lnprototest versions—you contribute to the robustness and interoperability of the Lightning Network ecosystem. Embracing lnprototest enhances your implementation's reliability and fosters community collaboration and standardization.
