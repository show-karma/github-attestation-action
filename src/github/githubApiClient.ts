import axios, { AxiosInstance } from "axios";
import { queryGetMergedPRsByAuthor, queryPrByAuthor } from "./query";

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

  async findPrByRepoAndAuthor(owner: string, repository: string, title: string): Promise<IPullRequest | null> {
    try {
      const query = queryPrByAuthor(owner, repository, title);
      const response = await this.client.post('', { query });
      const pr =  response.data.data?.repository?.pullRequests?.nodes || [];
      return pr;
    } catch (err) {
      console.log('err: ', err);
      return null;
    }
  }

}
