import { CommittersDetails } from './interfaces'

import * as _ from 'lodash'
import * as input from './shared/getInputs'


function isUserNotInAllowList(committer) {

    const allowListPatterns: string[] = input.getAllowListItem().split(',')

    return allowListPatterns.filter(function (pattern) {
        pattern = pattern.trim()
        if (pattern.includes('*')) {
            const regex = _.escapeRegExp(pattern).split('\\*').join('.*')

            return new RegExp(regex).test(committer)
        }
        return pattern === committer
    }).length > 0
}

export function isUserNotUsedAllowdSuffixEmail(committer, allowListPatterns: string[]) {
    return allowListPatterns.filter(function (pattern) {
        pattern = pattern.trim()
        if (pattern.includes('@')) {
            if (pattern.includes('*')) {
                const regex = _.escapeRegExp(pattern).split('\\*').join('.*')

                return new RegExp(regex).test(committer)
            }
            return pattern == committer
        }
    }).length > 0

}

export function checkAllowList(committers: CommittersDetails[]): CommittersDetails[] {

    const allowListPatterns: string[] = input.getAllowEmailSuffix().split(',')

    const committersAfterAllowListCheck: CommittersDetails[] = committers.filter(committer => 
        committer && (
            !(isUserNotInAllowList !== undefined && isUserNotInAllowList(committer.name) || 
            isUserNotUsedAllowdSuffixEmail !== undefined && isUserNotUsedAllowdSuffixEmail(committer.email, allowListPatterns))
        )
    )
    return committersAfterAllowListCheck
}
