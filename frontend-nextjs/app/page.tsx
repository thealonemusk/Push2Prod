"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Github } from "lucide-react";
import { Fira_Code } from "next/font/google";
import axios from "axios";

const socket = io("http://localhost:9002");

const firaCode = Fira_Code({ subsets: ["latin"] });

export default function Home() {
  const [repoURL, setURL] = useState<string>("");
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [projectId, setProjectId] = useState<string | undefined>();
  const [deployPreviewURL, setDeployPreviewURL] = useState<string | undefined>();
  const [branch, setBranch] = useState<string>("");
  const [commit, setCommit] = useState<string>("");
  const logContainerRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const isValidURL: [boolean, string | null] = useMemo(() => {
    if (!repoURL.trim()) return [false, null];
    const regex = new RegExp(
      /^(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/]+)\/([^\/]+)(?:\/)?$/
    );
    return [regex.test(repoURL), "Enter a valid GitHub Repository URL"];
  }, [repoURL]);

  const handleClickDeploy = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.post("http://localhost:9000/project", {
        gitURL: repoURL,
        branch: branch.trim() ? branch.trim() : undefined,
        commit: commit.trim() ? commit.trim() : undefined,
      });

      if (data && data.data) {
        const { projectSlug, url } = data.data;
        setProjectId(projectSlug);
        setDeployPreviewURL(url);
        socket.emit("subscribe", `logs:${projectSlug}`);
      }
    } catch (error) {
      console.error("Deployment error:", error);
      alert("Failed to deploy. Check the console for more details.");
    } finally {
      setLoading(false);
    }
  }, [repoURL, branch, commit]);

  const copyToClipboard = useCallback(async (text?: string) => {
    const value = text ?? deployPreviewURL ?? projectId ?? "";
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(value);
      setTimeout(() => setCopied(null), 2500);
    } catch (e) {
      console.error('copy failed', e);
    }
  }, [deployPreviewURL, projectId]);

  const handleSocketIncomingMessage = useCallback((message: string) => {
    try {
      const { log } = JSON.parse(message);
      setLogs((prev) => [...prev, log]);
      logContainerRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      console.error("Error parsing socket message:", error);
    }
  }, []);

  useEffect(() => {
    socket.on("message", handleSocketIncomingMessage);

    return () => {
      socket.off("message", handleSocketIncomingMessage);
    };
  }, [handleSocketIncomingMessage]);

  const showLogs = Boolean(loading || projectId);

  return (
    <main className="min-h-[100vh] flex items-center justify-center py-16 bg-black text-white">
      <div className="w-[900px]">
        <header className="relative flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-md bg-gradient-to-br from-white/6 to-transparent glass-card">
              <Github className="text-5xl neon-text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold neon-text-primary">Push2Prod</h1>
              <p className="text-sm text-white/60">Deploy branches or specific commits — instant previews.</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-white/50">Socket</div>
            <div className="text-sm text-white/80">http://localhost:9002</div>
          </div>

          {/* Decorative neon ornament */}
          <svg className="neon-ornament neon-spin w-40 h-40 right-6 top-[-16px] absolute" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="rgba(0,255,217,0.85)" />
                <stop offset="100%" stopColor="rgba(0,255,100,0.45)" />
              </linearGradient>
            </defs>
            <circle cx="100" cy="100" r="60" fill="url(#g1)" opacity="0.12" />
          </svg>
        </header>

        <section className={showLogs ? "grid grid-cols-2 gap-6" : "grid grid-cols-1 gap-6 place-items-center"}>
          <div className="glass-card-strong p-6 relative w-full max-w-[720px]">
            <h2 className="text-lg font-medium mb-3">Deploy</h2>
            <label className="text-xs text-white/60">Repository (GitHub)</label>
            <Input
              disabled={loading}
              value={repoURL}
              onChange={(e) => setURL(e.target.value)}
              type="url"
              placeholder="https://github.com/owner/repo"
              className="mt-2 mb-3 input-neon"
            />

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-white/70">Branch (optional)</label>
                <Input
                  disabled={loading}
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  type="text"
                  placeholder="main"
                  className="mt-2 input-neon"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-white/70">Commit SHA (optional)</label>
                <Input
                  disabled={loading}
                  value={commit}
                  onChange={(e) => setCommit(e.target.value)}
                  type="text"
                  placeholder="e.g. 1a2b3c4d"
                  className="mt-2 input-neon"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <Button
                onClick={handleClickDeploy}
                disabled={!isValidURL[0] || loading}
                className="px-6 btn-neon"
              >
                {loading ? "In Progress" : "Deploy"}
              </Button>
              {projectId && (
                <div className="ml-auto flex items-center gap-2 text-sm text-white/80">
                  <div>Project:</div>
                  <div className="px-3 py-1 rounded-md bg-white/6 border border-white/6 neon-text-primary">{projectId}</div>
                  <Button onClick={() => copyToClipboard(projectId)} className="px-3 btn-outline-neon">Copy</Button>
                </div>
              )}
            </div>

            {deployPreviewURL && (
              <div className="mt-4 p-3 rounded-md flex items-center justify-between glass-card">
                <div className="text-sm break-words neon-text-primary">{deployPreviewURL}</div>
                <div className="flex items-center gap-2">
                  <a target="_blank" rel="noopener noreferrer" className="neon-text-secondary underline" href={deployPreviewURL}>Open</a>
                  <Button onClick={() => copyToClipboard(deployPreviewURL)} className="btn-outline-neon px-3">Copy</Button>
                </div>
              </div>
            )}

            {copied && <div className="text-xs text-green-400 mt-2">Copied to clipboard</div>}
          </div>

          {showLogs && (
            <div className="glass-card p-6 col-span-1 relative">
              <h2 className="text-lg font-medium mb-3 neon-text-primary">Build Logs</h2>
              <div className={`${firaCode.className} text-sm text-green-300 logs-container border border-white/6 rounded-lg p-3 h-[420px] overflow-y-auto bg-gradient-to-b from-transparent to-black/30`}>
                <pre className="flex flex-col gap-2">
                  {logs.length === 0 && <div className="text-white/60">No logs yet. Deployment queued — waiting for build to start.</div>}
                  {logs.map((log, i) => (
                    <code key={i} ref={logs.length - 1 === i ? logContainerRef : undefined} className="whitespace-pre-wrap">
                      {`[${new Date().toLocaleTimeString()}] ${log}`}
                    </code>
                  ))}
                </pre>
              </div>

              {/* subtle neon ring */}
              <div className="absolute -right-10 -bottom-10 w-36 h-36 rounded-full neon-ring" />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

