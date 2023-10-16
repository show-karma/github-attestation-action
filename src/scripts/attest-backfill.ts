import { GithubApiClient, IPullRequest } from '../github/githubApiClient';
import { attest } from '../attest';

import * as dotenv from 'dotenv';
dotenv.config();

async function attestBackfill(completeRepositoryName: string, username?: string) {
  const allowedBranches = ["main"] || [];

  const githubApiClient = new GithubApiClient(process.env.GITHUB_API_KEY);
  const [owner, repository] = completeRepositoryName?.split('/');
  const pullRequests: IPullRequest[]  =  await githubApiClient.mergedPRsByAuthor(owner, repository, username)
  
  console.log("pullRequests: ", pullRequests.length)

  if(!pullRequests){
    console.log("any PR was found");
  }

  
  for(const pr of pullRequests){
    if (!allowedBranches.includes(pr.baseRefName))
      continue

    const prCount  = +(pr.permalink.split('/').pop() || 0);

    try{
    const { hash, uid } = await attest({
      privateKey: process.env.PRIVATE_KEY as string,
      network: process.env.NETWORK as string,
      rpcUrl: process.env.RPC as string,
      repo: completeRepositoryName,
      branch: pr.baseRefName,
      username: pr.author.login,
      pullRequestLink: pr.permalink,
      pullRequestName: pr.title,
      pullRequestCount: prCount
    })

    console.log('Transaction hash:', hash)
    console.log('New attestation UID:', uid)
    console.log('\n\n')
    }catch(err){
      console.log(err)
    }
  }
        
  }
  
  // Check if there are enough command-line arguments
  if (process.argv.length !== 3 && process.argv.length !== 4 ) {
    console.error('Usage: yarn backfill:attestations <repository> ?<githubUsername>');
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
  
