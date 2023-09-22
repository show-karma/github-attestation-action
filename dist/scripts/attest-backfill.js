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
const githubApiClient_1 = require("../github/githubApiClient");
const config_1 = require("../config");
const attest_1 = require("../attest");
function attestBackfill(completeRepositoryName, username) {
    return __awaiter(this, void 0, void 0, function* () {
        const { privateKey, gitApi, network, rpcUrl, _branch, _branches, allowedBranches } = (0, config_1.getCredentials)();
        const githubApiClient = new githubApiClient_1.GithubApiClient(gitApi);
        const [owner, repository] = completeRepositoryName === null || completeRepositoryName === void 0 ? void 0 : completeRepositoryName.split('/');
        const pullRequests = yield githubApiClient.mergedPRsByAuthor(owner, repository, username);
        if (!pullRequests) {
            console.log("any PR was found");
        }
        for (const pr of pullRequests) {
            if (!allowedBranches.includes(pr.baseRefName))
                continue;
            const prCount = +(pr.permalink.split('/').pop() || 0);
            yield (0, attest_1.attest)({
                privateKey,
                network,
                rpcUrl,
                repo: repository,
                branch: pr.baseRefName,
                username,
                pullRequestLink: pr.permalink,
                pullRequestName: pr.title,
                pullRequestCount: prCount
            });
        }
    });
}
// Check if there are enough command-line arguments
if (process.argv.length !== 4) {
    console.error('Usage: yarn backfill:attestations <repository> <githubUsername>');
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
