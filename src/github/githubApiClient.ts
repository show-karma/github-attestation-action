import axios, { AxiosInstance } from "axios";
import { queryGetMergedPRsByAuthor } from "./query";



export class GithubApiClient {
  private client: AxiosInstance;
  
  constructor(gitApi: string) {
    this.client = axios.create({
      baseURL: "https://api.github.com/graphql",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${gitApi}`
      }
    });
  }


  async countMergedPRsByAuthor(owner: string, repository: string, author: string) {
    const uniqueMergedPRs = new Set();
  
    try {
      let after = null;
  
      while (true) {
        const query = queryGetMergedPRsByAuthor(owner, repository, after);
        const response = await this.client.post('', { query });
  
        const filteredPRs = response.data.data?.repository?.pullRequests?.nodes?.filter((pr: { author: { login: string; }; }) => pr.author.login.toLowerCase() === author.toLowerCase());
  
        if (!filteredPRs) {
          break;
        }
  
        filteredPRs.forEach((pr: { id: string; }) => uniqueMergedPRs.add(pr.id));
  
        after = response.data.data.repository.pullRequests.pageInfo.endCursor;
  
        if (!response.data.data.repository.pullRequests.pageInfo.hasNextPage) {
          break;
        }
      }
    } catch (err) {
      console.log('err: ', err);
    }
  
    return uniqueMergedPRs.size;
  }
}
