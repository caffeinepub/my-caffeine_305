import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, LogOut, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Product } from "../backend.d";
import {
  useAddProduct,
  useAllOrders,
  useDeleteProduct,
  useDeliverySettings,
  useMarkDelivered,
  useProducts,
  useUpdateDeliverySettings,
  useUpdateProduct,
} from "../hooks/useQueries";

const ADMIN_SESSION_KEY = "admin_logged_in";

const CATEGORIES = [
  { id: "Grocery", label: "মুদিখানা" },
  { id: "Fish", label: "মাছ" },
  { id: "Chicken", label: "মুরগি" },
  { id: "Vegetables", label: "সবজি" },
  { id: "Medicine", label: "ওষুধ" },
  { id: "Household", label: "গৃহস্থালি" },
];

interface ProductFormData {
  name: string;
  category: string;
  price: string;
  unit: string;
  imageUrl: string;
  available: boolean;
}

const EMPTY_FORM: ProductFormData = {
  name: "",
  category: "Grocery",
  price: "",
  unit: "কেজি",
  imageUrl: "",
  available: true,
};

function ProductForm({
  initial,
  onSubmit,
  loading,
}: {
  initial: ProductFormData;
  onSubmit: (data: ProductFormData) => void;
  loading: boolean;
}) {
  const [form, setForm] = useState<ProductFormData>(initial);

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label>পণ্যের নাম</Label>
        <Input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="যেমন: আলু"
          data-ocid="admin.product.name.input"
        />
      </div>
      <div className="space-y-1">
        <Label>ক্যাটাগরি</Label>
        <Select
          value={form.category}
          onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
        >
          <SelectTrigger data-ocid="admin.product.category.select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>দাম (₹)</Label>
          <Input
            type="number"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            placeholder="০"
            data-ocid="admin.product.price.input"
          />
        </div>
        <div className="space-y-1">
          <Label>একক</Label>
          <Input
            value={form.unit}
            onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
            placeholder="কেজি / পিস"
            data-ocid="admin.product.unit.input"
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label>ছবির URL</Label>
        <Input
          value={form.imageUrl}
          onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
          placeholder="https://..."
          data-ocid="admin.product.image.input"
        />
      </div>
      <div className="flex items-center gap-3">
        <Switch
          checked={form.available}
          onCheckedChange={(v) => setForm((f) => ({ ...f, available: v }))}
          data-ocid="admin.product.available.switch"
        />
        <Label>উপলব্ধ</Label>
      </div>
      <Button
        className="w-full bg-primary rounded-xl"
        onClick={() => onSubmit(form)}
        disabled={loading}
        data-ocid="admin.product.save_button"
      >
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        সংরক্ষণ করুন
      </Button>
    </div>
  );
}

