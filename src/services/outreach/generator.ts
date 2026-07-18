import type { Contact } from "@/types/contact"
import type { OutreachChannel } from "@/types/contact"

export interface OutreachGeneratorInput {
  contact: Contact
  channel: OutreachChannel
  goal: string
  userBackground?: string
  targetOpportunity?: string
  callToAction?: string
  tone?: "professional" | "friendly" | "concise"
  maxLength?: number
}

export interface GeneratedOutreach {
  subject?: string
  body: string
  channel: OutreachChannel
}

function buildSystemPrompt(): string {
  return `You are a professional outreach assistant. Write genuine, ethical cold-outreach messages.

Rules:
- Be concise and respectful of the recipient's time
- Mention a real, specific reason for reaching out based on provided context
- Do NOT claim a relationship that does not exist
- Do NOT claim the recipient is responsible for hiring unless that is confirmed by context
- Do NOT use spam language or excessive flattery
- Include a single clear, low-pressure call to action
- Never fabricate information about the contact
- Keep the message under the requested word limit`
}

function buildPrompt(input: OutreachGeneratorInput): string {
  const { contact, channel, goal, userBackground, targetOpportunity, callToAction, maxLength } =
    input
  const wordLimit = maxLength ?? 200

  const contactContext = [
    `Name: ${contact.fullName}`,
    contact.title ? `Title: ${contact.title}` : null,
    contact.organization ? `Organization: ${contact.organization}` : null,
    contact.department ? `Department: ${contact.department}` : null,
    contact.summary ? `Public bio: ${contact.summary.slice(0, 300)}` : null,
    contact.profileUrl ? `Profile: ${contact.profileUrl}` : null,
  ]
    .filter(Boolean)
    .join("\n")

  return `Write a ${channel.toLowerCase().replace("_", " ")} message.

CONTACT INFORMATION (from public sources):
${contactContext}

SENDER INFORMATION:
${userBackground ? `Background: ${userBackground}` : "Not provided"}
${targetOpportunity ? `Target opportunity: ${targetOpportunity}` : ""}
${callToAction ? `Call to action: ${callToAction}` : "Politely request a brief reply or short call"}

GOAL: ${goal}

Write the message in ${input.tone ?? "professional"} tone. Maximum ${wordLimit} words.
${channel === "EMAIL" ? "Include a subject line prefixed with 'Subject:' on the first line." : ""}
Do not add a signature — the sender will add their own.`
}

export async function generateOutreachMessage(
  input: OutreachGeneratorInput
): Promise<GeneratedOutreach> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      subject:
        input.channel === "EMAIL"
          ? `${input.goal} — ${input.contact.fullName}`
          : undefined,
      body: `[Outreach generator requires ANTHROPIC_API_KEY to be configured. Set it in your .env.local file to enable AI-generated messages.]

In the meantime, here is a simple template:

Hi ${input.contact.fullName},

I came across your profile and wanted to reach out regarding ${input.goal}.

${input.userBackground ? `A bit about me: ${input.userBackground}` : ""}

${input.callToAction ?? "I would appreciate a brief reply at your convenience."}

Best regards`,
      channel: input.channel,
    }
  }

  const { default: Anthropic } = await import("@anthropic-ai/sdk")
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 600,
    system: buildSystemPrompt(),
    messages: [{ role: "user", content: buildPrompt(input) }],
  })

  const text = response.content[0].type === "text" ? response.content[0].text : ""

  if (input.channel === "EMAIL") {
    const lines = text.split("\n")
    const subjectLine = lines.find((l) => l.toLowerCase().startsWith("subject:"))
    const subject = subjectLine?.replace(/^subject:\s*/i, "").trim()
    const body = lines
      .filter((l) => !l.toLowerCase().startsWith("subject:"))
      .join("\n")
      .trim()
    return { subject, body, channel: input.channel }
  }

  return { body: text, channel: input.channel }
}
