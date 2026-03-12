# আমার গ্রাম ডেলিভারি

## Current State
Admin panel uses localStorage-based password authentication (`jharkhali2024`). However, backend functions (addProduct, updateProduct, deleteProduct, updateDeliverySettings, getAllOrders, markDelivered) check for ICP Internet Identity admin role via AccessControl. This causes "Unauthorized" errors when admin tries to save products or delivery settings, since the anonymous principal is never assigned admin role.

## Requested Changes (Diff)

### Add
- Nothing new

### Modify
- Backend: Remove `AccessControl.isAdmin` checks from `addProduct`, `updateProduct`, `deleteProduct`, `updateDeliverySettings`, `getAllOrders`, `markDelivered` so they work with anonymous (frontend-password-authenticated) callers
- Backend: Keep `getOrdersByCustomer` accessible without strict auth since customers use simplified login

### Remove
- Backend: Remove dependency on Internet Identity admin role for admin operations

## Implementation Plan
1. Update `main.mo` to remove authorization checks from admin-only write functions
2. Keep all function signatures the same so frontend bindings still work
