import { SelectProblemDialog } from "@cb/components/dialog/SelectProblemDialog";
import { Button } from "@cb/lib/components/ui/button";
import { getProblemMetaBySlugServer, ProblemMeta } from "@cb/utils/metadata";
import { Grid2X2 } from "lucide-react";
import React, { useEffect, useState } from "react";

const exampleSlugs = [
  { slug: "two-sum", timestamp: "00:01:11" },
  {
    slug: "longest-substring-without-repeating-characters",
    timestamp: "00:05:02",
  },
];

export const RoomInfoTab = () => {
  const [open, setOpen] = React.useState(false);
  const [problems, setProblems] = useState<
    (ProblemMeta & { timestamp: string })[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProblems() {
      setLoading(true);
      const metas = await Promise.all(
        exampleSlugs.map(async ({ slug, timestamp }) => {
          try {
            const meta = await getProblemMetaBySlugServer(slug);
            return { ...meta, timestamp };
          } catch {
            return {
              id: "",
              title: slug,
              slug,
              difficulty: "",
              tags: [],
              url: `https://leetcode.com/problems/${slug}/`,
              timestamp,
            };
          }
        })
      );
      setProblems(metas);
      setLoading(false);
    }
    fetchProblems();
  }, []);

  return (
    <div className="h-full w-full flex flex-col gap-4 items-center justify-center">
      <SelectProblemDialog
        trigger={{
          customTrigger: true,
          node: (
            <div className="relative inline-block">
              <Button className="bg-[#DD5471] hover:bg-[#DD5471]/80 text-white rounded-md flex items-center gap-2 px-4 py-2 font-medium">
                <Grid2X2 className="h-5 w-5 text-white" />
                Select next problem
              </Button>
              <div className="absolute -top-[0.3rem] -right-[0.3rem] w-3 h-3 bg-[#FF3B30] rounded-full border-[4px] border-background" />
            </div>
          ),
        }}
        open={open}
        setOpen={setOpen}
      />
      <div className="w-full max-w-md mt-6">
        <h2 className="font-bold text-lg mb-2">Problems</h2>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <table className="w-full text-sm border">
            <thead>
              <tr>
                <th className="text-left px-2 py-1">Title</th>
                <th className="text-left px-2 py-1">Difficulty</th>
                <th className="text-left px-2 py-1">Time</th>
                <th className="text-left px-2 py-1">Tags</th>
              </tr>
            </thead>
            <tbody>
              {problems.map((p, i) => (
                <tr key={i} className="border-t">
                  <td className="px-2 py-1">
                    <a href={p.url} target="" rel="" className="underline">
                      {p.title}
                    </a>
                  </td>
                  <td className="px-2 py-1">{p.difficulty}</td>
                  <td className="px-2 py-1">{p.timestamp}</td>
                  <td className="px-2 py-1">{p.tags.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
