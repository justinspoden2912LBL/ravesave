const OWNER = "justinspoden2912LBL";
const REPO = "ravesave";
const BRANCH = "main";

const ALLOWED_PREFIXES = ["src/routes/", "src/components/", "src/lib/theme.ts", "src/styles.css"];
const BLOCKED_PATHS = ["src/lib/githubPush.server.ts", "src/lib/adminDesign.functions.ts"];

export class GithubPushError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

function token(): string {
  const value = process.env.GITHUB_TOKEN?.trim();
  if (!value) throw new GithubPushError("GITHUB_TOKEN fehlt auf dem Server.", 500);
  return value;
}

export function isAllowedPath(path: string): boolean {
  if (!path || path.includes("..") || path.startsWith("/") || path.includes("\\")) return false;
  if (BLOCKED_PATHS.includes(path)) return false;
  return ALLOWED_PREFIXES.some((prefix) => path === prefix || path.startsWith(prefix));
}

async function github<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token()}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "ravesave-admin-design-studio",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new GithubPushError(`GitHub ${res.status}: ${body.slice(0, 240)}`, res.status);
  }
  return res.json() as Promise<T>;
}

export type RepoFile = { path: string; type: "file" | "dir"; size?: number; sha?: string };

export async function listRepoPath(path = "src/routes"): Promise<RepoFile[]> {
  if (!isAllowedPath(path) && path !== "src" && path !== "src/lib") {
    throw new GithubPushError("Pfad nicht erlaubt.");
  }
  const data = await github<Array<{ path: string; type: string; size?: number; sha?: string }>>(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURI(path)}?ref=${BRANCH}`,
  );
  return data
    .filter((item) => item.type === "file" || item.type === "dir")
    .map((item) => ({
      path: item.path,
      type: item.type === "dir" ? "dir" : "file",
      size: item.size,
      sha: item.sha,
    }))
    .sort((a, b) => a.path.localeCompare(b.path));
}

export async function getRepoFile(path: string): Promise<{ path: string; sha: string; content: string; size: number }> {
  if (!isAllowedPath(path)) throw new GithubPushError("Datei nicht erlaubt.");
  const data = await github<{
    sha: string;
    size: number;
    encoding: string;
    content: string;
    type: string;
  }>(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURI(path)}?ref=${BRANCH}`);
  if (data.type !== "file") throw new GithubPushError("Kein Dateiinhalt.");
  const content =
    data.encoding === "base64"
      ? Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf8")
      : data.content;
  return { path, sha: data.sha, content, size: data.size };
}

export async function pushRepoFile(path: string, content: string, message: string, sha?: string) {
  if (!isAllowedPath(path)) throw new GithubPushError("Datei nicht erlaubt.");
  const current = sha ? { sha } : await getRepoFile(path);
  const data = await github<{ commit: { sha: string; html_url: string } }>(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURI(path)}`,
    {
      method: "PUT",
      body: JSON.stringify({
        message: message.startsWith("ai-design:") ? message : `ai-design: ${message}`,
        content: Buffer.from(content, "utf8").toString("base64"),
        sha: current.sha,
        branch: BRANCH,
      }),
    },
  );
  return { sha: data.commit.sha, url: data.commit.html_url, path };
}

export function githubReady() {
  return Boolean(process.env.GITHUB_TOKEN?.trim());
}
