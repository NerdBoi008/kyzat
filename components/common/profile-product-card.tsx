import { UserProfile } from "@/hooks/useUserProfile";
import { EyeIcon, PencilIcon } from "lucide-react";
import Image from "next/image";
import React from "react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

const ProfileProductCard = ({
  id,
  // slug,
  name,
  image,
  isFeatured,
  rating,
  stock,
  price,
  isApproved,
  className,
}: UserProfile["creatorProducts"][0] & { className?: string }) => {
  const router = useRouter();

  return (
    <div className={`group relative overflow-hidden ${className}`}>
      {/* Featured Badge */}
      {isFeatured && (
        <div className="absolute top-2 left-2 z-10">
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            Featured
          </span>
        </div>
      )}

      {!isApproved && (
        <div className="absolute top-2 left-2 z-10">
          <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
            Pending Approval
          </span>
        </div>
      )}

      {/* Product Image */}
      <div className="relative h-48 w-full bg-gray-100 rounded-sm overflow-hidden">
        {image ? (
          <Image
            src={image ?? "/placeholder-image.png"}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-gray-400">No Image</span>
          </div>
        )}

        {/* Stock Status Overlay */}
        {stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="font-bold text-lg">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Product Name */}
      <h3 className="font-semibold font-secondary mb-2 line-clamp-1 pt-1 uppercase">
        {name}
      </h3>
      <div className="flex items-start justify-between">
        <div>
          {/* Rating */}
          {rating && (
            <div className="flex items-center">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(parseFloat(rating!))
                        ? "fill-current"
                        : "stroke-current stroke-1 fill-none"
                    }`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="ml-2 text-sm">{rating}</span>
            </div>
          )}

          {/* Stock */}
          {stock !== null && stock > 0 && (
            <p className="text-xs text-muted-foreground">{stock} in stock</p>
          )}
        </div>

        {/* Price */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xl font-medium">{price}</p>
          </div>
        </div>
      </div>

      {/* Quick View Button - Appears on Hover */}
      <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Button variant="outline" size="icon">
          <EyeIcon className="w-5 h-5" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => {
          router.push(`/dashboard/products/edit/${id}`);
        }}>
          <PencilIcon className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default ProfileProductCard;
