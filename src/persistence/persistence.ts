
import { isPersonalAccessTokenPresent, isAppPrivateKeyPresent, octokit, octokitUsingPAT, getOctokitByAppSecret } from '../octokit'
import { context } from '@actions/github'

import * as input from '../shared/getInputs'
import { ReactedCommitterMap } from '../interfaces'
import * as core from '@actions/core'

const { GITHUB_REPOSITORY, GITHUB_SHA } = process.env;

let octokitInstance

async function initOctokitInstance() {
    if (input?.getRemoteRepoName() || input.getRemoteOrgName()) {
        if (isPersonalAccessTokenPresent()) {
            octokitInstance = octokitUsingPAT
        } else if (isAppPrivateKeyPresent()) {
            octokitInstance = await getOctokitByAppSecret()
        }
    } else {
        octokitInstance = octokit
    }
}

export async function getFileContent(): Promise<any> {
    if (octokitInstance === undefined) await initOctokitInstance()
    const result = await octokitInstance.repos.getContent({
        owner: input.getRemoteOrgName() || context.repo.owner,
        repo: input.getRemoteRepoName() || context.repo.repo,
        path: input.getPathToSignatures(),
        ref: input.getBranch()
    })
    return result
}

export async function createFile(contentBinary): Promise<any> {
    if (octokitInstance === undefined) await initOctokitInstance()
    return octokitInstance.repos.createOrUpdateFileContents({
        owner: input.getRemoteOrgName() || context.repo.owner,
        repo: input.getRemoteRepoName() || context.repo.repo,
        path: input.getPathToSignatures(),
        message: input.getCreateFileCommitMessage() || 'Creating file for storing CLA Signatures',
        content: contentBinary,
        branch: input.getBranch()
    })
}

export async function updateFile(sha: string, claFileContent, reactedCommitters: ReactedCommitterMap): Promise<any> {
    const pullRequestNo = context.issue.number.toString()
    let users = ""
    reactedCommitters.newSigned.forEach(user => {
        users += "@" + user.name + " "
    })
    users = users.trim()
    claFileContent?.signedContributors.push(...reactedCommitters.newSigned)
    let contentString = JSON.stringify(claFileContent, null, 2)
    const url = pullRequestNo && `https://github.com/${ GITHUB_REPOSITORY }/pull/${ pullRequestNo.trim() }`;
    let contentBinary = Buffer.from(contentString).toString("base64")
    if (octokitInstance === undefined) await initOctokitInstance()
    await octokitInstance.repos.createOrUpdateFileContents({
        owner: input.getRemoteOrgName() || context.repo.owner,
        repo: input.getRemoteRepoName() || context.repo.repo,
        path: input.getPathToSignatures(),
        sha,
        message: input.getSignedCommitMessage() ?
            input.getSignedCommitMessage().replace('$contributorName', users).replace('$pullRequestNo', url) :
            `${users} has signed the CLA from Pull Request ${url}`,
        content: contentBinary,
        branch: input.getBranch()
    })
}