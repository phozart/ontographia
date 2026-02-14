/**
 * ImageUpload Component
 * Handles image paste, drag-drop, and file upload
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Image upload configuration
 */
const IMAGE_CONFIG = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml'],
  maxDimension: 4096, // Max width or height
};

/**
 * Read file as data URL
 */
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Get image dimensions from data URL
 */
function getImageDimensions(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = reject;
    img.src = dataUrl;
  });
}

/**
 * Resize image if needed
 */
async function resizeImageIfNeeded(dataUrl, maxDimension) {
  const dimensions = await getImageDimensions(dataUrl);

  if (dimensions.width <= maxDimension && dimensions.height <= maxDimension) {
    return { dataUrl, ...dimensions };
  }

  // Calculate new dimensions
  const ratio = Math.min(maxDimension / dimensions.width, maxDimension / dimensions.height);
  const newWidth = Math.round(dimensions.width * ratio);
  const newHeight = Math.round(dimensions.height * ratio);

  // Resize using canvas
  const img = new Image();
  await new Promise((resolve) => {
    img.onload = resolve;
    img.src = dataUrl;
  });

  const canvas = document.createElement('canvas');
  canvas.width = newWidth;
  canvas.height = newHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, newWidth, newHeight);

  return {
    dataUrl: canvas.toDataURL('image/png'),
    width: newWidth,
    height: newHeight,
  };
}

/**
 * Validate image file
 */
function validateImage(file) {
  if (!IMAGE_CONFIG.allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Unsupported image format. Use PNG, JPEG, GIF, WebP, or SVG.' };
  }
  if (file.size > IMAGE_CONFIG.maxSize) {
    return { valid: false, error: 'Image too large. Maximum size is 10MB.' };
  }
  return { valid: true };
}

/**
 * Process image file
 */
