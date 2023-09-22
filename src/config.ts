import * as core from '@actions/core'

export const supportedNetworks = new Set(['mainnet', 'sepolia', 'optimism-goerli'])

export const defaultRpcUrls: Record<string, string> = {
  'mainnet': 'https://rpc.eth.gateway.fm',
  'goerli': 'https://goerli.gateway.tenderly.co',
  'sepolia': 'https://rpc.sepolia.org/',
  'optimism-goerli': 'https://goerli.optimism.io',
  'optimism': 'https://mainnet.optimism.io'
}

export function getCredentials() {
  console.log('Reading inputs...')
  const privateKey = core.getInput('private-key', { required: true, trimWhitespace: true })
  const gitApi = core.getInput('git-api', { required: true, trimWhitespace: true })
  const network = core.getInput('network', { required: false, trimWhitespace: true }) || 'sepolia'
  const rpcUrl = core.getInput('rpc-url', { required: false, trimWhitespace: true }) || defaultRpcUrls[network]
  const _branch = core.getInput('branch', { required: false, trimWhitespace: true }) || ''
  const _branches = core.getMultilineInput('branches', { required: false, trimWhitespace: true }) || []
  const allowedBranches = _branches?.length ? _branches : [_branch]
  
  return {privateKey, gitApi, network, rpcUrl, _branch, _branches, allowedBranches} 
}
