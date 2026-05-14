/**
 * PowerPoint-specific document utilities.
 */
import JSZip from 'jszip';

/**
 * Extract the raw XML from /docProps/custom.xml inside a base64-encoded PPTX.
 * Returns null if the file doesn't contain custom properties or if parsing fails.
 */
async function extractCustomPropertiesXml(base64Data: string): Promise<string | null> {
  try {
    const zip = await JSZip.loadAsync(base64Data, { base64: true });
    const customPropsFile = zip.file('docProps/custom.xml');
    if (!customPropsFile) {
      console.log('[documentOpenUtils] No docProps/custom.xml found in source PPTX');
      return null;
    }
    const xml = await customPropsFile.async('string');
    console.log('[documentOpenUtils] Extracted custom properties XML from source PPTX:', xml);
    return xml;
  } catch (err) {
    console.error('[documentOpenUtils] Failed to extract custom properties XML:', err);
    return null;
  }
}

/**
 * Inject (or replace) /docProps/custom.xml inside a base64-encoded PPTX blob.
 * Also ensures [Content_Types].xml and _rels/.rels declare the custom-properties
 * part, which is required for PowerPoint and the EFA backend to recognise the
 * embedded properties.
 *
 * This is the correct way to persist custom document properties: the
 * customXmlParts Office.js API writes to /customXml/ (a different OOXML
 * location that PowerPoint does not surface as document properties).
 */
export async function injectCustomPropertiesIntoBlob(
  base64Pptx: string,
  customPropsXml: string
): Promise<string> {
  const zip = await JSZip.loadAsync(base64Pptx, { base64: true });

  // 1. Write (or replace) docProps/custom.xml
  zip.file('docProps/custom.xml', customPropsXml);

  // 2. Ensure [Content_Types].xml declares the custom-properties part
  const ctFile = zip.file('[Content_Types].xml');
  if (ctFile) {
    let ct = await ctFile.async('string');
    if (!ct.includes('PartName="/docProps/custom.xml"')) {
      ct = ct.replace(
        '</Types>',
        '<Override PartName="/docProps/custom.xml" ContentType="application/vnd.openxmlformats-officedocument.custom-properties+xml"/></Types>'
      );
      zip.file('[Content_Types].xml', ct);
    }
  }

  // 3. Ensure _rels/.rels has the custom-properties relationship
  const customPropsRelType =
    'http://schemas.openxmlformats.org/officeDocument/2006/relationships/custom-properties';
  const relsFile = zip.file('_rels/.rels');
  if (relsFile) {
    let rels = await relsFile.async('string');
    if (!rels.includes(customPropsRelType)) {
      const usedNums = [...rels.matchAll(/Id="rId(\d+)"/g)].map((m) => parseInt(m[1], 10));
      const nextId = `rId${usedNums.length > 0 ? Math.max(...usedNums) + 1 : 1}`;
      rels = rels.replace(
        '</Relationships>',
        `<Relationship Id="${nextId}" Type="${customPropsRelType}" Target="docProps/custom.xml"/></Relationships>`
      );
      zip.file('_rels/.rels', rels);
    }
  }

  console.log('[documentOpenUtils] Injected custom properties into PPTX blob at /docProps/custom.xml');
  return zip.generateAsync({ type: 'base64' });
}

/**
 * Replace the current presentation's content in-place using insertSlidesFromBase64.
 *
 * Strategy:
 * 1. Extract custom document properties (/docProps/custom.xml) from the source PPTX.
 * 2. Record the existing slide IDs before insertion.
 * 3. Insert the new slides at the beginning of the presentation.
 * 4. Delete all the original slides, leaving only the newly inserted ones.
 * 5. Set core document properties (title, author) from the provided metadata.
 *
 * Returns the extracted custom-properties XML string (or null if none was found).
 * The caller is responsible for storing this and injecting it back into the PPTX
 * blob at check-in time via injectCustomPropertiesIntoBlob, which ensures the
 * properties land in /docProps/custom.xml where PowerPoint and the EFA backend
 * expect them (insertSlidesFromBase64 only copies slides, not document properties).
 */
