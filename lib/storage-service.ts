import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  UploadMetadata 
} from 'firebase/storage';
import { getStorageInstance } from '@/lib/firebase';

// --- CONFIG ---
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_AUDIO_SIZE = 50 * 1024 * 1024;  // 50MB

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska'];

// --- TYPES ---
export interface UploadProgressData {
  progress: number;       // 0 - 100
  bytesTransferred: number;
  totalBytes: number;
  speed: number;          // Bytes per second
  estimatedSeconds: number; // Remaining seconds
}

type ProgressCallback = (data: UploadProgressData) => void;

/**
 * Generic File Uploader with Progress Support
 */
async function uploadFile(
  file: File, 
  folderPath: string, 
  allowedTypes: string[], 
  maxSize: number,
  onProgress?: ProgressCallback
): Promise<string> {
  const storage = getStorageInstance();
  
  // 1. Validate Type
  // Fix: Check if exact match OR if the category allows generic types (like audio/*)
  // For audio, browsers often add codec params (e.g. 'audio/webm; codecs=opus')
  const fileTypeBase = file.type.split(';')[0]; 
  const isTypeAllowed = allowedTypes.some(type => {
      if (type.endsWith('/*')) {
          const mainType = type.split('/')[0];
          return file.type.startsWith(`${mainType}/`);
      }
      return file.type === type || fileTypeBase === type;
  });

  if (!isTypeAllowed && allowedTypes.length > 0) {
    console.error(`Rejected file type: ${file.type}. Allowed: ${allowedTypes.join(', ')}`);
    throw new Error(`File type ${file.type} is not supported.`);
  }

  // 2. Validate Size
  if (file.size > maxSize) {
    const sizeMB = (maxSize / (1024 * 1024)).toFixed(0);
    throw new Error(`File is too large. Max size is ${sizeMB}MB.`);
  }

  // 3. Generate Unique Path
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  // Sanitize filename: remove spaces/special chars
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.]/g, '_').substring(0, 50); 
  const fullPath = `${folderPath}/${timestamp}_${randomStr}_${sanitizedName}`;

  // 4. Create Ref & Metadata
  const storageRef = ref(storage, fullPath);
  const metadata: UploadMetadata = {
    contentType: file.type,
    customMetadata: {
      originalName: file.name,
      uploadedAt: new Date().toISOString()
    }
  };

  // 5. Upload with Progress (Resumable)
  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file, metadata);
    
    // Variables for speed calculation
    const startTime = Date.now();
    let previousBytes = 0;
    
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        if (onProgress) {
            const now = Date.now();
            const timeElapsed = (now - startTime) / 1000; // seconds
            
            // Calculate Speed (Avg speed for stability, or instantaneous if preferred)
            // Using Average Speed here:
            const speed = timeElapsed > 0 ? snapshot.bytesTransferred / timeElapsed : 0;
            
            // Calculate Estimated Time Remaining
            const remainingBytes = snapshot.totalBytes - snapshot.bytesTransferred;
            const estimatedSeconds = speed > 0 ? remainingBytes / speed : 0;

            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

            onProgress({
                progress,
                bytesTransferred: snapshot.bytesTransferred,
                totalBytes: snapshot.totalBytes,
                speed, // Bytes/sec
                estimatedSeconds
            });
        }
      },
      (error) => {
        console.error("Storage Upload Error:", error);
        // Map common codes to user-friendly messages
        let msg = "Failed to upload file.";
        if (error.code === 'storage/unauthorized') msg = "Permission denied.";
        if (error.code === 'storage/canceled') msg = "Upload canceled.";
        reject(new Error(msg));
      },
      async () => {
        try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
        } catch (err) {
            reject(err);
        }
      }
    );
  });
}

/**
 * Upload an Image
 */
export async function uploadImage(
    file: File, 
    path: string, 
    onProgress?: ProgressCallback
): Promise<string> {
  return uploadFile(file, path, ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE, onProgress);
}

/**
 * Upload a Video
 */
export async function uploadVideo(
    file: File, 
    path: string, 
    onProgress?: ProgressCallback
): Promise<string> {
  return uploadFile(file, path, ALLOWED_VIDEO_TYPES, MAX_VIDEO_SIZE, onProgress);
}

/**
 * Upload an Audio Voice Note or Audio File
 */
export async function uploadAudio(
    blobOrFile: Blob | File, 
    path: string, 
    onProgress?: ProgressCallback
): Promise<string> {
    
  let file: File;
  
  if (blobOrFile instanceof Blob && !(blobOrFile instanceof File)) {
    // It's a recorded Blob, convert to File
    // Note: We use a generic 'audio/webm' type here, but the browser might record as something else.
    // The validation inside uploadFile will handle fuzzy matching now.
    file = new File([blobOrFile], "voice_note.webm", { 
        type: blobOrFile.type || 'audio/webm' 
    });
  } else {
    file = blobOrFile as File;
  }

  // Allowed types include generic 'audio/*' to catch all variations (wav, mp3, ogg, webm, m4a)
  const allowedAudioTypes = [
      'audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/aac',
      'audio/*' // Allow any audio mime type fallback
  ];

  return uploadFile(
    file, 
    path, 
    allowedAudioTypes, 
    MAX_AUDIO_SIZE,
    onProgress
  );
}