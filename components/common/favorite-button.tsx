import { useState } from "react";
import { Heart } from "lucide-react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const FavoriteButton = ({
  productId,
  productName,
  isInWishlist,
  handleToggleFavorite,
}: {
  productId: string;
  productName: string;
  isInWishlist: (id: string) => boolean;
  handleToggleFavorite: (id: string, name: string) => Promise<void> | void;
}) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    try {
      setLoading(true);
      await handleToggleFavorite(productId, productName);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full h-8 w-8"
      onClick={handleClick}
      disabled={loading} // optional
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : (
        <Heart
          className={`h-4 w-4 ${
            isInWishlist(productId)
              ? "fill-red-500 text-red-500"
              : "text-muted-foreground"
          }`}
        />
      )}
    </Button>
  );
};

export default FavoriteButton;
