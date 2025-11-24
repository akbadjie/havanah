'use client';

import { FirebaseStorage } from 'firebase/storage';
import { getStorageInstance } from './firebase';

/**
 * Upload an image/file to Firebase Storage
 * @param file - The File object to upload
 * @param path - The storage path (e.g., 'listings/user123')
 * @returns Promise<string> - The download URL of the uploaded file
 */
export async function uploadImage(file: File, path: string): Promise<string> {
  try {
    const storage = getStorageInstance();
    
    // Dynamically import Firebase Storage functions to avoid TypeScript issues
    const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
    
    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const fullPath = `${path}/${fileName}`;
    
    // Create reference
    const fileRef = ref(storage, fullPath);
    
    // Upload file
    await uploadBytes(fileRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(fileRef);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file');
  }
}

/**
 * Upload multiple files to Firebase Storage
 * @param files - Array of File objects to upload
 * @param path - The storage path
 * @returns Promise<string[]> - Array of download URLs
 */
export async function uploadImages(files: File[], path: string): Promise<string[]> {
  try {
    const urls = await Promise.all(
      files.map(file => uploadImage(file, path))
    );
    return urls;
  } catch (error) {
    console.error('Error uploading multiple files:', error);
    throw new Error('Failed to upload files');
  }
}

/**
 * Upload a video file to Firebase Storage
 * @param file - The video File object to upload
 * @param path - The storage path
 * @returns Promise<string> - The download URL of the uploaded video
 */
export async function uploadVideo(file: File, path: string): Promise<string> {
  try {
    // Reuse uploadImage since Firebase Storage handles both
    return await uploadImage(file, path);
  } catch (error) {
    console.error('Error uploading video:', error);
    throw new Error('Failed to upload video');
  }
}