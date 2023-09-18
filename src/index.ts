import * as core from '@actions/core'
import * as github from '@actions/github'
import { attest } from './attest'
import { supportedNetworks, defaultRpcUrls } from './config'
import { GithubApiClient } from './github/githubApiClient'

async function main() {
  try {
    console.log('Reading inputs...')
    const privateKey = core.getInput('private-key', { required: true, trimWhitespace: true })
    const gitApi = core.getInput('git-api', { required: true, trimWhitespace: true })
    const network = core.getInput('network', { required: false, trimWhitespace: true }) || 'sepolia'
    const rpcUrl = core.getInput('rpc-url', { required: false, trimWhitespace: true }) || defaultRpcUrls[network]
    const _branch = core.getInput('branch', { required: false, trimWhitespace: true }) || ''
    const _branches = core.getMultilineInput('branches', { required: false, trimWhitespace: true }) || []
    const allowedBranches = _branches?.length ? _branches : [_branch]

    if (!privateKey) {
      throw new Error('private-key is required')
    }

    if (!gitApi) {
      throw new Error('gitApi is required')
    }

    if (!network) {
      throw new Error('network is required')
    }

    if (!rpcUrl) {
      throw new Error('rpc-url is required')
    }

    if (!supportedNetworks.has(network)) {
      throw new Error(`network "${network}" is not supported`)
    }


    const repo = github?.context?.payload?.repository?.full_name
    const branch = github?.context?.ref?.replace('refs/heads/', '')
    const username = github?.context?.payload?.pull_request?.user?.login
    const pullRequestLink = github?.context?.payload?.pull_request?.html_url
    const pullRequestName = github?.context?.payload?.pull_request?.title || github?.context?.payload?.pull_request?.body || 'Name not found'


    if (!repo) {
      console.log('repo is not available, skipping attestation.')
      return
    }

    if (!branch) {
      console.log('branch is not available, skipping attestation.')
      return
    }

    if (!username) {
      console.log('username is not available, skipping attestation.')
      return
    }

    if (!pullRequestLink) {
      console.log('pullRequestLink is not available, skipping attestation.')
      return
    }

    if (!pullRequestName) {
      console.log('pullRequestName is not available, skipping attestation.')
      return
    }

 
    if (!allowedBranches.includes(branch)) {
      console.log(`branch "${branch}" is not an allowed branch, skipping attestation.`)
      return
    }

    const isPullRequestMerged = !!github.context.payload.pull_request && github.context.payload.action == 'closed' && github.context.payload.pull_request.merged
    if (!isPullRequestMerged) {
      console.log('event is not a pull request merge, skipping attestation.')
      return
    }

    const githubApiClient = new GithubApiClient(gitApi);
    const [owner, repository] = repo?.split('/');
    const pullRequestCount  =  await githubApiClient.countMergedPRsByAuthor(owner, repository, username)

    if (!pullRequestCount) {
      console.log('pullRequestCount is not available, skipping attestation.')
      return
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
      pullRequestCount
    })

    const { hash, uid } = await attest({
      privateKey,
      network,
      rpcUrl,
      repo,
      branch,
      username,
      pullRequestLink,
      pullRequestName,
      pullRequestCount
    })

    console.log('Transaction hash:', hash)
    console.log('New attestation UID:', uid)

    console.log('Setting outputs...')
    core.setOutput('hash', hash)
    core.setOutput('uid', uid)

    console.log('Done!')
  } catch (err: any) {
    console.log('... an error occurred in this step.')
    core.setFailed(err.message)
  }
}

main().catch(error => core.setFailed(error.message))