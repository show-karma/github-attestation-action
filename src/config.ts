export const supportedNetworks = new Set(['mainnet', 'sepolia', 'optimism-goerli'])

export const defaultRpcUrls: Record<string, string> = {
  'mainnet': 'https://rpc.eth.gateway.fm',
  'goerli': 'https://goerli.gateway.tenderly.co',
  'sepolia': 'https://rpc.sepolia.org/',
  'optimism-goerli': 'https://goerli.optimism.io',
  'optimism': 'https://mainnet.optimism.io'
}