export async function replaceCurrentPresentationFromBase64(
  base64Data: string,
  docName?: string,
  authorNames?: string
): Promise<string | null> {
  // Extract custom properties from the source PPTX before modifying the presentation
  const customPropertiesXml = await extractCustomPropertiesXml(base64Data);

  await PowerPoint.run(async (context) => {
    const slides = context.presentation.slides;
    slides.load('items/id');
    await context.sync();

    // Remember the IDs of all existing slides so we can delete them after insertion
    const existingSlideIds = slides.items.map((s) => s.id);

    // Insert the new slides at position 0 (before all existing slides)
    context.presentation.insertSlidesFromBase64(base64Data, {
      formatting: PowerPoint.InsertSlideFormatting.keepSourceFormatting,
      targetSlideId: existingSlideIds.length > 0 ? existingSlideIds[0] : undefined,
    });

    await context.sync();

    // Reload slides so we have an up-to-date list that includes the inserted ones
    slides.load('items/id');
    await context.sync();

    // Delete the original slides (now sitting at the end after insertion at position 0)
    for (const id of existingSlideIds) {
      const slide = slides.items.find((s) => s.id === id);
      if (slide) {
        slide.delete();
      }
    }

    // Update core document properties to match the opened document
    if (docName || authorNames) {
      const props = context.presentation.properties;
      if (docName) {
        props.title = docName.replace(/\.pptx?$/i, '');
      }
      if (authorNames) {
        props.author = authorNames;
      }
    }

    await context.sync();
  });

  // Return the extracted custom properties so the caller can store them and
  // inject them back into /docProps/custom.xml at check-in time.
  return customPropertiesXml;
}

/**
 * Open a PowerPoint presentation from base64 data in a new window.
 * NOTE: prefer replaceCurrentPresentationFromBase64 when the add-in context
 * must remain active (e.g. for check-in/check-out workflows).
 */
export async function openPresentationFromBase64(base64Data: string): Promise<void> {
  try {
    await PowerPoint.createPresentation(base64Data);
  } catch (error) {
    console.error('Failed to open presentation:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to open presentation in PowerPoint'
    );
  }
}

/**
 * Convert a Uint8Array to base64 string
 */
export function uint8ArrayToBase64(uint8Array: Uint8Array): string {
  let binary = '';
  const len = uint8Array.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary);
}

/**
 * Get the current document as a base64 blob.
 * Uses Office.context.document.getFileAsync to read the current presentation.
 */
export function getCurrentPresentationBlob(): Promise<string> {
  return new Promise((resolve, reject) => {
    Office.context.document.getFileAsync(
      Office.FileType.Compressed,
      { sliceSize: 4194304 }, // 4MB slices
      (result) => {
        if (result.status === Office.AsyncResultStatus.Failed) {
          reject(new Error(result.error.message));
          return;
        }

        const file = result.value;
        const sliceCount = file.sliceCount;
        const slices: Uint8Array[] = [];
        let slicesRead = 0;

        const readSlice = (index: number) => {
          file.getSliceAsync(index, (sliceResult) => {
            if (sliceResult.status === Office.AsyncResultStatus.Failed) {
              file.closeAsync();
              reject(new Error(sliceResult.error.message));
              return;
            }

            slices.push(new Uint8Array(sliceResult.value.data));
            slicesRead++;

            if (slicesRead === sliceCount) {
              file.closeAsync();
              // Combine all slices
              const totalLength = slices.reduce((acc, s) => acc + s.length, 0);
              const combined = new Uint8Array(totalLength);
              let offset = 0;
              for (const slice of slices) {
                combined.set(slice, offset);
                offset += slice.length;
              }
              resolve(uint8ArrayToBase64(combined));
            } else {
              readSlice(index + 1);
            }
          });
        };

        if (sliceCount > 0) {
          readSlice(0);
        } else {
          file.closeAsync();
          resolve('');
        }
      }
    );
  });
}

/**
 * Returns the current document's filename without extension, derived from
 * Office.context.document.url. Returns an empty string if unavailable.
 */
export function getCurrentDocumentName(): string {
  try {
    const url = Office.context.document.url;
    if (!url) return '';
    const parts = url.replace(/\\/g, '/').split('/');
    const filename = parts[parts.length - 1] || '';
    return filename.replace(/\.(pptx?|ppt)$/i, '');
  } catch {
    return '';
  }
}
