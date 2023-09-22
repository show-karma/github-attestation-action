import { GithubApiClient, IPullRequest } from '../github/githubApiClient';
import { getCredentials } from '../config';
import { attest } from '../attest';

async function attestBackfill(completeRepositoryName: string, username: string) {
  const {privateKey, gitApi, network, rpcUrl, _branch, _branches, allowedBranches} = getCredentials();

  const githubApiClient = new GithubApiClient(gitApi);
  const [owner, repository] = completeRepositoryName?.split('/');
  const pullRequests: IPullRequest[]  =  await githubApiClient.mergedPRsByAuthor(owner, repository, username)
  
  if(!pullRequests){
    console.log("any PR was found");
  }

  for(const pr of pullRequests){
    if (!allowedBranches.includes(pr.baseRefName))
      continue

    const prCount  = +(pr.permalink.split('/').pop() || 0);

    await attest({
      privateKey,
      network,
      rpcUrl,
      repo: repository,
      branch: pr.baseRefName,
      username,
      pullRequestLink: pr.permalink,
      pullRequestName: pr.title,
      pullRequestCount: prCount
    })
  }
        
  }
  
  // Check if there are enough command-line arguments
  if (process.argv.length !== 4) {
    console.error('Usage: yarn backfill:attestations <repository> <githubUsername>');
    process.exit(1);
  }
  
  const [, , arg1, arg2] = process.argv;
  
  (async () => {
    try {
      await attestBackfill(arg1, arg2);
    } catch (error) {
      console.error('An error occurred:', error);
    }
  })();
  
