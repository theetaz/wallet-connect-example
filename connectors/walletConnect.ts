import { initializeConnector } from "@web3-react/core";
import { WalletConnect } from "@web3-react/walletconnect";
import { URLS } from "./urls";

// export const [walletConnect, useWalletConnect] = initializeConnector<WalletConnect>((actions) => new WalletConnect(actions), [
//   {
//     // rpc: { 1: URLS[0] },
//     rpc: { 3: 'https://staging.orionprotocol.io/rpc' },
//   },
// ])

export const [walletConnect, useWalletConnect] = initializeConnector<
  WalletConnect
>(
  (actions) =>
    new WalletConnect(actions, {
      rpc: Object.keys(URLS).reduce((accumulator, chainId) => {
        accumulator[chainId] = URLS[Number(chainId)][0];
        return accumulator;
      }, {})
    }),
  Object.keys(URLS).map((chainId) => Number(chainId))
);
