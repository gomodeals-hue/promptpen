/**
 * Direct ImgBB Online Image Hosting Upload Service for PromptPen
 * Automatically compresses user image files and uploads them directly to ImgBB CDN,
 * returning a direct, permanent HTTPS image URL (https://i.ibb.co/...) for Firestore.
 */

const IMGBB_API_KEY = '413c2e7e066232547ef3b30f9bdec563'

/**
 * Resizes and compresses an image file using HTML5 Canvas.
 * Keeps output lightweight (~100-200 KB) for instant uploading.
 */
export function compressImage(file, maxDimension = 1200, quality = 0.8) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Invalid image file.'))
    }

    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Failed to read image file.'))
    reader.onload = (e) => {
      const img = new Image()
      img.onerror = () => reject(new Error('Failed to load image.'))
      img.onload = () => {
        let width = img.width
        let height = img.height

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width)
            width = maxDimension
          } else {
            width = Math.round((width * maxDimension) / height)
            height = maxDimension
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('Failed to get canvas context.'))

        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name || 'image.jpg', { type: 'image/jpeg' }))
            } else {
              reject(new Error('Canvas compression failed.'))
            }
          },
          'image/jpeg',
          quality
        )
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

/**
 * Uploads file to ImgBB and returns permanent direct HTTPS CDN link.
 */
export async function uploadImageFile(file) {
  if (!file) throw new Error('No image file selected.')

  // 1. Compress image to lightweight JPEG blob first
  let compressedFile = file
  try {
    compressedFile = await compressImage(file, 1200, 0.8)
  } catch (err) {
    console.warn('Canvas compression skipped, using original file:', err)
  }

  // 2. Encode compressed blob to raw base64 string
  const base64Data = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result === 'string') {
        const rawBase64 = result.split(',')[1] || result
        resolve(rawBase64)
      } else {
        reject(new Error('Base64 encoding failed.'))
      }
    }
    reader.onerror = () => reject(new Error('FileReader failed.'))
    reader.readAsDataURL(compressedFile)
  })

  // 3. Post base64 payload to ImgBB API
  const formData = new FormData()
  formData.append('image', base64Data)

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
    method: 'POST',
    body: formData,
  })

  const result = await response.json()

  if (result.success && result.data && (result.data.display_url || result.data.url)) {
    return result.data.display_url || result.data.url
  }

  throw new Error(result.error?.message || 'ImgBB upload failed.')
}
