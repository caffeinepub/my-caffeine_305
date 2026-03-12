import Map "mo:core/Map";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Array "mo:core/Array";
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

  // Seed all 27 products at actor initialization
  let _autoSeed : () = do {
    let kg = "\u{0995}\u{09C7}\u{099C}";
    let pcs = "\u{09AA}\u{09BF}\u{09B8}";
    let liter = "\u{09B2}\u{09BF}\u{099F}\u{09BE}\u{09B0}";
    let bottle = "\u{09AC}\u{09CB}\u{09A4}\u{09B2}";
    let sheet = "\u{09AA}\u{09BE}\u{09A4}\u{09BE}";
    let bunch = "\u{0986}\u{0981}\u{099F}";

    let initialProducts : [Product] = [
      // Grocery
      { id = 1;  name = "\u{0986}\u{09B2}\u{09C1}";                    category = "Grocery";   price = 20.0;  unit = kg;     imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Potato_je.jpg/440px-Potato_je.jpg"; available = true },
      { id = 2;  name = "\u{09AA}\u{09BF}\u{09AF}\u{09BC}\u{09BE}\u{099C}";            category = "Grocery";   price = 30.0;  unit = kg;     imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Onions.jpg/440px-Onions.jpg"; available = true },
      { id = 3;  name = "\u{09B0}\u{09B8}\u{09C1}\u{09A8}";                   category = "Grocery";   price = 15.0;  unit = kg;     imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Garlic_knife.jpg/440px-Garlic_knife.jpg"; available = true },
      { id = 4;  name = "\u{0986}\u{09A6}\u{09BE}";                    category = "Grocery";   price = 40.0;  unit = kg;     imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Fresh_ginger_with_cross_section.jpg/440px-Fresh_ginger_with_cross_section.jpg"; available = true },
      { id = 5;  name = "\u{09AE}\u{09B8}\u{09C1}\u{09B0} \u{09A1}\u{09BE}\u{09B2}";         category = "Grocery";   price = 90.0;  unit = kg;     imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Closeup_of_Lentil_seeds.JPG/440px-Closeup_of_Lentil_seeds.JPG"; available = true },
      { id = 6;  name = "\u{099A}\u{09BF}\u{09A8}\u{09BF}";                   category = "Grocery";   price = 45.0;  unit = kg;     imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Sugar_1.jpg/440px-Sugar_1.jpg"; available = true },
      { id = 7;  name = "\u{09B2}\u{09AC}\u{09A3}";                   category = "Grocery";   price = 20.0;  unit = kg;     imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Rock_salt.jpg/440px-Rock_salt.jpg"; available = true },
      { id = 8;  name = "\u{099A}\u{09BE}\u{09B2}";                    category = "Grocery";   price = 55.0;  unit = kg;     imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/White_rice_%28cooked%29.jpg/440px-White_rice_%28cooked%29.jpg"; available = true },
      // Vegetables
      { id = 9;  name = "\u{099F}\u{09AE}\u{09C7}\u{099F}\u{09CB}";              category = "Vegetables"; price = 25.0; unit = kg;     imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Salad_garden_tomatoes.jpg/440px-Salad_garden_tomatoes.jpg"; available = true },
      { id = 10; name = "\u{09AC}\u{09C7}\u{0997}\u{09C1}\u{09A8}";              category = "Vegetables"; price = 30.0; unit = kg;     imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Eggplant_2.jpg/440px-Eggplant_2.jpg"; available = true },
      { id = 11; name = "\u{09AA}\u{09C7}\u{09A4}\u{09C7} \u{09B6}\u{09BE}\u{0995}";        category = "Vegetables"; price = 15.0; unit = bunch;  imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Fresh_potatoes_in_a_wooden_bowl.jpg/440px-Fresh_potatoes_in_a_wooden_bowl.jpg"; available = true },
      { id = 12; name = "\u{09B6}\u{09B6}\u{09BE}";                   category = "Vegetables"; price = 20.0; unit = pcs;    imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Cucumber_closeup.jpg/440px-Cucumber_closeup.jpg"; available = true },
      // Fish
      { id = 13; name = "\u{09B0}\u{09C1}\u{0987} \u{09AE}\u{09BE}\u{099B}";         category = "Fish";      price = 180.0; unit = kg;    imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Simple_fish_02.svg/440px-Simple_fish_02.svg.png"; available = true },
      { id = 14; name = "\u{0995}\u{09BE}\u{09A4}\u{09B2}\u{09BE} \u{09AE}\u{09BE}\u{099B}";    category = "Fish";      price = 200.0; unit = kg;    imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Simple_fish_02.svg/440px-Simple_fish_02.svg.png"; available = true },
      { id = 15; name = "\u{0987}\u{09B2}\u{09BF}\u{09B6} \u{09AE}\u{09BE}\u{099B}";      category = "Fish";      price = 350.0; unit = kg;    imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Simple_fish_02.svg/440px-Simple_fish_02.svg.png"; available = true },
      { id = 16; name = "\u{099A}\u{09BF}\u{0982}\u{09DC}\u{09BF}";              category = "Fish";      price = 400.0; unit = kg;    imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Simple_fish_02.svg/440px-Simple_fish_02.svg.png"; available = true },
      // Chicken
      { id = 17; name = "\u{09AE}\u{09C1}\u{09B0}\u{0997}\u{09BF}";              category = "Chicken";   price = 220.0; unit = kg;    imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Good_Food_Display_-_NCI_Visuals_Online.jpg/440px-Good_Food_Display_-_NCI_Visuals_Online.jpg"; available = true },
      { id = 18; name = "\u{09A1}\u{09BF}\u{09AE}";                    category = "Chicken";   price = 8.0;   unit = pcs;   imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Chicken_Egg_1_transparent.png/440px-Chicken_Egg_1_transparent.png"; available = true },
      // Medicine
      { id = 19; name = "\u{09AA}\u{09CD}\u{09AF}\u{09BE}\u{09B0}\u{09BE}\u{09B8}\u{09BF}\u{099F}\u{09BE}\u{09AE}\u{09B2}";  category = "Medicine"; price = 12.0; unit = sheet; imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Paracetamol_tablets.jpg/440px-Paracetamol_tablets.jpg"; available = true },
      { id = 20; name = "\u{0993}\u{09B0}\u{09BE}\u{09B2}\u{09B8}\u{09CD}\u{09AF}\u{09BE}\u{09B2}\u{09BE}\u{0987}\u{09A8}"; category = "Medicine"; price = 15.0; unit = sheet; imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Paracetamol_tablets.jpg/440px-Paracetamol_tablets.jpg"; available = true },
      // Household - Tel (Oil)
      { id = 21; name = "\u{09B8}\u{09B0}\u{09BF}\u{09B7}\u{09BE} \u{09A4}\u{09C7}\u{09B2}";       category = "Household"; price = 150.0; unit = liter;  imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Sunflower_oil.jpg/440px-Sunflower_oil.jpg"; available = true },
      { id = 22; name = "\u{09B8}\u{09CB}\u{09AF}\u{09BC}\u{09BE}\u{09AC}\u{09BF}\u{09A8} \u{09A4}\u{09C7}\u{09B2}";    category = "Household"; price = 130.0; unit = liter;  imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Sunflower_oil.jpg/440px-Sunflower_oil.jpg"; available = true },
      // Household - Saban (Soap)
      { id = 23; name = "\u{09B2}\u{09BE}\u{0987}\u{09AB}\u{09AC}\u{09AF}\u{09BC} \u{09B8}\u{09BE}\u{09AC}\u{09BE}\u{09A8}"; category = "Household"; price = 35.0; unit = pcs;   imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Soap-bar.jpg/440px-Soap-bar.jpg"; available = true },
      { id = 24; name = "\u{09A1}\u{09C7}\u{099F}\u{09CB}\u{09B2} \u{09B8}\u{09BE}\u{09AC}\u{09BE}\u{09A8}";    category = "Household"; price = 45.0; unit = pcs;   imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Soap-bar.jpg/440px-Soap-bar.jpg"; available = true },
      // Household - Shampoo
      { id = 25; name = "\u{09B6}\u{09CD}\u{09AF}\u{09BE}\u{09AE}\u{09CD}\u{09AA}\u{09C1}";          category = "Household"; price = 120.0; unit = bottle; imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Shampoo.jpg/440px-Shampoo.jpg"; available = true },
      { id = 26; name = "\u{09A1}\u{09CB}\u{09AD} \u{09B6}\u{09CD}\u{09AF}\u{09BE}\u{09AE}\u{09CD}\u{09AA}\u{09C1}";   category = "Household"; price = 90.0; unit = bottle; imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Shampoo.jpg/440px-Shampoo.jpg"; available = true },
      // Household - Body Lotion
      { id = 27; name = "\u{09A8}\u{09BF}\u{09AD}\u{09BF}\u{09AF}\u{09BC}\u{09BE} \u{09AC}\u{09A1}\u{09BF} \u{09B2}\u{09CB}\u{09B6}\u{09A8}"; category = "Household"; price = 180.0; unit = bottle; imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Shampoo.jpg/440px-Shampoo.jpg"; available = true },
    ];

    for (product in initialProducts.values()) {
      products.add(product.id, product);
    };
    nextProductId := 28;
  };

  // Delivery Settings
  public query func getDeliverySettings() : async DeliverySettings {
    deliverySettings;
  };

  public shared ({ caller }) func updateDeliverySettings(settings : DeliverySettings) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update delivery settings");
    };
    deliverySettings := settings;
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Admin bootstrap: first non-anonymous caller becomes admin
  public shared ({ caller }) func initializeAdmin() : async Bool {
    if (caller.isAnonymous()) { return false };
    if (not accessControlState.adminAssigned) {
      accessControlState.userRoles.add(caller, #admin);
      accessControlState.adminAssigned := true;
      return true;
    };
    AccessControl.isAdmin(accessControlState, caller);
  };

  // Product Management (Admin Only)
  public shared ({ caller }) func addProduct(
    name : Text,
    category : Text,
    price : Float,
    unit : Text,
    imageUrl : Text
  ) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };
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

  public shared ({ caller }) func updateProduct(
    id : Nat,
    name : Text,
    category : Text,
    price : Float,
    unit : Text,
    imageUrl : Text,
    available : Bool,
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };
    if (not products.containsKey(id)) {
      Runtime.trap("Product not found");
    };
    products.add(id, { id; name; category; price; unit; imageUrl; available });
  };

  public shared ({ caller }) func deleteProduct(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };
    if (not products.containsKey(id)) {
      Runtime.trap("Product not found");
    };
    products.remove(id);
  };

  // Product Queries (Public)
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
  public shared ({ caller }) func placeOrder(
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can place orders");
    };
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

  public query ({ caller }) func getOrdersByCustomer(customerPhone : Text) : async [Order] {
    switch (userProfiles.get(caller)) {
      case (?profile) {
        if (profile.phone != customerPhone and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own orders");
        };
      };
      case (null) {
        if (not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own orders");
        };
      };
    };
    orders.values().toArray().filter(func(o) { o.customerPhone == customerPhone });
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    orders.values().toArray();
  };

  public shared ({ caller }) func markDelivered(orderId : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can mark orders as delivered");
    };
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
      case (?order) {
        switch (userProfiles.get(caller)) {
          case (?profile) {
            if (profile.phone != order.customerPhone and not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Can only view your own orders");
            };
          };
          case (null) {
            if (not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Can only view your own orders");
            };
          };
        };
        order;
      };
      case (null) { Runtime.trap("Order not found") };
    };
  };
};
