import { ShapeNamePrefixes } from '@/utils/constants';

export interface ScannedShapes {
  chartShapes: string[];
  tableShapes: string[];
  filledShapes: string[];
}

/**
 * Scans all slides in the active presentation for EFA-named shapes.
 * - Chart shapes: names starting with "EFAChart" (case-insensitive), excluding "…Header" suffix.
 * - Table shapes: names starting with "EFATable" (case-insensitive), excluding "…Header" suffix.
 * - Filled shapes: shapes tagged with EFAFilled === '1'.
 * Within each category, shapes are sorted by their numeric suffix ascending.
 */
async function scanPresentationShapes(): Promise<ScannedShapes> {
  return PowerPoint.run(async (context) => {
    const slides = context.presentation.slides;
    slides.load('items');
    await context.sync();

    const chartShapes: { name: string; num: number }[] = [];
    const tableShapes: { name: string; num: number }[] = [];
    const filledShapes: string[] = [];

    for (const slide of slides.items) {
      const shapes = slide.shapes;
      shapes.load('items');
      await context.sync();

      for (const shape of shapes.items) {
        shape.load('name');
        await context.sync();

        const name: string = shape.name ?? '';
        const lower = name.toLowerCase();

        const isHeaderSuffix = lower.endsWith(ShapeNamePrefixes.EFA_HEADER_SUFFIX.toLowerCase());

        if (!isHeaderSuffix) {
          if (lower.startsWith(ShapeNamePrefixes.EFA_CHART.toLowerCase())) {
            const suffix = name.slice(ShapeNamePrefixes.EFA_CHART.length);
            const num = extractTrailingNumber(suffix);
            chartShapes.push({ name, num });
          } else if (lower.startsWith(ShapeNamePrefixes.EFA_TABLE.toLowerCase())) {
            const suffix = name.slice(ShapeNamePrefixes.EFA_TABLE.length);
            const num = extractTrailingNumber(suffix);
            tableShapes.push({ name, num });
          }
        }

        // Check filled tag
        try {
          const tags = shape.tags;
          tags.load('items');
          await context.sync();
          for (const tag of tags.items) {
            tag.load('key,value');
            await context.sync();
            if (
              tag.key === ShapeNamePrefixes.EFA_FILLED_TAG_KEY &&
              tag.value === ShapeNamePrefixes.EFA_FILLED_TAG_VALUE
            ) {
              filledShapes.push(name);
              break;
            }
          }
        } catch {
          // Tags not supported on this shape type — skip
        }
      }
    }

    chartShapes.sort((a, b) => a.num - b.num);
    tableShapes.sort((a, b) => a.num - b.num);

    return {
      chartShapes: chartShapes.map((s) => s.name),
      tableShapes: tableShapes.map((s) => s.name),
      filledShapes,
    };
  });
}

function extractTrailingNumber(suffix: string): number {
  const m = /(\d+)\s*$/.exec(suffix);
  return m ? parseInt(m[1], 10) : 0;
}

export default scanPresentationShapes;
