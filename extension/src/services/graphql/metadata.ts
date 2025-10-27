import { Question } from "@cb/types";

export enum GetProblemMetadataBySlugServerCode {
  SUCCESS = "SUCCESS",
  NOT_FOUND = "NOT_FOUND",
  BAD_RESPONSE = "BAD_RESPONSE",
  NETWORK_ERROR = "NETWORK_ERROR",
}

export type GetProblemMetadataBySlugServerResponse =
  | {
      code: GetProblemMetadataBySlugServerCode.SUCCESS;
      data: Question;
    }
  | {
      code:
        | GetProblemMetadataBySlugServerCode.NOT_FOUND
        | GetProblemMetadataBySlugServerCode.BAD_RESPONSE
        | GetProblemMetadataBySlugServerCode.NETWORK_ERROR;
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
    codeSnippets { langSlug code }
    exampleTestcases
    content
  }
}`;

export async function getProblemMetaBySlugServer(
  slug: string
): Promise<GetProblemMetadataBySlugServerResponse> {
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
      return {
        code: GetProblemMetadataBySlugServerCode.BAD_RESPONSE,
        message: `HTTP ${r.status}`,
      };
    }

    const json = await r.json().catch(() => null);
    const q = json?.data?.question;
    if (!q) {
      return {
        code: GetProblemMetadataBySlugServerCode.NOT_FOUND,
        message: "No question returned",
      };
    }

    // todo(nickbar01234): Should log if any keys we expect is undefined
    return {
      code: GetProblemMetadataBySlugServerCode.SUCCESS,
      data: {
        id: q.questionFrontendId ?? "",
        title: q.title ?? "",
        slug: q.titleSlug ?? "",
        difficulty: q.difficulty ?? "",
        tags: (q.topicTags ?? []).map((t: any) => t.name),
        url: constructUrlFromQuestionId(q.titleSlug),
        codeSnippets: q.codeSnippets ?? [],
        testSnippets: (q.exampleTestcases ?? "").split("\n"),
        variables: inferVariablesFromGraphql(q.content ?? ""),
      },
    };
  } catch (e: any) {
    return {
      code: GetProblemMetadataBySlugServerCode.NETWORK_ERROR,
      message: String(e?.message ?? e),
    };
  }
}
