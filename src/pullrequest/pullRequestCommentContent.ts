import {
    CommitterMap
} from '../interfaces'
import * as input from '../shared/getInputs'

export function commentContent(signed: boolean, committerMap: CommitterMap, partnerSigned: boolean): string {
    // using a `string` true or false purposely as github action input cannot have a boolean value
    console.log(signed, partnerSigned)
    if (input.getUseDcoFlag() == 'true') {
        return dco(signed, committerMap, partnerSigned)
    } else {
        return cla(signed, committerMap, partnerSigned)
    }
}

function dco(signed: boolean, committerMap: CommitterMap, partnerSigned: boolean): string {

    if (signed) {
        const line1 = input.getCustomAllSignedPrComment() || `All contributors have signed the DCO  ✍️ ✅`
        const text = `****DCO Assistant Lite bot**** ${line1}`
        return text
    }
    let committersCount = 1

    if (committerMap && committerMap.signed && committerMap.notSigned) {
        committersCount = committerMap.signed.length + committerMap.notSigned.length

    }

    let you = committersCount > 1 ? `you all` : `you`
    let lineOne = (input.getCustomNotSignedPrComment() || `<br/>Thank you for your submission, we really appreciate it. Like many open-source projects, we ask that $you sign our [Developer Certificate of Origin](${input.getPathToDocument()}) before we can accept your contribution. You can sign the DCO by just posting a Pull Request Comment same as the below format.<br/>`).replace('$you', you)
    let text = `**DCO Assistant Lite bot:** ${lineOne}
   - - -
   ${input.getCustomPrSignComment() || "I have read the DCO Document and I hereby sign the DCO"}
   - - -
   `

    if (committersCount > 1 && committerMap && committerMap.signed && committerMap.notSigned) {
        text += `**${committerMap.signed.length}** out of **${committerMap.signed.length + committerMap.notSigned.length}** committers have signed the DCO.`
        committerMap.signed.forEach(signedCommitter => { text += `<br/>:white_check_mark: @${signedCommitter.name}` })
        committerMap.notSigned.forEach(unsignedCommitter => {
            text += `<br/>:x: @${unsignedCommitter.name}`
        })
        text += '<br/>'
    }

    if (committerMap && committerMap.unknown && committerMap.unknown.length > 0) {
        let seem = committerMap.unknown.length > 1 ? "seem" : "seems"
        let committerNames = committerMap.unknown.map(committer => committer.name)
        text += `**${committerNames.join(", ")}** ${seem} not to be a GitHub user.`
        text += ' You need a GitHub account to be able to sign the DCO. If you have already a GitHub account, please [add the email address used for this commit to your account](https://help.github.com/articles/why-are-my-commits-linked-to-the-wrong-user/#commits-are-not-linked-to-any-user).<br/>'
    }

    text += '<sub>You can retrigger this bot by commenting **recheck** in this Pull Request</sub>'
    return text
}

function cla(signed: boolean, committerMap: CommitterMap, partnerSigned: boolean): string {

    if (signed && partnerSigned) {
        const line1 = input.getCustomAllSignedPrComment() || `All contributors have signed the CLA  ✍️ ✅`
        const text = `****CLA Assistant Lite bot**** ${line1}`
        return text
    }
    let committersCount = 1

    if (committerMap && committerMap.signed && committerMap.notSigned) {
        committersCount = committerMap.signed.length + committerMap.notSigned.length
    }

    let text = '**CLA Assistant Lite bot:**'

    if (!signed) {
        let you = committersCount > 1 ? `you all` : `you`
        let lineOne = (input.getCustomNotSignedPrComment() || `<br/>Thank you for your submission, we really appreciate it. Like many open-source projects, we ask that $you sign our [Contributor License Agreement](${input.getPathToDocument()}) before we can accept your contribution. You can sign the CLA by just posting a Pull Request Comment same as the below format.<br/>`).replace('$you', you)
        text += `${lineOne}
- - -
\`\`\`
${input.getCustomPrSignComment() || "I have read the CLA Document and I hereby sign the CLA"}
\`\`\`
- - -
`
    }

    if (!partnerSigned) {
        text += input.getPartnerNotInOrgComment() || `<br/> Pull request user need to join our organize as a member <br/>`
    }

    if (committersCount > 1 && committerMap && committerMap.signed && committerMap.notSigned) {
        text += `**${committerMap.signed.length}** out of **${committerMap.signed.length + committerMap.notSigned.length}** committers have signed the CLA.`
        committerMap.signed.forEach(signedCommitter => { text += `<br/>:white_check_mark: @${signedCommitter.name}` })
        committerMap.notSigned.forEach(unsignedCommitter => {
            text += `<br/>:x: @${unsignedCommitter.name}`
        })
        text += '<br/>'
    }

    if (committerMap && committerMap.unknown && committerMap.unknown.length > 0) {
        let seem = committerMap.unknown.length > 1 ? "seem" : "seems"
        let committerNames = committerMap.unknown.map(committer => committer.name)
        text += `**${committerNames.join(", ")}** ${seem} not to be a GitHub user.`
        text += ' You need a GitHub account to be able to sign the CLA. If you have already a GitHub account, please [add the email address used for this commit to your account](https://help.github.com/articles/why-are-my-commits-linked-to-the-wrong-user/#commits-are-not-linked-to-any-user).<br/>'
    }

    text += '<sub>You can retrigger this bot by commenting **recheck** in this Pull Request</sub>'
    return text
}