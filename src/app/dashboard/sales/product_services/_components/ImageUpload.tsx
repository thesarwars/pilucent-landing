import { ChangeEvent, useState, useEffect } from 'react';
import Image from 'next/image';
import { MdOutlineFileUpload } from 'react-icons/md';

interface ImageUploadProps {
  setFile: (file: File[]) => void;  // Changed to accept array of files
  initialImageSrc?: string;
}

const ImageUpload = ({ setFile, initialImageSrc }: ImageUploadProps) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isInitialImage, setIsInitialImage] = useState(false);

  useEffect(() => {
    if (initialImageSrc) {
      setImageSrc(initialImageSrc);
      setIsInitialImage(true);
    }
  }, [initialImageSrc]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      setFile([file]); // Send as array
      setIsInitialImage(false);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          setImageSrc(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative mt-2 flex h-28 w-28 items-center gap-4 rounded-lg bg-[#D9D9D9]">
      {imageSrc && (
        <Image
          src={imageSrc}
          width={112}
          height={112}
          alt="preview"
          className="h-full w-full rounded-lg border-2 border-accent_soft_blue object-cover"
          priority
          unoptimized={isInitialImage}
        />
      )}
      <input
        id="image-upload"
        type="file"
        accept="image/*"
        className="hidden overflow-hidden"
        onChange={handleImageChange}
      />
      <label htmlFor="image-upload">
        <MdOutlineFileUpload className="absolute -right-4 bottom-0 cursor-pointer rounded-full bg-white p-1 text-3xl text-[#5A607F] shadow" />
      </label>
    </div>
  );
};

export default ImageUpload;