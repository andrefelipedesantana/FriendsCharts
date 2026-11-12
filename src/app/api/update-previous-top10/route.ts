import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

import { editionKeyFor } from "@/lib/chart-edition";
import {
  RANKING_HISTORY_PATH,
  serializeHistory,
  withEdition,
  type RankingHistoryFile,
} from "@/lib/ranking-history";

export const dynamic = "force-dynamic";

/**
 * Salva o Top 10 exportado como snapshot da edição atual ("2026-W46").
 *
 * Só grava nas quintas-feiras (horário de Brasília), dia em que o chart é
 * publicado — exportações de teste em outros dias não mexem no histórico.
 * Gravar de novo na mesma quinta só substitui o snapshot da própria edição.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { top10, force } = body as { top10?: unknown; force?: boolean };

    if (!Array.isArray(top10) || top10.length === 0 || !top10.every((n) => typeof n === "string")) {
      return NextResponse.json(
        { error: "top10 deve ser um array não vazio com os nomes dos artistas" },
        { status: 400 }
      );
    }

    const dayOfWeek = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Sao_Paulo",
      weekday: "short",
    }).format(new Date());

    if (dayOfWeek !== "Thu" && !force) {
      return NextResponse.json({
        saved: false,
        skipped: true,
        message: "O ranking só é salvo como base da próxima semana às quintas-feiras.",
      });
    }

    const editionKey = editionKeyFor(new Date());
    const cleanTop10 = (top10 as string[]).slice(0, 10);

    // 1. Disco gravável (ambiente local / servidor próprio).
    try {
      const filePath = path.join(process.cwd(), RANKING_HISTORY_PATH);
      const current = JSON.parse(await fs.readFile(filePath, "utf-8")) as RankingHistoryFile;
      await fs.writeFile(filePath, serializeHistory(withEdition(current, editionKey, cleanTop10)), "utf-8");

      return NextResponse.json({ saved: true, method: "local_file", editionKey, top10: cleanTop10 });
    } catch (fsError) {
      console.warn("Disco somente leitura, tentando via GitHub:", fsError);
    }

    // 2. Produção (Vercel): commit no repositório, que dispara um novo deploy.
    const githubToken = process.env.GITHUB_TOKEN;
    const repoOwner = process.env.GITHUB_REPO_OWNER || "andrefelipedesantana";
    const repoName = process.env.GITHUB_REPO_NAME || "FriendsCharts";
    const branch = process.env.GITHUB_BRANCH || "main";

    if (!githubToken) {
      console.error("GITHUB_TOKEN ausente: snapshot da edição não foi salvo.", editionKey, cleanTop10);
      return NextResponse.json(
        {
          saved: false,
          editionKey,
          top10: cleanTop10,
          message: "GITHUB_TOKEN não configurado na Vercel: o ranking não foi salvo.",
        },
        { status: 503 }
      );
    }

    const contentsUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${RANKING_HISTORY_PATH}`;
    const headers = {
      Authorization: `Bearer ${githubToken}`,
      Accept: "application/vnd.github+json",
    };

    const fileRes = await fetch(`${contentsUrl}?ref=${branch}`, { headers, cache: "no-store" });
    if (!fileRes.ok) {
      throw new Error(`GitHub GET ${fileRes.status}: ${await fileRes.text()}`);
    }

    const fileData = await fileRes.json();
    const current = JSON.parse(
      Buffer.from(fileData.content, "base64").toString("utf-8")
    ) as RankingHistoryFile;

    const updateRes = await fetch(contentsUrl, {
      method: "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `chore: salva top 10 da edição ${editionKey}`,
        content: Buffer.from(
          serializeHistory(withEdition(current, editionKey, cleanTop10)),
          "utf-8"
        ).toString("base64"),
        sha: fileData.sha,
        branch,
      }),
    });

    if (!updateRes.ok) {
      throw new Error(`GitHub PUT ${updateRes.status}: ${await updateRes.text()}`);
    }

    return NextResponse.json({ saved: true, method: "github_commit", editionKey, top10: cleanTop10 });
  } catch (error) {
    console.error("Erro ao salvar o top 10 da edição:", error);
    return NextResponse.json(
      { saved: false, error: "Erro ao salvar o ranking da semana" },
      { status: 500 }
    );
  }
}
