import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { top10, force } = body;

    if (!Array.isArray(top10) || top10.length === 0) {
      return NextResponse.json(
        { error: "top10 deve ser um array não vazio com os nomes dos artistas" },
        { status: 400 }
      );
    }

    // Verifica se é quinta-feira no horário de Brasília (UTC-3), a menos que forçado
    const dayOfWeek = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Sao_Paulo",
      weekday: "short",
    }).format(new Date());

    if (dayOfWeek !== "Thu" && !force) {
      return NextResponse.json({
        skipped: true,
        message: "A atualização automática só ocorre nas quintas-feiras.",
      });
    }

    const cleanTop10 = top10.slice(0, 10);
    const filePath = path.join(process.cwd(), "src", "constants", "index.ts");

    // 1. Tenta atualizar diretamente o arquivo localmente (em desenvolvimento / servidor com disco gravável)
    try {
      let content = await fs.readFile(filePath, "utf-8");
      const formatted = JSON.stringify(cleanTop10, null, 2);
      const regex = /export const PREVIOUS_TOP_10 = \[[\s\S]*?\];/;

      if (regex.test(content)) {
        content = content.replace(regex, `export const PREVIOUS_TOP_10 = ${formatted};`);
        await fs.writeFile(filePath, content, "utf-8");

        return NextResponse.json({
          success: true,
          method: "local_file",
          message: "Array PREVIOUS_TOP_10 atualizado com sucesso em src/constants/index.ts!",
          top10: cleanTop10,
        });
      }
    } catch (fsError) {
      console.warn("Aviso: Falha ao gravar localmente (ambiente read-only / Vercel):", fsError);
    }

    // 2. Se estiver em produção (Vercel) e houver GITHUB_TOKEN configurado, comita no repositório
    const githubToken = process.env.GITHUB_TOKEN;
    const repoOwner = process.env.GITHUB_REPO_OWNER || "andrefelipedesantana";
    const repoName = process.env.GITHUB_REPO_NAME || "FriendsCharts";

    if (githubToken) {
      try {
        const fileRes = await fetch(
          `https://api.github.com/repos/${repoOwner}/${repoName}/contents/src/constants/index.ts`,
          {
            headers: {
              Authorization: `Bearer ${githubToken}`,
              Accept: "application/vnd.github.v3+json",
            },
          }
        );

        if (fileRes.ok) {
          const fileData = await fileRes.json();
          const currentContent = Buffer.from(fileData.content, "base64").toString("utf-8");
          const formatted = JSON.stringify(cleanTop10, null, 2);
          const regex = /export const PREVIOUS_TOP_10 = \[[\s\S]*?\];/;

          if (regex.test(currentContent)) {
            const newContent = currentContent.replace(
              regex,
              `export const PREVIOUS_TOP_10 = ${formatted};`
            );

            const updateRes = await fetch(
              `https://api.github.com/repos/${repoOwner}/${repoName}/contents/src/constants/index.ts`,
              {
                method: "PUT",
                headers: {
                  Authorization: `Bearer ${githubToken}`,
                  Accept: "application/vnd.github.v3+json",
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  message: `chore: atualiza PREVIOUS_TOP_10 da semana`,
                  content: Buffer.from(newContent, "utf-8").toString("base64"),
                  sha: fileData.sha,
                }),
              }
            );

            if (updateRes.ok) {
              return NextResponse.json({
                success: true,
                method: "github_commit",
                message: "Ranking atualizado no GitHub e novo deploy disparado automaticamente!",
                top10: cleanTop10,
              });
            }
          }
        }
      } catch (ghError) {
        console.error("Erro ao atualizar via GitHub API:", ghError);
      }
    }

    // Se estiver em ambiente read-only sem GITHUB_TOKEN, retorna instruções amigáveis
    return NextResponse.json({
      success: false,
      readOnly: true,
      message: "Ambiente de produção em modo somente leitura.",
      top10: cleanTop10,
    });
  } catch (error) {
    console.error("Erro ao atualizar PREVIOUS_TOP_10:", error);
    return NextResponse.json({ error: "Erro interno ao atualizar ranking" }, { status: 500 });
  }
}
