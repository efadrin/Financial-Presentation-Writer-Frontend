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
}

async function insertTableToPresentation(opts: InsertTableOptions): Promise<void> {
  const req: FinancialTableRequest = {
    ApiName: 'EFAFinancialTableImage',
    AccountName: opts.accountName,
    UserID: opts.userID,
    CorpIDs: opts.corpIDs,
    QueryNames: opts.queryName,
    ForceUnits: '',
    ForceAnnualise: '0',
    ForceAnnMonth: '0',
    UseInterimTables: '0',
    DevDataFlags: '',
    PriceDate: opts.priceDate ?? '',
    IsCorpNote: '0',
    LanguageID: opts.languageID,
    OutputFormat: 'PNG',
    SrvrID: opts.srvrID,
    WordID: opts.wordID ?? '',
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

  await PowerPoint.run(async (context) => {
    const slides = context.presentation.slides;
    slides.load('items');
    await context.sync();

    if (opts.insertAt === 'Cursor') {
      const slide = slides.items[0];
      slide.load('width,height');
      await context.sync();

      const image = slide.shapes.addImage(base64);
      image.left = 0;
      image.top = 0;
      image.width = (slide as any).width ?? 960;
      image.height = (slide as any).height ?? 540;
      await context.sync();
    } else {
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
    }
  });

  const currentFilled = store.getState().presentationInsert.filledShapes;
  if (!currentFilled.includes(opts.insertAt) && opts.insertAt !== 'Cursor') {
    store.dispatch(setFilledShapes([...currentFilled, opts.insertAt]));
  }
}

export default insertTableToPresentation;
