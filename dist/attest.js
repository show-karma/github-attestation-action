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
const config_1 = require("./config");
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
        const schemaRegistryContractAddress = config_1.defaultNetworks[network].easSchemaContract;
        if (!schemaRegistryContractAddress) {
            throw new Error(`schemaRegistryContractAddress is not available for network "${network}"`);
        }
        const schemaRegistry = new eas_sdk_1.SchemaRegistry(schemaRegistryContractAddress);
        schemaRegistry.connect(signer);
        const schema = 'string username,string repository,string branch,string pullRequestName,string pullRequestLink, uint256 additions, uint256 deletions';
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
        const { privateKey, network, rpcUrl, repo, branch, username, pullRequestName, pullRequestLink, additions, deletions } = input;
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
        if (!additions) {
            throw new Error('additions is required');
        }
        if (!deletions) {
            throw new Error('deletions is required');
        }
        const provider = new ethers_1.ethers.providers.StaticJsonRpcProvider(rpcUrl);
        const signer = new ethers_1.ethers.Wallet(privateKey, provider);
        const EASContractAddress = config_1.defaultNetworks[network].easContract;
        if (!EASContractAddress) {
            throw new Error(`EASContractAddress is not available for network "${network}"`);
        }
        const eas = new eas_sdk_1.EAS(EASContractAddress);
        eas.connect(signer);
        const schemaUID = config_1.defaultNetworks[network].schemaId;
        if (!schemaUID) {
            throw new Error(`schemaUID is not available for network "${network}"`);
        }
        // Initialize SchemaEncoder with the schema string
        const schemaEncoder = new eas_sdk_1.SchemaEncoder('string username,string repository,string branch,string pullRequestName,string pullRequestLink, uint256 additions, uint256 deletions');
        const encodedData = schemaEncoder.encodeData([
            { name: 'username', value: username.toLowerCase(), type: 'string' },
            { name: 'repository', value: repo, type: 'string' },
            { name: 'branch', value: branch, type: 'string' },
            { name: 'pullRequestName', value: pullRequestName, type: 'string' },
            { name: 'pullRequestLink', value: pullRequestLink, type: 'string' },
            { name: 'additions', value: additions, type: 'uint256' },
            { name: 'deletions', value: deletions, type: 'uint256' }
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
                });
                console.log('result:', result);
            }
        });
    }
    main().catch(console.error);
}
