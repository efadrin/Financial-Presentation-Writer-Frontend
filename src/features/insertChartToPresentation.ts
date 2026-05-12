import store from '@/store';
import { apiSlice } from '@/services/apiSlice';
import { setFilledShapes, lockQuery } from '@/store/presentationInsertSlice';
import { QueryChartRequest } from '@/interfaces/QueryChart';
import { ShapeNamePrefixes } from '@/utils/constants';

export type ChartType = 'Bar' | 'Line' | 'Pie' | 'Area' | 'Column';

export interface InsertChartOptions {
  /** Target named shape (e.g. 'EFAChart1') or 'Cursor' to insert at selection */
  insertAt: string;
  queryName: string;
  chartType: ChartType;
  logScale: boolean;
  accountName: string;
  accountID: string;
  corpIDs: string;
  srvrID: string;
  languageID: string;
  userID?: string;
  firmID?: number;
  periodOffset?: string;
  devDataFlags?: string;
}

async function insertChartToPresentation(opts: InsertChartOptions): Promise<void> {
  const configObj = {
    efaCharts: [
      {
        efaChart: {
          expansionFactor: 1,
          title: '',
          forecastYears: 3,
          noForecastIfBlocked: 1,
          chartType: opts.chartType,
          ...(opts.logScale
            ? { yAxis: { y1: { logBase: 10 } } }
            : {}),
        },
      },
    ],
  };

  const req: QueryChartRequest = {
    AccountName: opts.accountName,
    AccountID: opts.accountID,
    CorpIDs: opts.corpIDs,
    QueryNames: opts.queryName,
    LanguageID: opts.languageID,
    SrvrID: String(opts.srvrID),
    UserID: opts.userID != null ? String(opts.userID) : undefined,
    FirmID: opts.firmID,
    PeriodOffset: opts.periodOffset,
    DevData: opts.devDataFlags ?? '1',
    Config: JSON.stringify(configObj),
  };

  const result = await store.dispatch(
    apiSlice.endpoints.getQueryChart.initiate(req)
  );

  if (result.error || !result.data?.Data?.[0]?.Charts?.[0]) {
    store.dispatch(
      lockQuery({
        queryId: opts.queryName,
        lock: {
          message: (result.error as any)?.data?.Message ?? 'No chart data returned.',
          insertAt: opts.insertAt,
          lockedAt: Date.now(),
        },
      })
    );
    throw new Error('Failed to retrieve chart image.');
  }

  const base64 = result.data.Data[0].Charts[0];

  if (opts.insertAt === 'Cursor') {
    await new Promise<void>((resolve, reject) => {
      Office.context.document.setSelectedDataAsync(
        base64,
        { coercionType: Office.CoercionType.Image },
        (asyncResult) => {
          if (asyncResult.status === Office.AsyncResultStatus.Succeeded) resolve();
          else reject(new Error(asyncResult.error?.message ?? 'Failed to insert image at cursor'));
        }
      );
    });
    return;
  }

  await PowerPoint.run(async (context) => {
    const slides = context.presentation.slides;
    slides.load('items');
    await context.sync();

    // Replace a named shape
    for (const slide of slides.items) {
      const shapes = slide.shapes;
      shapes.load('items');
      await context.sync();

      for (const shape of shapes.items) {
        shape.load('name,left,top,width,height');
        await context.sync();

        if (shape.name === opts.insertAt) {
          const { left, top, width, height } = shape;
          shape.delete();
          await context.sync();

          const newShape = slide.shapes.addImage(base64);
          newShape.left = left;
          newShape.top = top;
          newShape.width = width;
          newShape.height = height;
          newShape.name = opts.insertAt;
          newShape.tags.add(
            ShapeNamePrefixes.EFA_FILLED_TAG_KEY,
            ShapeNamePrefixes.EFA_FILLED_TAG_VALUE
          );
          await context.sync();
          break;
        }
      }
    }
  });

  // Update filledShapes in Redux
  const currentFilled = store.getState().presentationInsert.filledShapes;
  if (!currentFilled.includes(opts.insertAt)) {
    store.dispatch(setFilledShapes([...currentFilled, opts.insertAt]));
  }
}

export default insertChartToPresentation;
