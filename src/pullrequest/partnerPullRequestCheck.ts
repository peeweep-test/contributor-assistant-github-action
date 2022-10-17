import { isAppPrivateKeyPresent, isPersonalAccessTokenPresent, octokitUsingPAT, getOctokitByAppSecret } from '../octokit'
import { context } from '@actions/github'
import * as core from '@actions/core'


export async function checkPartnerPullRequestUserIsInOrg() {

    let octokit

    if (isAppPrivateKeyPresent !== undefined && isAppPrivateKeyPresent()) {
        octokit = await getOctokitByAppSecret()
    } else if (isPersonalAccessTokenPresent !== undefined && isPersonalAccessTokenPresent()) {
        octokit = octokitUsingPAT
    }

    const { data } = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}', {
        owner: context.repo.owner,
        repo: context.repo.repo,
        pull_number: context.issue.number
    })

    const username = data?.user?.login || context.issue.owner

    try {
        const res = await octokit.request('GET /orgs/{org}/memberships/{username}', {
            org: context.repo.owner,
            username: username
        })
        core.debug(res.data.role)
    } catch (err) {
        console.log(err)
        return false
    }

    return true
}


