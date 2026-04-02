import { registerBundledSkill } from '../bundledSkills.js'
import { SKILL_MD, SKILL_FILES } from './bughuntContent.js'

const DESCRIPTION = 'Find security vulnerabilities through systematic testing, code analysis, and exploitation validation. Covers SQLi, XSS, SSRF, RCE, IDOR, and more.'

export function registerBughuntSkill(): void {
  registerBundledSkill({
    name: 'bughunt',
    description: DESCRIPTION,
    userInvocable: true,
    files: SKILL_FILES,
    async getPromptForCommand(args) {
      const parts: string[] = [SKILL_MD.trimStart()]
      if (args) {
        parts.push(`## User Request\n\n${args}`)
      }
      return [{ type: 'text', text: parts.join('\n\n') }]
    },
  })
}
