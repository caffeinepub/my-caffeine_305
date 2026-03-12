import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface OrderItem {
    unit: string;
    productId: bigint;
    productName: string;
    quantity: number;
    price: number;
}
export interface Order {
    id: bigint;
    customerName: string;
    status: string;
    latitude: number;
    deliveryCharge: number;
    total: number;
    customerPhone: string;
    distanceKm: number;
    longitude: number;
    village: string;
    timestamp: bigint;
    customerId: string;
    items: Array<OrderItem>;
    subtotal: number;
}
export interface UserProfile {
    name: string;
    village: string;
    phone: string;
}
export interface Product {
    id: bigint;
    name: string;
    unit: string;
    available: boolean;
    imageUrl: string;
    category: string;
    price: number;
}
export interface DeliverySettings {
    forwardRate: number;
    reverseRate: number;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addProduct(name: string, category: string, price: number, unit: string, imageUrl: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteProduct(id: bigint): Promise<void>;
    getAllOrders(): Promise<Array<Order>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDeliverySettings(): Promise<DeliverySettings>;
    getOrder(id: bigint): Promise<Order>;
    getOrdersByCustomer(customerPhone: string): Promise<Array<Order>>;
    getProduct(id: bigint): Promise<Product>;
    getProducts(): Promise<Array<Product>>;
    getProductsByCategory(category: string): Promise<Array<Product>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializeAdmin(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    markDelivered(orderId: bigint): Promise<void>;
    placeOrder(customerId: string, customerName: string, customerPhone: string, village: string, items: Array<OrderItem>, subtotal: number, distanceKm: number, deliveryCharge: number, total: number, latitude: number, longitude: number): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateDeliverySettings(settings: DeliverySettings): Promise<void>;
    updateProduct(id: bigint, name: string, category: string, price: number, unit: string, imageUrl: string, available: boolean): Promise<void>;
}
