'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MdCloudUpload, 
  MdClose, 
  MdHome, 
  MdDirectionsCar, 
  MdAttachMoney, 
  MdDescription, 
  MdLocationOn, 
  MdCheck,
  MdMyLocation
} from 'react-icons/md';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestoreInstance, getStorageInstance } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-store';
import { useToast } from '@/components/toast/toast';

export default function AddListingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const db = getFirestoreInstance();
  const storage = getStorageInstance();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // -- State --
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  
  // Form Data
  const [type, setType] = useState<'house' | 'car'>('house');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'rent', // rent or sale
    address: '',
    city: '',
    latitude: '',
    longitude: '',
    // House Specifics
    bedrooms: '',
    bathrooms: '',
    sqft: '',
    // Car Specifics
    mileage: '',
    year: '',
    brand: '',
    model: ''
  });

  // -- Handlers --

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      
      // Validation: Max 5 images
      if (images.length + newFiles.length > 5) {
        toast.error("Limit Reached", "You can only upload up to 5 images.");
        return;
      }

      setImages(prev => [...prev, ...newFiles]);
      
      // Generate previews
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString()
          }));
          toast.success("Location Found", "Coordinates updated successfully.");
        },
        (error) => {
          toast.error("Error", "Could not retrieve location. Please enter manually.");
        }
      );
    } else {
      toast.error("Not Supported", "Geolocation is not supported by your browser.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    if (images.length === 0) {
        toast.error("Missing Images", "Please upload at least one image.");
        return;
    }

    setLoading(true);
    const toastId = toast.loading("Publishing", "Uploading images and creating listing...");

    try {
      // 1. Upload Images
      const imageUrls: string[] = [];
      for (const file of images) {
        const storageRef = ref(storage, `listings/${user.id}/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        imageUrls.push(url);
      }

      // 2. Prepare Data
      const listingData: any = {
        agentId: user.id,
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        location: `${formData.address}, ${formData.city}`, // Composite string for display
        address: formData.address,
        latitude: Number(formData.latitude) || 0,
        longitude: Number(formData.longitude) || 0,
        type: type,
        category: formData.category,
        status: 'active',
        images: imageUrls,
        views: 0,
        createdAt: serverTimestamp(),
      };

      // Add conditional fields
      if (type === 'house') {
        listingData.bedrooms = Number(formData.bedrooms);
        listingData.bathrooms = Number(formData.bathrooms);
        listingData.sqft = Number(formData.sqft);
      } else {
        listingData.mileage = Number(formData.mileage);
        listingData.year = Number(formData.year);
        listingData.brand = formData.brand;
        listingData.model = formData.model;
      }

      // 3. Save to Firestore
      await addDoc(collection(db, 'listings'), listingData);

      toast.remove(toastId);
      toast.success("Success", "Listing published successfully!");
      router.push('/agent/dashboard');

    } catch (error) {
      console.error(error);
      toast.remove(toastId);
      toast.error("Error", "Failed to publish listing.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 pb-20">
      
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Add New Listing</h1>
        <p className="text-gray-500">Fill in the details to publish your property or vehicle.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        
        {/* 1. Type Selection */}
        <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">What are you listing?</h2>
            <div className="grid grid-cols-2 gap-4">
                <div 
                    onClick={() => setType('house')}
                    className={`cursor-pointer p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all
                        ${type === 'house' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-100 hover:border-emerald-200 text-gray-500'}
                    `}
                >
                    <MdHome size={32} />
                    <span className="font-bold">Real Estate</span>
                </div>
                <div 
                    onClick={() => setType('car')}
                    className={`cursor-pointer p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all
                        ${type === 'car' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-100 hover:border-blue-200 text-gray-500'}
                    `}
                >
                    <MdDirectionsCar size={32} />
                    <span className="font-bold">Vehicle</span>
                </div>
            </div>
        </section>

        {/* 2. Basic Info */}
        <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-gray-900">Basic Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-full">
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Listing Title</label>
                    <input 
                        name="title" required value={formData.title} onChange={handleChange} 
                        placeholder={type === 'house' ? "e.g. Luxury Villa in Downtown" : "e.g. 2023 Tesla Model S"}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Category</label>
                    <select 
                        name="category" value={formData.category} onChange={handleChange}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all"
                    >
                        <option value="rent">For Rent</option>
                        <option value="sale">For Sale</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Price {formData.category === 'rent' ? '(per month/day)' : '(total)'}</label>
                    <div className="relative">
                        <MdAttachMoney className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="number" name="price" required value={formData.price} onChange={handleChange} 
                            placeholder="0.00"
                            className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="col-span-full">
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Description</label>
                    <textarea 
                        name="description" required value={formData.description} onChange={handleChange} rows={4}
                        placeholder="Describe the key features and condition..."
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all"
                    />
                </div>
            </div>
        </section>

        {/* 3. Specifics (Conditional) */}
        <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-gray-900">{type === 'house' ? 'Property Specs' : 'Vehicle Specs'}</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {type === 'house' ? (
                    <>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Bedrooms</label>
                            <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Bathrooms</label>
                            <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Square Ft</label>
                            <input type="number" name="sqft" value={formData.sqft} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500" />
                        </div>
                    </>
                ) : (
                    <>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Brand</label>
                            <input type="text" name="brand" placeholder="e.g. BMW" value={formData.brand} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Model</label>
                            <input type="text" name="model" placeholder="e.g. X5" value={formData.model} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Year</label>
                            <input type="number" name="year" placeholder="2024" value={formData.year} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500" />
                        </div>
                         <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Mileage</label>
                            <input type="number" name="mileage" placeholder="0" value={formData.mileage} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500" />
                        </div>
                    </>
                )}
            </div>
        </section>

        {/* 4. Location */}
        <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">Location</h2>
                <button type="button" onClick={getCurrentLocation} className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                    <MdMyLocation /> Use Current Location
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-full">
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Street Address</label>
                    <div className="relative">
                        <MdLocationOn className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            name="address" required value={formData.address} onChange={handleChange} 
                            placeholder="e.g. 123 Main St"
                            className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">City</label>
                    <input name="city" required value={formData.city} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Latitude</label>
                        <input name="latitude" value={formData.latitude} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 font-mono text-xs" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Longitude</label>
                        <input name="longitude" value={formData.longitude} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 font-mono text-xs" />
                    </div>
                </div>
            </div>
        </section>

        {/* 5. Images */}
        <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-gray-900">Gallery</h2>
            
            <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/30 transition-all group"
            >
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4 group-hover:bg-emerald-100 group-hover:text-emerald-500 transition-colors">
                    <MdCloudUpload size={32} />
                </div>
                <p className="font-bold text-gray-700">Click to upload images</p>
                <p className="text-sm text-gray-400">JPG, PNG (Max 5)</p>
                <input 
                    type="file" multiple accept="image/*" 
                    ref={fileInputRef} onChange={handleImageSelect} 
                    className="hidden" 
                />
            </div>

            {/* Previews */}
            {previews.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                    {previews.map((src, i) => (
                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                            <img src={src} alt="preview" className="w-full h-full object-cover" />
                            <button 
                                type="button"
                                onClick={() => removeImage(i)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <MdClose size={12} />
                            </button>
                            {i === 0 && (
                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-1 font-bold">
                                    Cover
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </section>

        <div className="flex justify-end gap-4">
            <button 
                type="button" 
                onClick={() => router.back()}
                className="px-8 py-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
            >
                Cancel
            </button>
            <button 
                type="submit" 
                disabled={loading}
                className="px-8 py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors shadow-lg disabled:opacity-70 flex items-center gap-2"
            >
                {loading ? 'Publishing...' : <><MdCheck /> Publish Listing</>}
            </button>
        </div>

      </form>
    </div>
  );
}