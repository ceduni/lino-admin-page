export const qrCodeAPI = {
  api_url: 'https://qrcode-monkey.p.rapidapi.com',
  api_key: import.meta.env.VITE_QR_CODE_API_KEY,

  // Upload an image to use as a logo in QR codes
  uploadImage: async (imageFile) => {
    if (!imageFile) {
      throw new Error('Image file is required');
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!allowedTypes.includes(imageFile.type)) {
      throw new Error('Only PNG, JPG, and SVG files are allowed');
    }

    // Validate file size (2MB max as per API docs)
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    if (imageFile.size > maxSize) {
      throw new Error('File size must be less than 2MB');
    }

    const formData = new FormData();
    formData.append('file', imageFile);

    const response = await fetch(`${qrCodeAPI.api_url}/qr/uploadImage`, {
      method: 'POST',
      headers: {
        'X-RapidAPI-Key': qrCodeAPI.api_key,
        'X-RapidAPI-Host': 'qrcode-monkey.p.rapidapi.com',
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to upload image');
    }

    return data;
  },

  // Create a custom QR code with public/icon.png as logo
  createQR: async (data) => {
    if (!data || typeof data !== 'string') {
      throw new Error('QR code data is required and must be a string');
    }

    // First, we need to upload the icon.png file to get a logoFilename
    let logoFilename = '';
    try {
      // Fetch the icon.png file from public directory
      const iconResponse = await fetch('/icon.png');
      if (iconResponse.ok) {
        const iconBlob = await iconResponse.blob();
        const iconFile = new File([iconBlob], 'icon.png', { type: 'image/png' });
        const uploadResult = await qrCodeAPI.uploadImage(iconFile);
        logoFilename = uploadResult.file || '';
      }
    } catch (error) {
      console.warn('Failed to upload logo, creating QR code without logo:', error);
    }

    // Default config with uploaded logo
    const defaultConfig = {
      body: 'circle',
      eye: 'frame13',
      eyeBall: 'ball15',
      bodyColor: '#000000',
      bgColor: '#ffffff',
      logo: logoFilename,
      logoMode: 'default',
    };

    const requestBody = {
      data: data,
      config: defaultConfig,
      size: 2000,
      file: 'png',
      download: false
    };

    const response = await fetch(`${qrCodeAPI.api_url}/qr/custom`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': qrCodeAPI.api_key,
        'X-RapidAPI-Host': 'qrcode-monkey.p.rapidapi.com',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create QR code: ${errorText}`);
    }

    // Return the response as a blob for image data
    return await response.blob();
  },


  // Helper function to convert blob to data URL for display
  blobToDataURL: (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  },

  // Helper function to download blob as file
  downloadBlob: (blob, filename) => { 
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};
