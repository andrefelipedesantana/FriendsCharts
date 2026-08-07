import { toPng } from "html-to-image";

const IMAGE_SETTLE_TIMEOUT = 20_000;
const CHART_BACKGROUND = "#06110c";

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Espera cada `<img>` do nó terminar — carregada ou com erro. Erro também
 * "assenta": o fallback tipográfico entra no lugar e a peça continua íntegra.
 * Devolve quantas falharam.
 */
export async function settleImages(node: HTMLElement, timeout = IMAGE_SETTLE_TIMEOUT) {
  const images = Array.from(node.querySelectorAll("img"));

  const pending = images.map(
    (image) =>
      new Promise<boolean>((resolve) => {
        if (image.complete) {
          resolve(image.naturalWidth > 0);
          return;
        }

        const finish = (ok: boolean) => {
          image.removeEventListener("load", onLoad);
          image.removeEventListener("error", onError);
          resolve(ok);
        };
        const onLoad = () => finish(true);
        const onError = () => finish(false);

        image.addEventListener("load", onLoad);
        image.addEventListener("error", onError);
      })
  );

  const results = await Promise.race([
    Promise.all(pending),
    delay(timeout).then(() => images.map((image) => image.complete && image.naturalWidth > 0)),
  ]);

  return results.filter((ok) => !ok).length;
}

export type ExportChartOptions = {
  /** Largura final em CSS px; o nó precisa estar renderizado nesta largura. */
  width: number;
  pixelRatio?: number;
};

/**
 * Rasteriza o nó da prévia — o mesmo que o usuário vê — em PNG.
 *
 * O nó é medido pelo layout (`offsetWidth/Height`), então uma escala de
 * pré-visualização aplicada por um ancestral não afeta a saída: a imagem sai
 * sempre na largura definida em `width`.
 */
export async function exportChartToPng(node: HTMLElement, options: ExportChartOptions) {
  const { width, pixelRatio = 2 } = options;

  if (typeof document !== "undefined" && document.fonts) {
    try {
      await document.fonts.ready;
    } catch {
      // Tipografia indisponível não impede a exportação.
    }
  }

  await settleImages(node);

  // O nó é renderizado na largura de exportação; a altura acompanha o conteúdo
  // para que nomes longos estiquem a peça em vez de serem cortados.
  const height = Math.ceil(node.offsetHeight);

  const dataUrl = await toPng(node, {
    width,
    height,
    pixelRatio,
    cacheBust: true,
    backgroundColor: CHART_BACKGROUND,
    // Controles de interface (upload da foto) não entram na imagem.
    filter: (domNode) => {
      const element = domNode as HTMLElement;
      return !element?.dataset || !("exportHide" in element.dataset);
    },
    style: {
      transform: "none",
      transformOrigin: "top left",
      margin: "0",
    },
  });

  if (!dataUrl || dataUrl === "data:,") {
    throw new Error("A imagem saiu vazia.");
  }

  return { dataUrl, height };
}

export function downloadDataUrl(dataUrl: string, fileName: string) {
  const link = document.createElement("a");
  link.download = fileName;
  link.href = dataUrl;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function chartFileName(isoEnd: string) {
  return `friendcharts-charts-${isoEnd}.png`;
}
