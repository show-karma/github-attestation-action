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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GithubApiClient = void 0;
const axios_1 = __importDefault(require("axios"));
const query_1 = require("./query");
class GithubApiClient {
    constructor(gitApi) {
        this.client = axios_1.default.create({
            baseURL: "https://api.github.com/graphql",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${gitApi}`
            }
        });
    }
    countMergedPRsByAuthor(owner, repository, author) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            const uniqueMergedPRs = new Set();
            try {
                let after = null;
                while (true) {
                    const query = (0, query_1.queryGetMergedPRsByAuthor)(owner, repository, after);
                    const response = yield this.client.post('', { query });
                    const filteredPRs = (_d = (_c = (_b = (_a = response.data.data) === null || _a === void 0 ? void 0 : _a.repository) === null || _b === void 0 ? void 0 : _b.pullRequests) === null || _c === void 0 ? void 0 : _c.nodes) === null || _d === void 0 ? void 0 : _d.filter((pr) => pr.author.login.toLowerCase() === author.toLowerCase());
                    if (!filteredPRs) {
                        break;
                    }
                    filteredPRs.forEach((pr) => uniqueMergedPRs.add(pr.id));
                    after = response.data.data.repository.pullRequests.pageInfo.endCursor;
                    if (!response.data.data.repository.pullRequests.pageInfo.hasNextPage) {
                        break;
                    }
                }
            }
            catch (err) {
                console.log('err: ', err);
            }
            return uniqueMergedPRs.size;
        });
    }
}
exports.GithubApiClient = GithubApiClient;
