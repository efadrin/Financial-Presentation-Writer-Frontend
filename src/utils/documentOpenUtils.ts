/**
 * PowerPoint-specific document utilities.
 * Unlike the Word version which inserts documents into the current Word instance,
 * PowerPoint opens documents in a new window via PowerPoint.createPresentation().
 */

/**
 * Open a PowerPoint presentation from base64 data.
 * This creates a new PowerPoint window with the document content.
 */
export async function openPresentationFromBase64(
  base64Data: string,
): Promise<void> {
  try {
    await PowerPoint.createPresentation(base64Data);
  } catch (error) {
    console.error("Failed to open presentation:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to open presentation in PowerPoint",
    );
  }
}

/**
 * Convert a Uint8Array to base64 string
 */
export function uint8ArrayToBase64(uint8Array: Uint8Array): string {
  let binary = "";
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
          resolve("");
        }
      },
    );
  });
}
