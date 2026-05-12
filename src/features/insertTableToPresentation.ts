import store from '@/store';
import { apiSlice } from '@/services/apiSlice';
import { setFilledShapes, lockQuery } from '@/store/presentationInsertSlice';
import { FinancialTableRequest } from '@/interfaces/FinancialTable';
import { ShapeNamePrefixes } from '@/utils/constants';

export interface InsertTableOptions {
  /** Target named shape (e.g. 'EFATable1') or 'Cursor' to insert at selection */
  insertAt: string;
  queryName: string;
  accountName: string;
  accountID: string;
  corpIDs: string;
  srvrID: string;
  languageID: string;
  userID: string;
  firmID?: number;
  periodOffset?: string;
  wordID?: string;
  priceDate?: string;
  devDataFlags?: string;
}

async function insertTableToPresentation(opts: InsertTableOptions): Promise<void> {
  const req: FinancialTableRequest = {
    ApiName: 'EFAMVQueryPreDefMulti_WithCorpsForecastYears',
    AccountName: opts.accountName,
    UserID: String(opts.userID),
    CorpIDs: opts.corpIDs,
    QueryNames: opts.queryName,
    ForceUnits: '',
    ForceAnnualise: '',
    ForceAnnMonth: '',
    NumberOfForecastYears: '3',
    UseInterimTables: '0',
    DevDataFlags: opts.devDataFlags ?? '1',
    PriceDate: opts.priceDate ?? '',
    IsCorpNote: '1',
    LanguageID: opts.languageID,
    OutputFormat: '1',
    SrvrID: String(opts.srvrID),
    WordID: opts.wordID ?? '0',
    FirmID: opts.firmID,
    PeriodOffset: opts.periodOffset,
  };

  const result = await store.dispatch(
    apiSlice.endpoints.getFinancialTableImage.initiate(req)
  );

  if (result.error || !result.data?.[0]?.Base64) {
    store.dispatch(
      lockQuery({
        queryId: opts.queryName,
        lock: {
          message: (result.error as any)?.data?.Message ?? 'No table image returned.',
          insertAt: opts.insertAt,
          lockedAt: Date.now(),
        },
      })
    );
    throw new Error('Failed to retrieve table image.');
  }

  const base64 = result.data[0].Base64;

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

  const currentFilled = store.getState().presentationInsert.filledShapes;
  if (!currentFilled.includes(opts.insertAt)) {
    store.dispatch(setFilledShapes([...currentFilled, opts.insertAt]));
  }
}

export default insertTableToPresentation;
