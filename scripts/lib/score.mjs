export function scoreIdea(scores) {
  const positive =
    scores.searchIntent * 0.25 +
    scores.payoutPotential * 0.25 +
    scores.authorityFit * 0.2 +
    scores.implementationEase * 0.15
  const defensive =
    (6 - scores.competition) * 0.1 +
    (6 - scores.maintenanceCost) * 0.05
  return Math.round((positive + defensive) * 20)
}
