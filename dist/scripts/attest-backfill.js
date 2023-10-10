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
const githubApiClient_1 = require("../github/githubApiClient");
const attest_1 = require("../attest");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
function attestBackfill(completeRepositoryName, username) {
    return __awaiter(this, void 0, void 0, function* () {
        const allowedBranches = ["main"] || [];
        const githubApiClient = new githubApiClient_1.GithubApiClient(process.env.GITHUB_API_KEY);
        const [owner, repository] = completeRepositoryName === null || completeRepositoryName === void 0 ? void 0 : completeRepositoryName.split('/');
        const pullRequests = yield githubApiClient.mergedPRsByAuthor(owner, repository, username);
        console.log("pullRequests: ", pullRequests.length);
        if (!pullRequests) {
            console.log("any PR was found");
        }
        for (const pr of pullRequests) {
            if (!allowedBranches.includes(pr.baseRefName))
                continue;
            const prCount = +(pr.permalink.split('/').pop() || 0);
            try {
                const { hash, uid } = yield (0, attest_1.attest)({
                    privateKey: process.env.PRIVATE_KEY,
                    network: process.env.NETWORK,
                    rpcUrl: process.env.RPC,
                    repo: repository,
                    branch: pr.baseRefName,
                    username: pr.author.login,
                    pullRequestLink: pr.permalink,
                    pullRequestName: pr.title,
                    pullRequestCount: prCount
                });
                console.log('Transaction hash:', hash);
                console.log('New attestation UID:', uid);
                console.log('\n\n');
            }
            catch (err) {
                console.log(err);
            }
        }
    });
}
// Check if there are enough command-line arguments
if (process.argv.length !== 3 && process.argv.length !== 4) {
    console.error('Usage: yarn backfill:attestations <repository> ?<githubUsername>');
    process.exit(1);
}
const [, , arg1, arg2] = process.argv;
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield attestBackfill(arg1, arg2);
    }
    catch (error) {
        console.error('An error occurred:', error);
    }
}))();
