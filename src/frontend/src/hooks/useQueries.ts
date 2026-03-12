import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Order, OrderItem, Product, UserProfile } from "../backend.d";
import { useActor } from "./useActor";

export function useProducts() {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useProductsByCategory(category: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ["products", category],
    queryFn: async () => {
      if (!actor) return [];
      if (category === "সব") return actor.getProducts();
      return actor.getProductsByCategory(category);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useOrdersByCustomer(phone: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["orders", phone],
    queryFn: async () => {
      if (!actor || !phone) return [];
      return actor.getOrdersByCustomer(phone);
    },
    enabled: !!actor && !isFetching && !!phone,
  });
}

export function useAllOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["allOrders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCallerProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["callerProfile"] });
    },
  });
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      customerId: string;
      customerName: string;
      customerPhone: string;
      village: string;
      items: OrderItem[];
      subtotal: number;
      distanceKm: number;
      deliveryCharge: number;
      total: number;
      latitude: number;
      longitude: number;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.placeOrder(
        params.customerId,
        params.customerName,
        params.customerPhone,
        params.village,
        params.items,
        params.subtotal,
        params.distanceKm,
        params.deliveryCharge,
        params.total,
        params.latitude,
        params.longitude,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useAddProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      name: string;
      category: string;
      price: number;
      unit: string;
      imageUrl: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.addProduct(p.name, p.category, p.price, p.unit, p.imageUrl);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      id: bigint;
      name: string;
      category: string;
      price: number;
      unit: string;
      imageUrl: string;
      available: boolean;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updateProduct(
        p.id,
        p.name,
        p.category,
        p.price,
        p.unit,
        p.imageUrl,
        p.available,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteProduct(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useMarkDelivered() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.markDelivered(orderId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allOrders"] });
    },
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useDeliverySettings() {
  const { actor, isFetching } = useActor();
  return useQuery<{ forwardRate: number; reverseRate: number }>({
    queryKey: ["deliverySettings"],
    queryFn: async () => {
      if (!actor) return { forwardRate: 10, reverseRate: 4 };
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return await (actor as any).getDeliverySettings();
      } catch {
        return { forwardRate: 10, reverseRate: 4 };
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateDeliverySettings() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (settings: {
      forwardRate: number;
      reverseRate: number;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).updateDeliverySettings(settings);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["deliverySettings"] });
    },
  });
}

export function useSeedProducts() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).seedDefaultProducts();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
