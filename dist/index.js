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
exports.main = void 0;
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const attest_1 = require("./attest");
const config_1 = require("./config");
const child_process_1 = require("child_process");
function calculateLinesAddedRemoved(baseBranch) {
    return __awaiter(this, void 0, void 0, function* () {
        // Replace 'HEAD' with the appropriate reference to the current branch, e.g., 'refs/heads/main'.
        const currentBranch = 'HEAD';
        // Command to calculate lines added
        const linesAddedCommand = `git diff --numstat ${baseBranch}...${currentBranch} | awk '{s+=$1} END {print s}'`;
        console.log({ linesAddedCommand });
        // Command to calculate lines removed
        const linesRemovedCommand = `git diff --numstat ${baseBranch}...${currentBranch} | awk '{s+=$2} END {print s}'`;
        console.log({ linesRemovedCommand });
        return new Promise((resolve, reject) => {
            (0, child_process_1.exec)(linesAddedCommand, (error, stdout, stderr) => {
                if (error) {
                    reject(`Error calculating lines added: ${error}`);
                }
                const linesAdded = parseInt(stdout);
                (0, child_process_1.exec)(linesRemovedCommand, (error, stdout, stderr) => {
                    if (error) {
                        reject(`Error calculating lines removed: ${error}`);
                    }
                    const linesRemoved = parseInt(stdout);
                    resolve({ linesAdded, linesRemoved });
                });
            });
        });
    });
}
function main() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const privateKey = core.getInput('private-key', { required: true, trimWhitespace: true });
            const network = core.getInput('network', { required: false, trimWhitespace: true }) || 'sepolia';
            const rpcUrl = core.getInput('rpc-url', { required: false, trimWhitespace: true }) || config_1.defaultNetworks[network].rpc;
            const _branch = core.getInput('branch', { required: false, trimWhitespace: true }) || '';
            const _branches = core.getMultilineInput('branches', { required: false, trimWhitespace: true }) || [];
            const allowedBranches = (_branches === null || _branches === void 0 ? void 0 : _branches.length) ? _branches : [_branch];
            if (!privateKey) {
                throw new Error('private-key is required');
            }
            if (!network) {
                throw new Error('network is required');
            }
            if (!rpcUrl) {
                throw new Error('rpc-url is required');
            }
            if (!config_1.supportedNetworks.has(network)) {
                throw new Error(`network "${network}" is not supported`);
            }
            const repo = (_c = (_b = (_a = github === null || github === void 0 ? void 0 : github.context) === null || _a === void 0 ? void 0 : _a.payload) === null || _b === void 0 ? void 0 : _b.repository) === null || _c === void 0 ? void 0 : _c.full_name;
            const branch = (_e = (_d = github === null || github === void 0 ? void 0 : github.context) === null || _d === void 0 ? void 0 : _d.ref) === null || _e === void 0 ? void 0 : _e.replace('refs/heads/', '');
            const username = (_j = (_h = (_g = (_f = github === null || github === void 0 ? void 0 : github.context) === null || _f === void 0 ? void 0 : _f.payload) === null || _g === void 0 ? void 0 : _g.pull_request) === null || _h === void 0 ? void 0 : _h.user) === null || _j === void 0 ? void 0 : _j.login;
            const pullRequestLink = (_m = (_l = (_k = github === null || github === void 0 ? void 0 : github.context) === null || _k === void 0 ? void 0 : _k.payload) === null || _l === void 0 ? void 0 : _l.pull_request) === null || _m === void 0 ? void 0 : _m.html_url;
            const pullRequestName = ((_q = (_p = (_o = github === null || github === void 0 ? void 0 : github.context) === null || _o === void 0 ? void 0 : _o.payload) === null || _p === void 0 ? void 0 : _p.pull_request) === null || _q === void 0 ? void 0 : _q.title) || ((_t = (_s = (_r = github === null || github === void 0 ? void 0 : github.context) === null || _r === void 0 ? void 0 : _r.payload) === null || _s === void 0 ? void 0 : _s.pull_request) === null || _t === void 0 ? void 0 : _t.body) || 'Name not found';
            const { linesAdded, linesRemoved } = yield calculateLinesAddedRemoved(branch);
            if (!repo) {
                console.log('repo is not available, skipping attestation.');
                return;
            }
            if (!branch) {
                console.log('branch is not available, skipping attestation.');
                return;
            }
            if (!username) {
                console.log('username is not available, skipping attestation.');
                return;
            }
            if (!pullRequestLink) {
                console.log('pullRequestLink is not available, skipping attestation.');
                return;
            }
            if (!pullRequestName) {
                console.log('pullRequestName is not available, skipping attestation.');
                return;
            }
            if (!allowedBranches.includes(branch)) {
                console.log(`branch "${branch}" is not an allowed branch, skipping attestation.`);
                return;
            }
            const isPullRequestMerged = !!github.context.payload.pull_request && github.context.payload.action == 'closed' && github.context.payload.pull_request.merged;
            if (!isPullRequestMerged) {
                console.log('event is not a pull request merge, skipping attestation.');
                return;
            }
            console.log('Inputs:', {
                allowedBranches,
                network,
                rpcUrl,
                repo,
                branch,
                username,
                pullRequestLink,
                pullRequestName,
                linesAdded,
                linesRemoved
            });
            const { hash, uid } = yield (0, attest_1.attest)({
                privateKey,
                network,
                rpcUrl,
                repo,
                branch,
                username,
                pullRequestLink,
                pullRequestName
            });
            console.log('Transaction hash:', hash);
            console.log('New attestation UID:', uid);
            console.log('Setting outputs...');
            core.setOutput('hash', hash);
            core.setOutput('uid', uid);
            console.log('Done!');
        }
        catch (err) {
            console.log('... an error occurred in this step.');
            core.setFailed(err.message);
        }
    });
}
exports.main = main;
main().catch(error => core.setFailed(error.message));
