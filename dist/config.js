"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCredentials = exports.defaultRpcUrls = exports.supportedNetworks = void 0;
const core = __importStar(require("@actions/core"));
exports.supportedNetworks = new Set(['mainnet', 'sepolia', 'optimism-goerli']);
exports.defaultRpcUrls = {
    'mainnet': 'https://rpc.eth.gateway.fm',
    'goerli': 'https://goerli.gateway.tenderly.co',
    'sepolia': 'https://rpc.sepolia.org/',
    'optimism-goerli': 'https://goerli.optimism.io',
    'optimism': 'https://mainnet.optimism.io'
};
function getCredentials() {
    console.log('Reading inputs...');
    const privateKey = core.getInput('private-key', { required: true, trimWhitespace: true });
    const gitApi = core.getInput('git-api', { required: true, trimWhitespace: true });
    const network = core.getInput('network', { required: false, trimWhitespace: true }) || 'sepolia';
    const rpcUrl = core.getInput('rpc-url', { required: false, trimWhitespace: true }) || exports.defaultRpcUrls[network];
    const _branch = core.getInput('branch', { required: false, trimWhitespace: true }) || '';
    const _branches = core.getMultilineInput('branches', { required: false, trimWhitespace: true }) || [];
    const allowedBranches = (_branches === null || _branches === void 0 ? void 0 : _branches.length) ? _branches : [_branch];
    return { privateKey, gitApi, network, rpcUrl, _branch, _branches, allowedBranches };
}
exports.getCredentials = getCredentials;
