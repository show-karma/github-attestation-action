"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.attest = exports.createSchema = void 0;
const eas_sdk_1 = require("@ethereum-attestation-service/eas-sdk");
const ethers_1 = require("ethers");
const addresses = {
    'mainnet': {
        schemaRegistryContractAddress: '0xA7b39296258348C78294F95B872b282326A97BDF',
        EASContractAddress: '0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587',
        schemaUID: '0x47a1041b689b790b4d3fa58ae2289a1d903dcc5b4e00d14f941090b59d947971'
    },
    'sepolia': {
        schemaRegistryContractAddress: '0x0a7E2Ff54e76B8E6659aedc9103FB21c038050D0',
        EASContractAddress: '0xC2679fBD37d54388Ce493F1DB75320D236e1815e',
        schemaUID: '0xd1a11316b53c1a3509a122f1b9a9994ea096468de475f165bb908507aaa36cd3'
    },
    'optimism-goerli': {
        schemaRegistryContractAddress: '0x4200000000000000000000000000000000000020',
        EASContractAddress: '0x4200000000000000000000000000000000000021',
        schemaUID: '0x6bec7c9280879206b1d21f35b6a9cc2b58725ad75bd5eaf1bde519257401dc44'
    },
    'optimism': {
        schemaRegistryContractAddress: '0x4200000000000000000000000000000000000020',
        EASContractAddress: '0x4200000000000000000000000000000000000021',
        schemaUID: '0x47a1041b689b790b4d3fa58ae2289a1d903dcc5b4e00d14f941090b59d947971'
    }
};
function createSchema(input) {
    return __awaiter(this, void 0, void 0, function* () {
        const { privateKey, network, rpcUrl } = input;
        if (!privateKey) {
            throw new Error('privateKey is required');
        }
        if (!network) {
            throw new Error('network is required');
        }
        if (!rpcUrl) {
            throw new Error('rpcUrl is required');
        }
        const provider = new ethers_1.ethers.providers.StaticJsonRpcProvider(rpcUrl);
        const signer = new ethers_1.ethers.Wallet(privateKey, provider);
        const schemaRegistryContractAddress = addresses[network].schemaRegistryContractAddress;
        if (!schemaRegistryContractAddress) {
            throw new Error(`schemaRegistryContractAddress is not available for network "${network}"`);
        }
        const schemaRegistry = new eas_sdk_1.SchemaRegistry(schemaRegistryContractAddress);
        schemaRegistry.connect(signer);
        const schema = 'string username,string repository,string branch,string pullRequestName,string pullRequestLink,uint256 pullRequestCount';
        const resolverAddress = '0x0000000000000000000000000000000000000000';
        const revocable = true;
        const tx = yield schemaRegistry.register({
            schema,
            resolverAddress,
            revocable,
        });
        console.log('tx:', tx);
        yield tx.wait();
        console.log('schema creation done');
        return tx;
    });
}
exports.createSchema = createSchema;
function attest(input) {
    return __awaiter(this, void 0, void 0, function* () {
        const { privateKey, network, rpcUrl, repo, branch, username, pullRequestName, pullRequestLink, pullRequestCount } = input;
        if (!privateKey) {
            throw new Error('privateKey is required');
        }
        if (!network) {
            throw new Error('network is required');
        }
        if (!rpcUrl) {
            throw new Error('rpcUrl is required');
        }
        if (!repo) {
            throw new Error('repo is required');
        }
        if (!branch) {
            throw new Error('branch is required');
        }
        if (!username) {
            throw new Error('username is required');
        }
        if (!pullRequestName) {
            throw new Error('pullRequestName is required');
        }
        if (!pullRequestLink) {
            throw new Error('pullRequestLink is required');
        }
        if (!pullRequestCount) {
            throw new Error('pullRequestCount is required');
        }
        const provider = new ethers_1.ethers.providers.StaticJsonRpcProvider(rpcUrl);
        const signer = new ethers_1.ethers.Wallet(privateKey, provider);
        const EASContractAddress = addresses[network].EASContractAddress;
        if (!EASContractAddress) {
            throw new Error(`EASContractAddress is not available for network "${network}"`);
        }
        const eas = new eas_sdk_1.EAS(EASContractAddress);
        eas.connect(signer);
        const schemaUID = addresses[network].schemaUID;
        if (!schemaUID) {
            throw new Error(`schemaUID is not available for network "${network}"`);
        }
        // Initialize SchemaEncoder with the schema string
        const schemaEncoder = new eas_sdk_1.SchemaEncoder('string username,string repository,string branch,string pullRequestName,string pullRequestLink,uint256 pullRequestCount');
        const encodedData = schemaEncoder.encodeData([
            { name: 'username', value: username, type: 'string' },
            { name: 'repository', value: repo, type: 'string' },
            { name: 'branch', value: branch, type: 'string' },
            { name: 'pullRequestName', value: pullRequestName, type: 'string' },
            { name: 'pullRequestLink', value: pullRequestLink, type: 'string' },
            { name: 'pullRequestCount', value: pullRequestCount, type: 'uint256' },
        ]);
        const res = yield eas.attest({
            schema: schemaUID,
            data: {
                recipient: '0x0000000000000000000000000000000000000000',
                expirationTime: 0,
                revocable: true,
                data: encodedData,
            },
        });
        const hash = res.tx.hash;
        const newAttestationUID = yield res.wait();
        return {
            hash,
            uid: newAttestationUID
        };
    });
}
exports.attest = attest;
if (require.main === module) {
    require('dotenv').config();
    function main() {
        return __awaiter(this, void 0, void 0, function* () {
            const privateKey = process.env.PRIVATE_KEY;
            const network = process.env.NETWORK;
            const rpcUrl = process.env.RPC_URL;
            if (privateKey && network && rpcUrl) {
                yield createSchema({
                    privateKey,
                    network,
                    rpcUrl,
                });
                const result = yield attest({
                    privateKey,
                    network,
                    rpcUrl,
                    username: 'example',
                    repo: 'example',
                    branch: 'main',
                    pullRequestLink: 'www.github.com',
                    pullRequestName: 'github test',
                    pullRequestCount: 1
                });
                console.log('result:', result);
            }
        });
    }
    main().catch(console.error);
}
