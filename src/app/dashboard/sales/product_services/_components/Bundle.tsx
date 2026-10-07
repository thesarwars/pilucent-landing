import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "@/components/ui/RawButton";
import Input from "@/components/ui/RawInput";
import Label from "@/components/ui/RawLabel";
import ProductSelectDropDown from "./ProductSelectDropDown";
import { CloseModal } from "@/components/ModalSM/ModalSM";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { RiDeleteBin6Line } from "react-icons/ri";
import GetToken from "@/hooks/getToken"; 
import { Post } from "@/services/FetchMethods";
import { useMutation } from "@tanstack/react-query";

interface BundleProps {
  image: any,
  setImage:any,
  categoryData: any;
  brandData: any;
  accountData: any;
  taxData: any;
  journalData: any;
  productData: any; // Add productData prop
  refetch: any;
  onClose: () => void;
}

interface BundleItem {
  product_uid: string;
  product_name: string;
  quantity: number;
}

const Bundle = ({
  image,
  setImage,
  categoryData,
  brandData,
  accountData,
  taxData,
  journalData,
  productData, // Add productData
  refetch,
  onClose,
}: BundleProps) => {
  const token = GetToken();  // Add this line
  const [displayComponents, setDisplayComponents] = useState(false);
  const [bundleItems, setBundleItems] = useState<BundleItem[]>([]);
  const [productOptions, setProductOptions] = useState<{label: string; value: string}[]>([]);

  const { mutate: createBundle, isPending } = useMutation({
    mutationFn: async (data: any) => {
      const res = await Post(`we/products/bundles`, { body: data, token });
      return res;
    },
    onSuccess: async (res) => {
      toast.success("Bundle Product Added Successfully");
      await refetch();
      onClose();
      CloseModal();
    },
    onError: () => {
      toast.error("Failed to add bundle product");
    },
  });

  // Get products for dropdown
  useEffect(() => {
    if (categoryData?.results) {
      const options = categoryData.results.map((product: any) => ({
        label: product.title,
        value: product.uid,
      }));
      setProductOptions(options);
    }
  }, [categoryData]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Transform bundleItems to include both product_uid and quantity
    const products_items = bundleItems.map(item => ({
      product_uid: item.product_uid,
      quantity: item.quantity,
    }));

    const data = {
      title: formData.get('title'),
      sku: formData.get('sku'),
      description: formData.get('description'),
      status: "ACTIVE",
      kind: "BUNDLE",
      products_items: products_items,
    };

    createBundle(data);
  };

  const handleRemoveItem = (index: number) => {
    setBundleItems(items => items.filter((_, idx) => idx !== index));
  };

  const handleAddLine = () => {
    setBundleItems([
      ...bundleItems,
      {
        product_uid: "",
        product_name: "",
        quantity: 1
      }
    ]);
  };

  const handleProductSelect = (index: number, selectedOption: any) => {
    const updatedItems = [...bundleItems];
    updatedItems[index] = {
      ...updatedItems[index],
      product_uid: selectedOption.value,
      product_name: selectedOption.label,
      quantity: updatedItems[index]?.quantity || 1
    };
    setBundleItems(updatedItems);
  };

  const handleQuantityChange = (index: number, value: number) => {
    const updatedItems = [...bundleItems];
    updatedItems[index] = {
      ...updatedItems[index],
      quantity: value
    };
    setBundleItems(updatedItems);
  };

  return (
    <div>
      <form className="mt-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 bg-[#F5F6FA] p-6">

          <div>
            <Label className="block font-medium text-[#5A607F]">Name*</Label>
            <Input
              name="title"
              required
              className="mt-2 h-12 w-full rounded-lg border border-[#A1A7C4] px-6 py-4"
              type="text"
            />
          </div>

          <div>
            <Label className="block font-medium text-[#5A607F]">SKU</Label>
            <Input
              name="sku"
              className="mt-2 h-12 w-full rounded-lg border border-[#A1A7C4] px-6 py-4"
              type="text"
            />
          </div>

          <div>
            <Label className="block font-medium text-[#5A607F]">Description</Label>
            <Input
              name="description"
              className="mt-2 h-12 w-full rounded-lg border border-[#A1A7C4] px-6 py-4"
              type="text"
            />
          </div>
        </div>

        <div className="mt-6 bg-[#F5F6FA] p-6">
          <div>
            <Label className="block font-medium text-[#5A607F]">
              Products/Services included in the bundle
            </Label>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={displayComponents}
                onChange={(e) => setDisplayComponents(e.target.checked)}
                className="checkbox"
              />
              <span className="font-medium text-[#111928]">
                Display bundle components when printing or sending transactions
              </span>
            </div>
          </div>

          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[#E7E7FF]">
                  <TableHead className="py-3 text-[#5A607F]">Product/Service</TableHead>
                  <TableHead className="w-32 py-3 text-[#5A607F]">Quantity</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bundleItems.map((item, index) => (
                  <TableRow key={index} className="border-b border-[#E7E7FF]">
                    <TableCell className="py-4">
                      <div className="w-full">
                        <ProductSelectDropDown
                          value={{ label: item.product_name, value: item.product_uid }}
                          setValue={(option) => handleProductSelect(index, option)}
                          // productData={productData}
                          placeholder="Select product"
                        />
                      </div>
                    </TableCell>
                    
                    <TableCell className="py-4">
                      <input
                        type="number"
                        value={item.quantity}
                        min={1}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (!isNaN(value) && value > 0) {
                            handleQuantityChange(index, value);
                          }
                        }}
                        className="w-full flex-1 border-b-2 bg-transparent px-6 py-2 outline-none focus:border-accent_soft_blue"
                      />
                    </TableCell>
                    <TableCell className="py-4">
                      <Button 
                        type="button" 
                        onClick={() => handleRemoveItem(index)}
                        className="p-2 text-red-500 hover:text-red-600"
                      >
                        <RiDeleteBin6Line className="text-xl" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Button
              type="button"  // Make sure this is explicitly set to "button"
              onClick={handleAddLine}
              className="mt-4 font-medium text-[#6A6EF6] hover:text-[#5559DD]"
            >
              <span className="text-xl">+</span> Add Product
            </Button>
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <Button 
            type="submit" 
            className="min-w-[120px] rounded-lg bg-[#00035F] px-6 py-3 text-white transition-colors hover:bg-[#000275]"
            isLoading={isPending}
          >
            {isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Bundle;