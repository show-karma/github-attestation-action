import axios, { AxiosInstance, all } from "axios";
import { queryGetMergedPRsByAuthor } from "./query";

export interface IPullRequest {
  id: string;
  title: string;
  permalink: string;
  baseRefName: string;
  deletions: number;
  additions: number;
  author: {
    login: string;
  }
}
export class GithubApiClient {
  private client: AxiosInstance;
  
  constructor(gitApi?: string) {
    this.client = axios.create({
      baseURL: "https://api.github.com/graphql",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${gitApi || process.env.GITHUB_API_KEY}`
      }
    });
  }


  async mergedPRsByAuthor(owner: string, repository: string, author?: string): Promise<IPullRequest[]> {
    const uniqueMergedPRs = new Set<IPullRequest>();
  
    try {
      let after = null;
  
      while (true) {
        const query = queryGetMergedPRsByAuthor(owner, repository, after);
        const response = await this.client.post('', { query });
        const prS =  response.data.data?.repository?.pullRequests?.nodes || [];

        const filteredPRs = !author ? prS : prS?.filter((pr: { author: { login: string; }; }) => pr.author.login.toLowerCase() === author.toLowerCase());
  
        if (!filteredPRs) {
          break;
        }
  
        filteredPRs.forEach((pr: IPullRequest) => uniqueMergedPRs.add(pr));
  
        after = response.data.data.repository.pullRequests.pageInfo.endCursor;
  
        if (!response.data.data.repository.pullRequests.pageInfo.hasNextPage) {
          break;
        }
      }
    } catch (err) {
      console.log('err: ', err);
    }
  
    return [...uniqueMergedPRs];
  }

  async getAdditionsAndDelegationsOfPr(owner: string, repository: string, author: string,  title: string): Promise<{additions: number, deletions: number}> {
    const allPrs = await this.mergedPRsByAuthor(owner, repository, author);

    const pr = allPrs.find(p => p.title.toLowerCase() ===  title.toLowerCase());

    return {
      additions: pr?.additions || 0,
      deletions: pr?.deletions || 0
    }
  }

}