function DeliverySettingsForm() {
  const { data: settings } = useDeliverySettings();
  const updateSettings = useUpdateDeliverySettings();
  const [forwardRate, setForwardRate] = useState("");
  const [reverseRate, setReverseRate] = useState("");

  useEffect(() => {
    if (settings) {
      setForwardRate(String(settings.forwardRate));
      setReverseRate(String(settings.reverseRate));
    }
  }, [settings]);

  const handleSave = async () => {
    const fwd = Number(forwardRate);
    const rev = Number(reverseRate);
    if (!fwd || !rev || fwd <= 0 || rev <= 0) {
      toast.error("সঠিক রেট দিন");
      return;
    }
    try {
      await updateSettings.mutateAsync({ forwardRate: fwd, reverseRate: rev });
      toast.success("ডেলিভারি রেট আপডেট হয়েছে");
    } catch {
      toast.error("আপডেট করতে সমস্যা হয়েছে");
    }
  };

  return (
    <div className="bg-white rounded-2xl card-shadow p-4 space-y-4">
      <h3 className="font-bold text-base">ডেলিভারি রেট সেটিংস</h3>
      <div className="space-y-1">
        <Label>ফরওয়ার্ড রেট (₹/কিমি)</Label>
        <Input
          type="number"
          value={forwardRate}
          onChange={(e) => setForwardRate(e.target.value)}
          placeholder="১০"
          data-ocid="admin.settings.forward_rate.input"
        />
      </div>
      <div className="space-y-1">
        <Label>রিভার্স রেট (₹/কিমি)</Label>
        <Input
          type="number"
          value={reverseRate}
          onChange={(e) => setReverseRate(e.target.value)}
          placeholder="৪"
          data-ocid="admin.settings.reverse_rate.input"
        />
      </div>
      <Button
        className="w-full bg-primary rounded-xl"
        onClick={handleSave}
        disabled={updateSettings.isPending}
        data-ocid="admin.settings.save_button"
      >
        {updateSettings.isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        সংরক্ষণ করুন
      </Button>
    </div>
  );
}

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const { data: products = [], isLoading: prodLoading } = useProducts();
  const { data: orders = [], isLoading: orderLoading } = useAllOrders();
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const markDelivered = useMarkDelivered();

  const [addOpen, setAddOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  // Check admin session
  useEffect(() => {
    const isAdmin = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!isAdmin) {
      navigate({ to: "/admin" });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    navigate({ to: "/" });
  };

  const handleAdd = async (form: ProductFormData) => {
    if (!form.name || !form.price) {
      toast.error("নাম এবং দাম আবশ্যক");
      return;
    }
    try {
      await addProduct.mutateAsync({
        name: form.name,
        category: form.category,
        price: Number(form.price),
        unit: form.unit,
        imageUrl: form.imageUrl,
      });
      toast.success("পণ্য যোগ করা হয়েছে");
      setAddOpen(false);
    } catch {
      toast.error("পণ্য যোগ করতে সমস্যা হয়েছে");
    }
  };

  const handleEdit = async (form: ProductFormData) => {
    if (!editProduct) return;
    try {
      await updateProduct.mutateAsync({
        id: editProduct.id,
        name: form.name,
        category: form.category,
        price: Number(form.price),
        unit: form.unit,
        imageUrl: form.imageUrl,
        available: form.available,
      });
      toast.success("পণ্য আপডেট হয়েছে");
      setEditProduct(null);
    } catch {
      toast.error("আপডেট করতে সমস্যা হয়েছে");
    }
  };

  const handleDelete = async (id: bigint) => {
    if (!confirm("এই পণ্য মুছে ফেলবেন?")) return;
    try {
      await deleteProduct.mutateAsync(id);
      toast.success("পণ্য মুছে ফেলা হয়েছে");
    } catch {
      toast.error("মুছতে সমস্যা হয়েছে");
    }
  };

  const handleMarkDelivered = async (orderId: bigint) => {
    try {
      await markDelivered.mutateAsync(orderId);
      toast.success("ডেলিভারি মার্ক করা হয়েছে");
    } catch {
      toast.error("আপডেট করতে সমস্যা হয়েছে");
    }
  };

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) / 1_000_000).toLocaleDateString("bn-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const sortedOrders = [...orders].sort(
    (a, b) => Number(b.timestamp) - Number(a.timestamp),
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <img
            src="/assets/generated/logo-transparent.dim_300x300.png"
            alt=""
            className="h-8 w-8 rounded-full bg-white object-cover"
          />
          <div>
            <p className="font-bold text-sm">অ্যাডমিন প্যানেল</p>
            <p className="text-[10px] opacity-70">আমার গ্রাম ডেলিভারি</p>
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="text-primary-foreground hover:bg-white/20"
          onClick={handleLogout}
          data-ocid="admin.logout.button"
        >
          <LogOut className="h-4 w-4 mr-1" />
          লগআউট
        </Button>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4">
        <Tabs defaultValue="products" data-ocid="admin.tabs">
          <TabsList className="w-full mb-4">
            <TabsTrigger
              value="products"
              className="flex-1"
              data-ocid="admin.products.tab"
            >
              পণ্য
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="flex-1"
              data-ocid="admin.orders.tab"
            >
              অর্ডার
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="flex-1"
              data-ocid="admin.settings.tab"
            >
              ⚙️ সেটিংস
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <div className="flex justify-between items-center mb-3">
              <p className="font-semibold">{products.length}টি পণ্য</p>
              <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="bg-primary rounded-xl"
                    data-ocid="admin.product.open_modal_button"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    নতুন পণ্য যোগ
                  </Button>
                </DialogTrigger>
                <DialogContent data-ocid="admin.product.dialog">
                  <DialogHeader>
                    <DialogTitle>নতুন পণ্য যোগ করুন</DialogTitle>
                  </DialogHeader>
                  <ProductForm
                    initial={EMPTY_FORM}
                    onSubmit={handleAdd}
                    loading={addProduct.isPending}
                  />
                </DialogContent>
              </Dialog>
            </div>

            {prodLoading ? (
              <div
                className="space-y-2"
                data-ocid="admin.products.loading_state"
              >
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 rounded-xl" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div
                className="text-center py-12"
                data-ocid="admin.products.empty_state"
              >
                <p className="text-muted-foreground">কোনো পণ্য নেই</p>
              </div>
            ) : (
              <div className="space-y-2" data-ocid="admin.products.list">
                {products.map((p, i) => (
                  <div
                    key={p.id.toString()}
                    className="bg-white rounded-xl card-shadow p-3 flex items-center gap-3"
                    data-ocid={`admin.products.item.${i + 1}`}
                  >
                    <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>📦</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-1">
                        {p.name}
                      </p>
                      <div className="flex gap-2 items-center">
                        <p className="text-xs text-muted-foreground">
                          ₹{p.price}/{p.unit}
                        </p>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            p.available
                              ? "text-primary border-primary/30"
                              : "text-muted-foreground"
                          }`}
                        >
                          {p.available ? "উপলব্ধ" : "অনুপলব্ধ"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Dialog
                        open={editProduct?.id === p.id}
                        onOpenChange={(o) => {
                          if (!o) setEditProduct(null);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => setEditProduct(p)}
                            data-ocid={`admin.product.edit_button.${i + 1}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent data-ocid="admin.product.edit.dialog">
                          <DialogHeader>
                            <DialogTitle>পণ্য সম্পাদনা</DialogTitle>
                          </DialogHeader>
                          {editProduct && (
                            <ProductForm
                              initial={{
                                name: editProduct.name,
                                category: editProduct.category,
                                price: String(editProduct.price),
                                unit: editProduct.unit,
                                imageUrl: editProduct.imageUrl,
                                available: editProduct.available,
                              }}
                              onSubmit={handleEdit}
                              loading={updateProduct.isPending}
                            />
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(p.id)}
                        data-ocid={`admin.product.delete_button.${i + 1}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <p className="font-semibold mb-3">{orders.length}টি অর্ডার</p>

            {orderLoading ? (
              <div className="space-y-2" data-ocid="admin.orders.loading_state">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 rounded-xl" />
                ))}
              </div>
            ) : sortedOrders.length === 0 ? (
              <div
                className="text-center py-12"
                data-ocid="admin.orders.empty_state"
              >
                <p className="text-muted-foreground">কোনো অর্ডার নেই</p>
              </div>
            ) : (
              <div className="space-y-3" data-ocid="admin.orders.list">
                {sortedOrders.map((order, i) => (
                  <div
                    key={order.id.toString()}
                    className="bg-white rounded-2xl card-shadow p-4"
                    data-ocid={`admin.orders.item.${i + 1}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-sm">
                          #{order.id.toString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(order.timestamp)}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          order.status === "Delivered"
                            ? "text-primary border-primary/30"
                            : "text-accent border-accent/30"
                        }
                      >
                        {order.status === "Delivered"
                          ? "ডেলিভারি হয়েছে"
                          : "মুলতুবি"}
                      </Badge>
                    </div>

                    <div className="text-sm space-y-0.5 mb-2">
                      <p>
                        <span className="text-muted-foreground">নাম:</span>{" "}
                        {order.customerName}
                      </p>
                      <p>
                        <span className="text-muted-foreground">ফোন:</span>{" "}
                        {order.customerPhone}
                      </p>
                      <p>
                        <span className="text-muted-foreground">গ্রাম:</span>{" "}
                        {order.village}
                      </p>
                    </div>

                    <div className="text-xs text-muted-foreground mb-2">
                      {order.items.map((item) => (
                        <span key={item.productId.toString()} className="mr-2">
                          {item.productName}×{item.quantity}
                        </span>
                      ))}
                    </div>

                    <div className="flex justify-between text-xs mb-3">
                      <span className="text-muted-foreground">
                        দূরত্ব: {order.distanceKm.toFixed(1)} কিমি | ডেলিভারি: ₹
                        {order.deliveryCharge.toFixed(0)}
                      </span>
                      <span className="font-bold text-primary">
                        মোট: ₹{order.total.toFixed(0)}
                      </span>
                    </div>

                    {order.status !== "Delivered" && (
                      <Button
                        size="sm"
                        className="w-full bg-primary rounded-xl text-xs h-8"
                        onClick={() => handleMarkDelivered(order.id)}
                        disabled={markDelivered.isPending}
                        data-ocid={`admin.orders.deliver_button.${i + 1}`}
                      >
                        {markDelivered.isPending ? (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : null}
                        ✅ ডেলিভারি হয়েছে
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <DeliverySettingsForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
