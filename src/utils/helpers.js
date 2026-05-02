/**
 * Strip common markdown formatting from AI-generated review text so it
 * displays as plain natural text in the UI.
 */
export function stripMarkdown(text) {
  if (!text || typeof text !== 'string') return ''
  let result = text
    .replace(/\*\*(.+?)\*\*/gs, '$1')      // **bold** → plain
    .replace(/\*(.+?)\*/gs, '$1')          // *italic* → plain
    .replace(/^#{1,6}\s+/gm, '')           // ### headings
    .replace(/^(?:Review\s*\d+\s*[:\-]?\s*)/gim, '') // "Review 1:" labels
    .replace(/^\d+[\.\)]\s+/gm, '')        // "1. " numbered lists
    .replace(/^[-*•]\s+/gm, '')            // bullet list markers
    .replace(/`(.+?)`/gs, '$1')            // `inline code`
    .trim()
  // Keep stripping balanced wrapping quotes until none remain
  while (
    (result.startsWith('"') && result.endsWith('"')) ||
    (result.startsWith("'") && result.endsWith("'"))
  ) {
    result = result.slice(1, -1).trim()
  }
  return result
}
