export const isUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch (e) {
    return false
  }
}

export const asBase64Image = (url: string, mimeType = 'image/png'): string => {
  return `data:image/png;base64,${url}`
}


export async function dataUrlToFile(dataUrl: string, fileName: string): Promise<File> {

  const res: Response = await fetch(dataUrl)
  const blob: Blob = await res.blob()
  return new File([blob], fileName, { type: 'image/png' })
}
