import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
    phone : Text;
    village : Text;
  };

  type Product = {
    id : Nat;
    name : Text;
    category : Text;
    price : Float;
    unit : Text;
    imageUrl : Text;
    available : Bool;
  };

  type OrderItem = {
    productId : Nat;
    productName : Text;
    quantity : Float;
    price : Float;
    unit : Text;
  };

  type Order = {
    id : Nat;
    customerId : Text;
    customerName : Text;
    customerPhone : Text;
    village : Text;
    items : [OrderItem];
    subtotal : Float;
    distanceKm : Float;
    deliveryCharge : Float;
    total : Float;
    status : Text;
    latitude : Float;
    longitude : Float;
    timestamp : Int;
  };

  public type DeliverySettings = {
    forwardRate : Float;
    reverseRate : Float;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let products = Map.empty<Nat, Product>();
  let orders = Map.empty<Nat, Order>();
  var nextProductId = 1;
  var nextOrderId = 1;
  var deliverySettings : DeliverySettings = { forwardRate = 10.0; reverseRate = 4.0 };

  let _autoSeed : () = do {
    let kg = "kg";
    let pcs = "pcs";
    let litre = "litre";
    let bottle = "bottle";

    let initialProducts : [Product] = [
      // Grocery
      { id = 1;  name = "\u{099A}\u{09BE}\u{09B2}";                                                     category = "Grocery";    price = 55.0;  unit = kg;     imageUrl = "https://upload.wikimedia.org/wikipedia/commons/6/60/Rice_grains.jpg";                                        available = true },
      { id = 2;  name = "\u{0986}\u{099F}\u{09BE}";                                                     category = "Grocery";    price = 40.0;  unit = kg;     imageUrl = "https://upload.wikimedia.org/wikipedia/commons/6/6c/Wheat_flour.jpg";                                       available = true },
      { id = 3;  name = "\u{099A}\u{09BF}\u{09A8}\u{09BF}";                                            category = "Grocery";    price = 45.0;  unit = kg;     imageUrl = "https://upload.wikimedia.org/wikipedia/commons/4/4a/Sugar_cubes.jpg";                                       available = true },
      { id = 4;  name = "\u{09A1}\u{09BE}\u{09B2}";                                                     category = "Grocery";    price = 90.0;  unit = kg;     imageUrl = "https://upload.wikimedia.org/wikipedia/commons/5/5d/Lentils.jpg";                                           available = true },
      { id = 5;  name = "\u{09B2}\u{09AC}\u{09A3}";                                                    category = "Grocery";    price = 20.0;  unit = kg;     imageUrl = "https://upload.wikimedia.org/wikipedia/commons/5/58/Table_salt.jpg";                                         available = true },
      // Vegetables
      { id = 6;  name = "\u{0986}\u{09B2}\u{09C1}";                                                     category = "Vegetables"; price = 20.0;  unit = kg;     imageUrl = "https://upload.wikimedia.org/wikipedia/commons/6/60/Potato.jpg";                                          available = true },
      { id = 7;  name = "\u{09AA}\u{09BF}\u{09AF}\u{09BC}\u{09BE}\u{099C}";                           category = "Vegetables"; price = 30.0;  unit = kg;     imageUrl = "https://upload.wikimedia.org/wikipedia/commons/2/25/Onion_on_White.JPG";                                    available = true },
      { id = 8;  name = "\u{099F}\u{09AE}\u{09C7}\u{099F}\u{09CB}";                                   category = "Vegetables"; price = 25.0;  unit = kg;     imageUrl = "https://upload.wikimedia.org/wikipedia/commons/8/89/Tomato_je.jpg";                                         available = true },
      { id = 9;  name = "\u{09AC}\u{09C7}\u{0997}\u{09C1}\u{09A8}";                                   category = "Vegetables"; price = 35.0;  unit = kg;     imageUrl = "https://upload.wikimedia.org/wikipedia/commons/1/15/Eggplant.jpg";                                          available = true },
      { id = 10; name = "\u{09B2}\u{09BE}\u{0989}";                                                    category = "Vegetables"; price = 40.0;  unit = pcs;    imageUrl = "https://upload.wikimedia.org/wikipedia/commons/2/24/Bottle_gourd.jpg";                                        available = true },
      { id = 11; name = "\u{09AC}\u{09BE}\u{0981}\u{09A7}\u{09BE}\u{0995}\u{09AA}\u{09BF}";          category = "Vegetables"; price = 30.0;  unit = kg;     imageUrl = "https://upload.wikimedia.org/wikipedia/commons/6/6f/Cabbage.jpg";                                           available = true },
      { id = 12; name = "\u{09AB}\u{09C1}\u{09B2}\u{0995}\u{09AA}\u{09BF}";                          category = "Vegetables"; price = 35.0;  unit = pcs;    imageUrl = "https://upload.wikimedia.org/wikipedia/commons/2/2f/Cauliflower.jpg";                                        available = true },
      { id = 13; name = "\u{0997}\u{09BE}\u{099C}\u{09B0}";                                           category = "Vegetables"; price = 30.0;  unit = kg;     imageUrl = "https://upload.wikimedia.org/wikipedia/commons/7/7e/Carrot.jpg";                                            available = true },
      { id = 14; name = "\u{09B6}\u{09B8}\u{09BE}";                                                    category = "Vegetables"; price = 20.0;  unit = kg;     imageUrl = "https://upload.wikimedia.org/wikipedia/commons/9/96/Cucumis_sativus.jpg";                                     available = true },
      { id = 15; name = "\u{0995}\u{09C1}\u{09AE}\u{09A1}\u{09BC}\u{09CB}";                          category = "Vegetables"; price = 30.0;  unit = pcs;    imageUrl = "https://upload.wikimedia.org/wikipedia/commons/5/5c/Pumpkin.jpg";                                           available = true },
      { id = 16; name = "\u{0995}\u{09B0}\u{09B2}\u{09BE}";                                           category = "Vegetables"; price = 40.0;  unit = kg;     imageUrl = "https://upload.wikimedia.org/wikipedia/commons/5/59/Bitter_melon.jpg";                                       available = true },
      { id = 17; name = "\u{09A2}\u{09C7}\u{0981}\u{09A1}\u{09BC}\u{09B8}";                          category = "Vegetables"; price = 40.0;  unit = kg;     imageUrl = "https://upload.wikimedia.org/wikipedia/commons/3/3e/Okra.jpg";                                              available = true },
      { id = 18; name = "\u{09B6}\u{09BF}\u{09AE}";                                                    category = "Vegetables"; price = 50.0;  unit = kg;     imageUrl = "https://upload.wikimedia.org/wikipedia/commons/6/6c/Green_beans.jpg";                                       available = true },
      { id = 19; name = "\u{09AE}\u{099F}\u{09B0}\u{09B6}\u{09C1}\u{0981}\u{099F}\u{09BF}";         category = "Vegetables"; price = 60.0;  unit = kg;     imageUrl = "https://upload.wikimedia.org/wikipedia/commons/3/3d/Peas.jpg";                                              available = true },
      // Fish
      { id = 20; name = "\u{09B0}\u{09C1}\u{0987} \u{09AE}\u{09BE}\u{099B}";                         category = "Fish";       price = 180.0; unit = kg;     imageUrl = "https://upload.wikimedia.org/wikipedia/commons/4/40/Labeo_rohita.jpg";                                       available = true },
      { id = 21; name = "\u{0995}\u{09BE}\u{09A4}\u{09B2}\u{09BE} \u{09AE}\u{09BE}\u{099B}";        category = "Fish";       price = 200.0; unit = kg;     imageUrl = "https://upload.wikimedia.org/wikipedia/commons/4/41/Simple_fish_02.svg";                                    available = true },
      { id = 22; name = "\u{099A}\u{09BF}\u{0982}\u{09DC}\u{09BF}";                                   category = "Fish";       price = 350.0; unit = kg;     imageUrl = "https://upload.wikimedia.org/wikipedia/commons/b/b6/Penaeus_monodon_from_Merambong_shoal%2C_Malaysia.jpg"; available = true },
      // Meat
      { id = 23; name = "\u{09AE}\u{09C1}\u{09B0}\u{0997}\u{09BF}";                                   category = "Meat";       price = 220.0; unit = kg;     imageUrl = "https://upload.wikimedia.org/wikipedia/commons/1/1f/Bantam_chicken.jpg";                                    available = true },
      { id = 24; name = "\u{0996}\u{09BE}\u{09B8}\u{09BF}";                                           category = "Meat";       price = 450.0; unit = kg;     imageUrl = "https://upload.wikimedia.org/wikipedia/commons/2/2c/Feral_goat.jpg";                                       available = true },
      // Household (Daily Use)
      { id = 25; name = "\u{09B8}\u{09AF}\u{09BC}\u{09BE}\u{09AC}\u{09BF}\u{09A8} \u{09A4}\u{09C7}\u{09B2}"; category = "Household"; price = 120.0; unit = litre;  imageUrl = "https://upload.wikimedia.org/wikipedia/commons/e/e9/Sunflower_oil.jpg";                         available = true },
      { id = 26; name = "\u{09B2}\u{09BE}\u{0987}\u{09AB}\u{09AC}\u{09AF}\u{09BC} \u{09B8}\u{09BE}\u{09AC}\u{09BE}\u{09A8}"; category = "Household"; price = 35.0; unit = pcs; imageUrl = "https://upload.wikimedia.org/wikipedia/commons/8/8d/Soap-bar.jpg";              available = true },
      { id = 27; name = "\u{0995}\u{09CD}\u{09B2}\u{09BF}\u{09A8}\u{09BF}\u{0995} \u{09AA}\u{09CD}\u{09B2}\u{09BE}\u{09B8}"; category = "Household"; price = 120.0; unit = bottle; imageUrl = "https://upload.wikimedia.org/wikipedia/commons/3/31/Shampoo.jpg";            available = true },
      { id = 28; name = "\u{09A8}\u{09BF}\u{09AD}\u{09BF}\u{09AF}\u{09BC}\u{09BE} \u{09B2}\u{09CB}\u{09B6}\u{09A8}"; category = "Household"; price = 250.0; unit = bottle; imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Shampoo.jpg/440px-Shampoo.jpg"; available = true },
    ];

    for (product in initialProducts.values()) {
      products.add(product.id, product);
    };
    nextProductId := 29;
  };

  // Delivery Settings
  public query func getDeliverySettings() : async DeliverySettings {
    deliverySettings;
  };

  public shared func updateDeliverySettings(settings : DeliverySettings) : async () {
    deliverySettings := settings;
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func initializeAdmin() : async Bool {
    if (caller.isAnonymous()) { return false };
    if (not accessControlState.adminAssigned) {
      accessControlState.userRoles.add(caller, #admin);
      accessControlState.adminAssigned := true;
      return true;
    };
    AccessControl.isAdmin(accessControlState, caller);
  };

  // Product Management
  public shared func addProduct(
    name : Text,
    category : Text,
    price : Float,
    unit : Text,
    imageUrl : Text
  ) : async Nat {
    let product : Product = {
      id = nextProductId;
      name;
      category;
      price;
      unit;
      imageUrl;
      available = true;
    };
    products.add(nextProductId, product);
    nextProductId += 1;
    product.id;
  };

  public shared func updateProduct(
    id : Nat,
    name : Text,
    category : Text,
    price : Float,
    unit : Text,
    imageUrl : Text,
    available : Bool,
  ) : async () {
    if (not products.containsKey(id)) {
      Runtime.trap("Product not found");
    };
    products.add(id, { id; name; category; price; unit; imageUrl; available });
  };

  public shared func deleteProduct(id : Nat) : async () {
    if (not products.containsKey(id)) {
      Runtime.trap("Product not found");
    };
    products.remove(id);
  };

  public query func getProducts() : async [Product] {
    products.values().toArray();
  };

  public query func getProductsByCategory(category : Text) : async [Product] {
    products.values().toArray().filter(func(p) { p.category == category });
  };

  public query func getProduct(id : Nat) : async Product {
    switch (products.get(id)) {
      case (?product) { product };
      case (null) { Runtime.trap("Product not found") };
    };
  };

  // Order Management
  public shared func placeOrder(
    customerId : Text,
    customerName : Text,
    customerPhone : Text,
    village : Text,
    items : [OrderItem],
    subtotal : Float,
    distanceKm : Float,
    deliveryCharge : Float,
    total : Float,
    latitude : Float,
    longitude : Float
  ) : async Nat {
    let order : Order = {
      id = nextOrderId;
      customerId;
      customerName;
      customerPhone;
      village;
      items;
      subtotal;
      distanceKm;
      deliveryCharge;
      total;
      status = "Pending";
      latitude;
      longitude;
      timestamp = Time.now();
    };
    orders.add(nextOrderId, order);
    nextOrderId += 1;
    order.id;
  };

  public query func getOrdersByCustomer(customerPhone : Text) : async [Order] {
    orders.values().toArray().filter(func(o) { o.customerPhone == customerPhone });
  };

  public query func getAllOrders() : async [Order] {
    orders.values().toArray();
  };

  public shared func markDelivered(orderId : Nat) : async () {
    switch (orders.get(orderId)) {
      case (?order) {
        orders.add(orderId, {
          id = order.id;
          customerId = order.customerId;
          customerName = order.customerName;
          customerPhone = order.customerPhone;
          village = order.village;
          items = order.items;
          subtotal = order.subtotal;
          distanceKm = order.distanceKm;
          deliveryCharge = order.deliveryCharge;
          total = order.total;
          status = "Delivered";
          latitude = order.latitude;
          longitude = order.longitude;
          timestamp = order.timestamp;
        });
      };
      case (null) { Runtime.trap("Order not found") };
    };
  };

  public query ({ caller }) func getOrder(id : Nat) : async Order {
    switch (orders.get(id)) {
      case (?order) { order };
      case (null) { Runtime.trap("Order not found") };
    };
  };
};
