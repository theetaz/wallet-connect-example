import { useEffect, useState } from 'react';
import { BigNumber } from '@ethersproject/bignumber';
import { formatEther } from '@ethersproject/units';
import { UseStore } from 'zustand';
import { Connector, Web3ReactState } from '@web3-react/types';
import { connectors } from '../connectors'
import "./styles.css";

function Status({
  connector,
  hooks,
}: {
  connector: Connector,
  hooks: UseStore<Web3ReactState>,
}) {
  const chainId = hooks.useChainId();
  const accounts = hooks.useAccounts();
  const error = hooks.useError();

  const connected = Boolean(chainId && accounts);

  return (
    <div>
      <b>{connector.constructor.name}</b>
      <br />
      {error ? (
        <>
          🛑 {error.name ?? 'Error'}: {error.message}
        </>
      ) : connected ? (
        <>✅ Connected</>
      ) : (
        <>⚠️ Disconnected</>
      )}
    </div>
  )
}

function ChainId({ hooks }: { hooks: UseStore<Web3ReactState> }) {
  const chainId = hooks.useChainId()

  return <div>Chain Id: {chainId ? <b>{chainId}</b> : '-'}</div>
}

function Accounts({
  connector,
  hooks,
}: {
  connector: Connector,
  hooks: UseStore<Web3ReactState>,
}) {
  const accounts = hooks.useAccounts();
  const ENSNames = hooks.useENSNames();

  const provider = hooks.useProvider();
  const [balances, setBalances] = useState(undefined);
  useEffect(() => {
    if (provider && accounts?.length) {
      let stale = false

      Promise.all(accounts.map((account) => provider.getBalance(account))).then((balances) => {
        if (!stale) {
          setBalances(balances)
        }
      })

      return () => {
        stale = true
        setBalances(undefined)
      }
    }
  }, [accounts, provider])

  return (
    <div>
      Accounts:
      {accounts === undefined
        ? ' -'
        : accounts.length === 0
        ? ' None'
        : accounts?.map((account, i) => (
            <ul key={account} style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <b>{ENSNames?.[i] ?? account}</b>
              {balances?.[i] ? ` (Ξ${formatEther(balances[i])})` : null}
            </ul>
          ))}
    </div>
  )
}

function Connect({ connector, hooks }: { connector: Connector; hooks: UseStore<Web3ReactState> }) {
console.log('connector', connector);
console.log('hooks', hooks);
console.log('connector.deactivate', connector.activate);

  const activating = hooks.useIsActivating()
  const error = hooks.useError()

  const chainId = hooks.useChainId()
  const accounts = hooks.useAccounts()
  const connected = Boolean(chainId && accounts)

  if (error) {
    return (
      <button
        onClick={() => {
          connector.activate()
        }}
      >
        Try Again?
      </button>
    )
  } else if (connected) {
    return (
      <>
        <button
          onClick={() => {
            if (connector?.deactivate) {
              connector.deactivate()
            }
          }}
          disabled={connector.deactivate ? false : true}
        >
          {connector.deactivate ? 'Disconnect' : 'Connected'}
        </button>
        <br />
        <button
          onClick={() => connector.deactivate()}
        >
          Disconnect
        </button>
      </>
    )
  } else {
    return (
      <button
        onClick={() => {
          if (!activating) {
            connector.activate()
          }
        }}
        disabled={activating ? true : false}
      >
        {activating ? 'Connecting...' : 'Activate'}
      </button>
    )
  }
}

export default function App() {

  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
      <div style={{ display: 'flex', flexFlow: 'wrap', fontFamily: 'sans-serif' }}>
      {connectors.map(([connector, hooks], i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '20rem',
            padding: '1rem',
            margin: '1rem',
            overflow: 'auto',
            border: '1px solid',
            borderRadius: '1rem',
          }}
        >
          <div>
            <Status connector={connector} hooks={hooks} />
            <br />
            <ChainId hooks={hooks} />
            <Accounts connector={connector} hooks={hooks} />
            <br />
          </div>
          <Connect connector={connector} hooks={hooks} />
        </div>
      ))}
    </div>
    </div>
  );
}