async function processImageFile(file) {
  const validation = validateImage(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const dataUrl = await readFileAsDataURL(file);
  const result = await resizeImageIfNeeded(dataUrl, IMAGE_CONFIG.maxDimension);

  return {
    dataUrl: result.dataUrl,
    width: result.width,
    height: result.height,
    name: file.name,
    type: file.type,
  };
}

/**
 * Drop zone overlay for drag and drop
 */
export function DropZoneOverlay({ isActive, onDrop, onDragLeave }) {
  if (!isActive) return null;

  const overlayStyle = {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    border: '3px dashed #3b82f6',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    pointerEvents: 'auto',
  };

  const contentStyle = {
    padding: '40px 60px',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
    textAlign: 'center',
  };

  const iconStyle = {
    fontSize: 48,
    marginBottom: 16,
  };

  const textStyle = {
    fontSize: 18,
    fontWeight: 600,
    color: '#1f2937',
    marginBottom: 8,
  };

  const subtextStyle = {
    fontSize: 14,
    color: '#6b7280',
  };

  return (
    <div
      style={overlayStyle}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div style={contentStyle}>
        <div style={iconStyle}>📷</div>
        <div style={textStyle}>Drop image here</div>
        <div style={subtextStyle}>PNG, JPEG, GIF, WebP, or SVG up to 10MB</div>
      </div>
    </div>
  );
}

/**
 * Image upload button
 */
export function ImageUploadButton({ onUpload, disabled, className }) {
  const inputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsLoading(true);
    try {
      for (const file of files) {
        const imageData = await processImageFile(file);
        onUpload?.(imageData);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert(error.message);
    } finally {
      setIsLoading(false);
      // Reset input
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const buttonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    backgroundColor: '#ffffff',
    color: '#374151',
    fontSize: 13,
    fontWeight: 500,
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    opacity: disabled || isLoading ? 0.5 : 1,
  };

  return (
    <>
      <button
        style={buttonStyle}
        onClick={handleClick}
        disabled={disabled || isLoading}
        className={className}
      >
        <span>📷</span>
        <span>{isLoading ? 'Uploading...' : 'Upload Image'}</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_CONFIG.allowedTypes.join(',')}
        multiple
        onChange={handleChange}
        style={{ display: 'none' }}
      />
    </>
  );
}

/**
 * Hook to handle paste events for images
 */
export function useImagePaste(onPaste, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handlePaste = async (e) => {
      const items = Array.from(e.clipboardData?.items || []);
      const imageItems = items.filter((item) => item.type.startsWith('image/'));

      if (imageItems.length === 0) return;

      e.preventDefault();

      for (const item of imageItems) {
        const file = item.getAsFile();
        if (!file) continue;

        try {
          const imageData = await processImageFile(file);
          onPaste?.(imageData);
        } catch (error) {
          console.error('Paste failed:', error);
          alert(error.message);
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [onPaste, enabled]);
}

/**
 * Hook to handle drag and drop for images
 */
export function useImageDragDrop(onDrop, containerRef = null) {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  useEffect(() => {
    const container = containerRef?.current || document.body;

    const handleDragEnter = (e) => {
      e.preventDefault();
      dragCounter.current++;

      // Check if dragging files with images
      if (e.dataTransfer?.types?.includes('Files')) {
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      dragCounter.current--;

      if (dragCounter.current === 0) {
        setIsDragging(false);
      }
    };

    const handleDragOver = (e) => {
      e.preventDefault();
    };

    const handleDrop = async (e) => {
      e.preventDefault();
      dragCounter.current = 0;
      setIsDragging(false);

      const files = Array.from(e.dataTransfer?.files || []);
      const imageFiles = files.filter((file) => file.type.startsWith('image/'));

      if (imageFiles.length === 0) return;

      // Get drop position relative to canvas
      const rect = container.getBoundingClientRect();
      const dropPosition = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      for (const file of imageFiles) {
        try {
          const imageData = await processImageFile(file);
          onDrop?.({ ...imageData, position: dropPosition });
        } catch (error) {
          console.error('Drop failed:', error);
          alert(error.message);
        }
      }
    };

    container.addEventListener('dragenter', handleDragEnter);
    container.addEventListener('dragleave', handleDragLeave);
    container.addEventListener('dragover', handleDragOver);
    container.addEventListener('drop', handleDrop);

    return () => {
      container.removeEventListener('dragenter', handleDragEnter);
      container.removeEventListener('dragleave', handleDragLeave);
      container.removeEventListener('dragover', handleDragOver);
      container.removeEventListener('drop', handleDrop);
    };
  }, [onDrop, containerRef]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);

    const files = Array.from(e.dataTransfer?.files || []);
    const imageFiles = files.filter((file) => file.type.startsWith('image/'));

    if (imageFiles.length === 0) return;

    const container = containerRef?.current || document.body;
    const rect = container.getBoundingClientRect();
    const dropPosition = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    for (const file of imageFiles) {
      try {
        const imageData = await processImageFile(file);
        onDrop?.({ ...imageData, position: dropPosition });
      } catch (error) {
        console.error('Drop failed:', error);
        alert(error.message);
      }
    }
  }, [onDrop, containerRef]);

  return {
    isDragging,
    handleDragLeave,
    handleDrop,
  };
}

/**
 * Combined image upload hook
 */
export function useImageUpload({ onUpload, containerRef = null, enabled = true }) {
  const handleImageData = useCallback((imageData) => {
    onUpload?.(imageData);
  }, [onUpload]);

  // Handle paste
  useImagePaste(handleImageData, enabled);

  // Handle drag and drop
  const { isDragging, handleDragLeave, handleDrop } = useImageDragDrop(
    handleImageData,
    containerRef
  );

  return {
    isDragging,
    handleDragLeave,
    handleDrop,
  };
}

/**
 * Image element renderer
 */
export function ImageElement({
  element,
  isSelected,
  onSelect,
  onMove,
  onResize,
  scale = 1,
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const { x, y } = element.position || { x: 0, y: 0 };
  const { width, height } = element.size || { width: 200, height: 200 };
  const src = element.data?.src || element.data?.dataUrl;

  const containerStyle = {
    position: 'absolute',
    left: x,
    top: y,
    width,
    height,
    cursor: isSelected ? 'move' : 'pointer',
    outline: isSelected ? '2px solid #3b82f6' : 'none',
    outlineOffset: 2,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
  };

  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    opacity: isLoaded ? 1 : 0,
    transition: 'opacity 0.2s',
  };

  const placeholderStyle = {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    color: '#9ca3af',
  };

  const handleStyle = {
    position: 'absolute',
    width: 10,
    height: 10,
    backgroundColor: '#ffffff',
    border: '2px solid #3b82f6',
    borderRadius: 2,
  };

  return (
    <div
      style={containerStyle}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(element);
      }}
    >
      {!isLoaded && !hasError && (
        <div style={placeholderStyle}>Loading...</div>
      )}
      {hasError && (
        <div style={placeholderStyle}>Failed to load image</div>
      )}
      {src && (
        <img
          src={src}
          alt={element.data?.name || 'Image'}
          style={imageStyle}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          draggable={false}
        />
      )}

      {/* Resize handles */}
      {isSelected && (
        <>
          <div style={{ ...handleStyle, top: -5, left: -5, cursor: 'nwse-resize' }} />
          <div style={{ ...handleStyle, top: -5, right: -5, cursor: 'nesw-resize' }} />
          <div style={{ ...handleStyle, bottom: -5, left: -5, cursor: 'nesw-resize' }} />
          <div style={{ ...handleStyle, bottom: -5, right: -5, cursor: 'nwse-resize' }} />
        </>
      )}
    </div>
  );
}

export default {
  DropZoneOverlay,
  ImageUploadButton,
  ImageElement,
  useImagePaste,
  useImageDragDrop,
  useImageUpload,
};
