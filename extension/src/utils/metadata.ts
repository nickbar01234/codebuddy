export type ProblemMeta = {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
  tags: string[];
  url: string;
};

const LC_GRAPHQL = "https://leetcode.com/graphql";

const DETAIL_QUERY = `
query question($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionFrontendId
    title
    titleSlug
    difficulty
    topicTags { name slug }
  }
}`;

export async function getProblemMetaBySlugServer(
  slug: string
): Promise<ProblemMeta> {
  const r = await fetch(LC_GRAPHQL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      query: DETAIL_QUERY,
      variables: { titleSlug: slug },
    }),
  });
  if (!r.ok) throw new Error(`LeetCode GraphQL failed: ${r.status}`);
  const data = (await r.json()).data?.question;
  if (!data) throw new Error("LeetCode GraphQL returned no question");
  return {
    id: data.questionFrontendId,
    title: data.title,
    slug: data.titleSlug,
    difficulty: data.difficulty,
    tags: data.topicTags.map((t: any) => t.name),
    url: `https://leetcode.com/problems/${data.titleSlug}/`,
  };
}
