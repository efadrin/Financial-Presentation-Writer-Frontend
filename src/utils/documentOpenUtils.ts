/**
 * PowerPoint-specific document utilities.
 */

/**
 * Replace the current presentation's content in-place using insertSlidesFromBase64.
 *
 * Strategy:
 * 1. Record the existing slide IDs before insertion.
 * 2. Insert the new slides at the beginning of the presentation.
 * 3. Delete all the original slides, leaving only the newly inserted ones.
 * 4. Set core document properties (title, author) from the provided metadata.
 *
 * This avoids opening a new PowerPoint window and keeps the add-in context alive.
 */
export async function replaceCurrentPresentationFromBase64(
  base64Data: string,
  docName?: string,
  authorNames?: string
): Promise<void> {
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
