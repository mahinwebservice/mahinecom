import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

export interface CloudinaryConfig {
  cloudName?: string;
  uploadPreset?: string;
  apiKey?: string;
}

// In-memory cache for tenant Cloudinary config to prevent repeated Firestore reads
const tenantCloudinaryCache = new Map<string, CloudinaryConfig>();

/**
 * Uploads a file (File, Blob, or base64 string) to Cloudinary.
 * Uses the tenant's Cloudinary settings from Firestore, or env variables as fallback.
 * 
 * @param file The image File, Blob, or base64 data URL
 * @param tenantId The current tenant/store identifier
 * @param customConfig Optional override config
 * @returns Promise<string> The secure HTTPS URL of the uploaded image
 */
export async function uploadToCloudinary(
  file: File | Blob | string,
  tenantId?: string,
  customConfig?: CloudinaryConfig
): Promise<string> {
  let cloudName = customConfig?.cloudName?.trim();
  let uploadPreset = customConfig?.uploadPreset?.trim();

  // 1. If not provided directly, look up tenant settings from cache or Firestore
  if ((!cloudName || !uploadPreset) && tenantId) {
    if (tenantCloudinaryCache.has(tenantId)) {
      const cached = tenantCloudinaryCache.get(tenantId)!;
      cloudName = cloudName || cached.cloudName;
      uploadPreset = uploadPreset || cached.uploadPreset;
    } else {
      try {
        const snap = await getDoc(doc(db, `tenants/${tenantId}/settings/general`));
        if (snap.exists()) {
          const data = snap.data();
          if (data.cloudinary) {
            const cfg: CloudinaryConfig = {
              cloudName: data.cloudinary.cloudName?.trim(),
              uploadPreset: data.cloudinary.uploadPreset?.trim(),
              apiKey: data.cloudinary.apiKey?.trim(),
            };
            tenantCloudinaryCache.set(tenantId, cfg);
            cloudName = cloudName || cfg.cloudName;
            uploadPreset = uploadPreset || cfg.uploadPreset;
          }
        }
      } catch (err) {
        console.warn('Could not fetch tenant cloudinary settings:', err);
      }
    }
  }

  // 2. Check environment variables as fallback
  cloudName = cloudName || (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME as string)?.trim();
  uploadPreset = uploadPreset || (process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET as string)?.trim();

  // 3. Fallback to default unsigned preset if cloudName exists but preset is missing
  if (cloudName && !uploadPreset) {
    uploadPreset = 'ml_default';
  }

  // 4. Validate that Cloudinary is configured
  if (!cloudName) {
    throw new Error(
      'ক্লাউডিনারি কনফিগারেশন পাওয়া যায়নি! অনুগ্রহ করে অ্যাডমিন ড্যাশবোর্ডের "ওয়েবসাইট ও API সেটিংস" > "৫. ক্লাউডিনারি ইমেজ" ট্যাবে গিয়ে আপনার Cloud Name ও Upload Preset সেট করুন।'
    );
  }

  // 5. Build FormData for Cloudinary Upload
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset || 'ml_default');

  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const response = await fetch(uploadUrl, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    const errorMsg = data.error?.message || 'আপলোড ব্যর্থ হয়েছে';
    console.error('Cloudinary upload error:', data);
    throw new Error(`ক্লাউডিনারি আপলোড ত্রুটি: ${errorMsg}`);
  }

  return data.secure_url;
}
