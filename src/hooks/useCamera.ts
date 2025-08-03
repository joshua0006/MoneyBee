import { useState, useCallback } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export interface CameraResult {
  file: File | null;
  dataUrl: string | null;
  error: string | null;
}

export const useCamera = () => {
  const [isCapturing, setIsCapturing] = useState(false);

  const capturePhoto = useCallback(async (): Promise<CameraResult> => {
    setIsCapturing(true);
    
    try {
      // Try Capacitor camera first (for mobile)
      try {
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Camera,
        });

        if (image.dataUrl) {
          // Convert dataUrl to File
          const response = await fetch(image.dataUrl);
          const blob = await response.blob();
          const file = new File([blob], 'receipt.jpg', { type: 'image/jpeg' });
          
          return {
            file,
            dataUrl: image.dataUrl,
            error: null,
          };
        }
      } catch (capacitorError) {
        console.log('Capacitor camera not available, falling back to web API');
      }

      // Fallback to web file input
      return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'camera';
        
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              resolve({
                file,
                dataUrl: event.target?.result as string,
                error: null,
              });
            };
            reader.readAsDataURL(file);
          } else {
            resolve({
              file: null,
              dataUrl: null,
              error: 'No file selected',
            });
          }
        };
        
        input.oncancel = () => {
          resolve({
            file: null,
            dataUrl: null,
            error: 'Camera cancelled',
          });
        };
        
        input.click();
      });
    } catch (error) {
      return {
        file: null,
        dataUrl: null,
        error: error instanceof Error ? error.message : 'Camera capture failed',
      };
    } finally {
      setIsCapturing(false);
    }
  }, []);

  const selectFromGallery = useCallback(async (): Promise<CameraResult> => {
    setIsCapturing(true);
    
    try {
      // Try Capacitor photo picker first
      try {
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Photos,
        });

        if (image.dataUrl) {
          const response = await fetch(image.dataUrl);
          const blob = await response.blob();
          const file = new File([blob], 'receipt.jpg', { type: 'image/jpeg' });
          
          return {
            file,
            dataUrl: image.dataUrl,
            error: null,
          };
        }
      } catch (capacitorError) {
        console.log('Capacitor photo picker not available, falling back to web API');
      }

      // Fallback to web file input
      return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              resolve({
                file,
                dataUrl: event.target?.result as string,
                error: null,
              });
            };
            reader.readAsDataURL(file);
          } else {
            resolve({
              file: null,
              dataUrl: null,
              error: 'No file selected',
            });
          }
        };
        
        input.click();
      });
    } catch (error) {
      return {
        file: null,
        dataUrl: null,
        error: error instanceof Error ? error.message : 'Photo selection failed',
      };
    } finally {
      setIsCapturing(false);
    }
  }, []);

  return {
    capturePhoto,
    selectFromGallery,
    isCapturing,
  };
};