import { isAppPrivateKeyPresent, isPersonalAccessTokenPresent, octokitUsingPAT, getOctokitByAppSecret } from '../octokit'
import { context } from '@actions/github'
import * as core from '@actions/core'
const yaml = require('js-yaml');

export const partnerEmailSuffix = new Set<string>()
export const partnerAllMemberIds= new Map<string, string>()
let partnerSigned

export async function checkPartnerPullRequestUserIsInOrg() {

    // cache status, scripts onely run in a short time(a few seconds), no need to refresh it.
    if (partnerSigned !== undefined) {
        return partnerSigned
    }

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

    const userid = data?.user?.id

    core.debug(userid)
    core.debug("parter in team ids:")
    for (let id of partnerAllMemberIds.keys()) {
        core.debug(id)
    }

    core.debug(data?.user?.login + " is in " + partnerAllMemberIds.get(userid))

    partnerSigned = partnerAllMemberIds.has(userid)

    return partnerAllMemberIds.has(userid)
}

export async function initParnterData() {
    let octokit

    if (isAppPrivateKeyPresent !== undefined && isAppPrivateKeyPresent()) {
        octokit = await getOctokitByAppSecret()
    } else if (isPersonalAccessTokenPresent !== undefined && isPersonalAccessTokenPresent()) {
        octokit = octokitUsingPAT
    }

    const parentDataOwner = "deepin-community"
    const parentDataRepo  = "SIG"

    // a parnet config path is 'corporation/{partner}/metadata.yml'
    const parentDataPath = "corporation"
    const parentDataFile = "/metadata.yml"

    let partners = await octokit.repos.getContent({
        owner: parentDataOwner,
        repo: parentDataRepo,
        path: parentDataPath
    })

    for (let i =0; i < partners.data.length; i++) {
        let partnerDataContent = await octokit.repos.getContent({
            owner: parentDataOwner,
            repo: parentDataRepo,
            path: partners.data[i].path + parentDataFile,
        })

        let datas = Buffer.from(partnerDataContent.data.content, partnerDataContent.data.encoding)
        let partnerData = yaml.load(datas.toString())
        partnerData['email-suffix'].toString().split(';').forEach(emailSuffix=> {
            core.debug("add " + emailSuffix + " into partner email suffix")
            partnerEmailSuffix.add('*' + emailSuffix)
            partnerData['members'].forEach( member => {
                if (member.id !== undefined) {
                    partnerAllMemberIds.set(member.id, partnerData['name'])
                }
            })
        })
    }
}
