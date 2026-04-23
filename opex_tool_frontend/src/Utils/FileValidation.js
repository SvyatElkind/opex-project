/**
 * File Validation Utilities
 *
 * Validates files against settings-based thresholds and returns warnings.
 * These are soft validations - files can still be uploaded but users are warned.
 */

/**
 * Validate file size against thresholds
 * @param {File} file - The file to validate
 * @param {number} maxSizeMB - Maximum size in MB from settings
 * @param {number} minSizeMB - Minimum size in MB from settings
 * @returns {array} Array of warning objects
 */
export const validateFileSize = (file, maxSizeMB = 100, minSizeMB = 0.01) => {
  const warnings = [];
  if (!file) return warnings;

  const fileSizeMB = file.size / (1024 * 1024);

  if (fileSizeMB > maxSizeMB) {
    warnings.push({
      type: 'warning',
      field: 'fileSize',
      message: `Faila izmērs (${fileSizeMB.toFixed(2)} MB) pārsniedz ieteikto maksimumu (${maxSizeMB} MB). Lieli faili var radīt veiktspējas problēmas.`,
      value: fileSizeMB,
      threshold: maxSizeMB
    });
  }

  if (fileSizeMB < minSizeMB) {
    warnings.push({
      type: 'warning',
      field: 'fileSize',
      message: `Faila izmērs (${fileSizeMB.toFixed(2)} MB) ir mazāks par ieteikto minimumu (${minSizeMB} MB). Fails var būt bojāts vai nepilnīgs.`,
      value: fileSizeMB,
      threshold: minSizeMB
    });
  }

  return warnings;
};

/**
 * Validate media duration (audio/video)
 * @param {number} duration - Duration in seconds
 * @param {number} maxDuration - Maximum duration in seconds from settings
 * @param {number} minDuration - Minimum duration in seconds from settings
 * @returns {array} Array of warning objects
 */
export const validateDuration = (duration, maxDuration = 3600, minDuration = 1) => {
  const warnings = [];
  if (!duration || duration <= 0) return warnings;

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  if (duration > maxDuration) {
    warnings.push({
      type: 'warning',
      field: 'duration',
      message: `Faila garums (${formatDuration(duration)}) pārsniedz ieteikto maksimumu (${formatDuration(maxDuration)}). Gari faili var būt grūti apstrādājami.`,
      value: duration,
      threshold: maxDuration
    });
  }

  if (duration < minDuration) {
    warnings.push({
      type: 'warning',
      field: 'duration',
      message: `Faila garums (${formatDuration(duration)}) ir mazāks par ieteikto minimumu (${formatDuration(minDuration)}). Fails var būt bojāts vai nepilnīgs.`,
      value: duration,
      threshold: minDuration
    });
  }

  return warnings;
};

/**
 * Validate image dimensions
 * @param {number} width - Image width in pixels
 * @param {number} height - Image height in pixels
 * @param {object} settings - Validation settings object
 * @param {boolean} checkOrientation - Whether to check orientation (controlled by enableOrientationWarnings)
 * @returns {array} Array of warning objects
 */
export const validateImageDimensions = (width, height, settings = {}, checkOrientation = true) => {
  const warnings = [];

  if (!width || !height) return warnings;

  const {
    maxImageWidth = 4000,
    maxImageHeight = 4000,
    minImageWidth = 800,
    minImageHeight = 600,
    preferredOrientation = 'any'
  } = settings;

  // Check maximum dimensions
  if (width > maxImageWidth) {
    warnings.push({
      type: 'warning',
      field: 'imageWidth',
      message: `Attēla platums (${width}px) pārsniedz ieteikto maksimumu (${maxImageWidth}px). Pārāk lieli attēli var radīt veiktspējas problēmas.`,
      value: width,
      threshold: maxImageWidth
    });
  }

  if (height > maxImageHeight) {
    warnings.push({
      type: 'warning',
      field: 'imageHeight',
      message: `Attēla augstums (${height}px) pārsniedz ieteikto maksimumu (${maxImageHeight}px). Pārāk lieli attēli var radīt veiktspējas problēmas.`,
      value: height,
      threshold: maxImageHeight
    });
  }

  // Check minimum dimensions
  if (width < minImageWidth) {
    warnings.push({
      type: 'warning',
      field: 'imageWidth',
      message: `Attēla platums (${width}px) ir mazāks par ieteikto minimumu (${minImageWidth}px). Attēls var būt pārāk mazs kvalitatīvai apstrādei.`,
      value: width,
      threshold: minImageWidth
    });
  }

  if (height < minImageHeight) {
    warnings.push({
      type: 'warning',
      field: 'imageHeight',
      message: `Attēla augstums (${height}px) ir mazāks par ieteikto minimumu (${minImageHeight}px). Attēls var būt pārāk mazs kvalitatīvai apstrādei.`,
      value: height,
      threshold: minImageHeight
    });
  }

  // Check orientation preference (only if enabled)
  if (checkOrientation && preferredOrientation !== 'any') {
    const aspectRatio = width / height;
    const isSquare = Math.abs(aspectRatio - 1) < 0.1; // Within 10% of square
    const isHorizontal = aspectRatio > 1.1;
    const isVertical = aspectRatio < 0.9;

    let orientationMismatch = false;
    let expectedOrientation = '';

    if (preferredOrientation === 'horizontal' && !isHorizontal) {
      orientationMismatch = true;
      expectedOrientation = 'horizontāla';
    } else if (preferredOrientation === 'vertical' && !isVertical) {
      orientationMismatch = true;
      expectedOrientation = 'vertikāla';
    } else if (preferredOrientation === 'square' && !isSquare) {
      orientationMismatch = true;
      expectedOrientation = 'kvadrātveida';
    }

    if (orientationMismatch) {
      warnings.push({
        type: 'warning',
        field: 'imageOrientation',
        message: `Attēla orientācija (${width}x${height}) neatbilst ieteiktajai (${expectedOrientation}). Tas var ietekmēt attēlošanas kvalitāti.`,
        value: `${width}x${height}`,
        threshold: expectedOrientation
      });
    }
  }

  return warnings;
};

