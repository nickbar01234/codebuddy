export type ProblemMeta = {
  id: string;
  title: string;
  slug: string;
  difficulty: "Easy" | "Medium" | "Hard" | string;
  tags: string[];
  url: string;
};

export enum Code {
  SUCCESS = "SUCCESS",
  NOT_FOUND = "NOT_FOUND",
  BAD_RESPONSE = "BAD_RESPONSE",
  NETWORK_ERROR = "NETWORK_ERROR",
}

export type MetaResult =
  | { code: Code.SUCCESS; data: ProblemMeta }
  | {
      code: Code.NOT_FOUND | Code.BAD_RESPONSE | Code.NETWORK_ERROR;
      message: string;
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
): Promise<MetaResult> {
  try {
    const r = await fetch(LC_GRAPHQL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        query: DETAIL_QUERY,
        variables: { titleSlug: slug },
      }),
    });

    if (!r.ok) {
      return { code: Code.BAD_RESPONSE, message: `HTTP ${r.status}` };
    }

    const json = await r.json().catch(() => null);
    const q = json?.data?.question;
    if (!q) {
      return { code: Code.NOT_FOUND, message: "No question returned" };
    }

    return {
      code: Code.SUCCESS,
      data: {
        id: q.questionFrontendId,
        title: q.title,
        slug: q.titleSlug,
        difficulty: q.difficulty,
        tags: (q.topicTags || []).map((t: any) => t.name),
        url: `https://leetcode.com/problems/${q.titleSlug}/`,
      },
    };
  } catch (e: any) {
    return { code: Code.NETWORK_ERROR, message: String(e?.message ?? e) };
  }
}
