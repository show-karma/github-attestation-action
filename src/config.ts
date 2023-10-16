import * as core from '@actions/core'

export const supportedNetworks = new Set(['mainnet', 'sepolia', 'optimism-goerli'])

export const defaultNetworks: Record<string, {rpc: string, schemaId?: string, easContract?: string, easSchemaContract?: string}> = {
  'mainnet': {rpc: 'https://rpc.eth.gateway.fm',schemaId: undefined, easContract: "0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587", easSchemaContract: "0xA7b39296258348C78294F95B872b282326A97BDF"},
  'goerli': {rpc: 'https://goerli.gateway.tenderly.co',schemaId: undefined, easContract: "0xAcfE09Fd03f7812F022FBf636700AdEA18Fd2A7A", easSchemaContract: "0x720c2bA66D19A725143FBf5fDC5b4ADA2742682E"},
  'sepolia': {rpc: 'https://rpc.sepolia.org/', schemaId: undefined, easContract: "0xC2679fBD37d54388Ce493F1DB75320D236e1815e", easSchemaContract: "0x0a7E2Ff54e76B8E6659aedc9103FB21c038050D0"},
  'optimism-goerli': {rpc: 'https://goerli.optimism.io', schemaId: undefined, easContract: "0x4200000000000000000000000000000000000021", easSchemaContract: "0x4200000000000000000000000000000000000020"},
  'optimism': {rpc: 'https://mainnet.optimism.io', schemaId: undefined, easContract: "0x4200000000000000000000000000000000000021", easSchemaContract: "0x4200000000000000000000000000000000000020"} 
}