/**
 * Get image dimensions from file
 * @param {File} file - Image file
 * @returns {Promise<{width: number, height: number}>}
 */
export const getImageDimensions = (file) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Not an image file'));
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
};

/**
 * Get audio/video duration from file
 * @param {File} file - Audio/Video file
 * @returns {Promise<number>} Duration in seconds
 */
export const getMediaDuration = (file) => {
  return new Promise((resolve, reject) => {
    if (!file || (!file.type.startsWith('audio/') && !file.type.startsWith('video/'))) {
      reject(new Error('Not an audio/video file'));
      return;
    }

    const media = document.createElement(file.type.startsWith('video/') ? 'video' : 'audio');
    const url = URL.createObjectURL(file);

    media.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(media.duration);
    };

    media.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load media'));
    };

    media.src = url;
  });
};

/**
 * Validate a file against all applicable settings
 * @param {File} file - The file to validate
 * @param {object} validationSettings - Validation settings from context
 * @returns {Promise<array>} Array of warning objects
 */
export const validateFile = async (file, validationSettings = {}) => {
  const warnings = [];

  if (!file) return warnings;

  // Check if validations are globally enabled
  if (validationSettings.enabled === false) {
    return warnings;
  }

  // Validate file size (if enabled)
  if (validationSettings.enableFileSizeWarnings !== false) {
    const sizeWarnings = validateFileSize(
      file,
      validationSettings.maxFileSize || 100,
      validationSettings.minFileSize || 0.01
    );
    warnings.push(...sizeWarnings);
  }

  // Validate images
  if (file.type.startsWith('image/')) {
    try {
      const { width, height } = await getImageDimensions(file);

      // Validate dimensions (if enabled)
      if (validationSettings.enableImageDimensionWarnings !== false) {
        const checkOrientation = validationSettings.enableOrientationWarnings !== false;
        const imageWarnings = validateImageDimensions(width, height, validationSettings, checkOrientation);
        warnings.push(...imageWarnings);
      }
    } catch (error) {
      // Image dimension validation failed - skip
    }
  }

  // Validate audio/video
  if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
    try {
      const duration = await getMediaDuration(file);

      // Validate duration (if enabled)
      if (validationSettings.enableDurationWarnings !== false) {
        const durationWarnings = validateDuration(
          duration,
          validationSettings.maxDuration || 3600,
          validationSettings.minDuration || 1
        );
        warnings.push(...durationWarnings);
      }
    } catch (error) {
      // Media duration validation failed - skip
    }
  }

  return warnings;
};

/**
 * Format warnings for display
 * @param {array} warnings - Array of warning objects
 * @returns {string} Formatted warning message
 */
export const formatWarnings = (warnings) => {
  if (!warnings || warnings.length === 0) return '';

  if (warnings.length === 1) {
    return warnings[0].message;
  }

  return `Atrasti ${warnings.length} brīdinājumi:\n\n` +
         warnings.map((w, i) => `${i + 1}. ${w.message}`).join('\n');
};

export default {
  validateFileSize,
  validateDuration,
  validateImageDimensions,
  validateFile,
  getImageDimensions,
  getMediaDuration,
  formatWarnings
};
