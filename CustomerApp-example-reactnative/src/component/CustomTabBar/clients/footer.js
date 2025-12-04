const client = process.env.CLIENT;

const footer = {
  almadina: [
    {
      id: 0,
      color: "#34B067",
      backgroundColor: "#FFF",
      itemName: "home",
      navigateTo: "Home",
      activeIcon: require(
        `../../../assets/images/client/almadina/home-2.png`
      ),
      inActiveIcon: require(
        `../../../assets/images/client/almadina/home-2-1.png`
      ),
    },
    {
      id: 1,
      color: "#34B067",
      backgroundColor: "#FFF",
      itemName: "category",
      navigateTo: "Category",
      activeIcon: require(
        `../../../assets/images/client/almadina/category.png`
      ),
      inActiveIcon: require(
        `../../../assets/images/client/almadina/category-1.png`
      ),
    },
    {
      id: 2,
      color: "#34B067",
      backgroundColor: "#FFF",
      itemName: "cart",
      navigateTo: "Cart",
      activeIcon: require(
        `../../../assets/images/client/almadina/shop.png`
      ),
      inActiveIcon: require(
        `../../../assets/images/client/almadina/shop-1.png`
      ),
    },
    {
      id: 3,
      color: "#34B067",
      backgroundColor: "#FFF",
      itemName: "offers",
      navigateTo: "Offers",
      activeIcon: require(
        `../../../assets/images/client/almadina/offers.png`
      ),
      inActiveIcon: require(
        `../../../assets/images/client/almadina/offers-1.png`
      ),
    },
    {
      id: 4,
      color: "#34B067",
      backgroundColor: "#FFF",
      itemName: "more",
      navigateTo: "Drawer",
      activeIcon: require(
        `../../../assets/images/client/almadina/menu.png`
      ),
      inActiveIcon: require(
        `../../../assets/images/client/almadina/menu.png`
      ),
    },
  ],
   almadinadot: [
    {
      id: 0,
      color: "#FFFFFF",
      unFocusedColor: "#FFFFFF",
      backgroundColor: "#12a14f",
      itemName: "home",
      navigateTo: "Home",
      activeIcon: require(
        `../../../assets/images/client/almadinadot/home-2.png`
      ),
      inActiveIcon: require(
        `../../../assets/images/client/almadinadot/home-2.png`
      ),
    },
    {
      id: 1,
      color: "#FFFFFF",
      unFocusedColor: "#FFFFFF",
      backgroundColor: "#12a14f",
      itemName: "category",
      navigateTo: "Category",
      activeIcon: require(
        `../../../assets/images/client/almadinadot/category.png`
      ),
      inActiveIcon: require(
        `../../../assets/images/client/almadinadot/category.png`
      ),
    },
    {
      id: 2,
      color: "#FFFFFF",
      unFocusedColor: "#FFFFFF",
      backgroundColor: "#12a14f",
      itemName: "cart",
      navigateTo: "Cart",
      activeIcon: require(
        `../../../assets/images/client/almadinadot/shop.png`
      ),
      inActiveIcon: require(
        `../../../assets/images/client/almadinadot/shop.png`
      ),
    },
    {
      id: 3,
      color: "#FFFFFF",
      unFocusedColor: "#FFFFFF",
      backgroundColor: "#12a14f",
      itemName: "brands",
      navigateTo: "Brands",
      activeIcon: require(
        `../../../assets/images/client/almadinadot/brand.png`
      ),
      inActiveIcon: require(
        `../../../assets/images/client/almadinadot/brand.png`
      ),
    },
    {
      id: 4,
      color: "#FFFFFF",
      unFocusedColor: "#FFFFFF",
      backgroundColor: "#12a14f",
      itemName: "my_account",
      navigateTo: "Drawer",
      activeIcon: require(
        `../../../assets/images/client/almadinadot/user-square-1.png`
      ),
      inActiveIcon: require(
        `../../../assets/images/client/almadinadot/user-square-1.png`
      ),
    },
  ],
  foodworld: [
    {
      id: 0,
      color: "#68B054",
      backgroundColor: "#68B054",
      itemName: "home",
      navigateTo: "Home",
      activeIcon: require(`../../../assets/images/client/foodworld/home-2.png`),
      inActiveIcon: require("../../../assets/images/client/foodworld/home-2-1.png"),
    },
    {
      id: 1,
      color: "#68B054",
      backgroundColor: "#68B054",
      itemName: "wishlist",
      navigateTo: "Wishlist",
      activeIcon: require("../../../assets/images/client/foodworld/percentage-square.png"),
      inActiveIcon: require("../../../assets/images/client/foodworld/percentage-square-1.png"),
    },
    {
      id: 2,
      color: "#68B054",
      backgroundColor: "#68B054",
      itemName: "categories",
      navigateTo: "Category",
      activeIcon: require("../../../assets/images/client/foodworld/category-2.png"),
      inActiveIcon: require("../../../assets/images/client/foodworld/category-2-1.png"),
    },
    {
      id: 3,
      color: "#68B054",
      backgroundColor: "#68B054",
      itemName: "cart",
      navigateTo: "Cart",
      activeIcon: require("../../../assets/images/client/foodworld/shop.png"),
      inActiveIcon: require("../../../assets/images/client/foodworld/shop-1.png"),
    },
    {
      id: 4,
      color: "#68B054",
      backgroundColor: "#68B054",
      itemName: "myAccount",
      navigateTo: "Account",
      activeIcon: require("../../../assets/images/client/foodworld/user-square-1.png"),
      inActiveIcon: require("../../../assets/images/client/foodworld/user-square.png"),
    },
  ],
  benchmarkfoods: [
    {
      id: 0,
      color: "#1D9ADC",
      backgroundColor: "#FFF",
      itemName: "home",
      navigateTo: "Home",
      activeIcon: require(
        `../../../assets/images/client/benchmarkfoods/home-2.png`
      ),
      inActiveIcon: require(
        `../../../assets/images/client/benchmarkfoods/home-2-1.png`
      ),
    },
    {
      id: 1,
      color: "#1D9ADC",
      backgroundColor: "#FFF",
      itemName: "orders",
      navigateTo: "Order",
      activeIcon: require(
        `../../../assets/images/client/benchmarkfoods/order-2.png`
      ),
      inActiveIcon: require(
        `../../../assets/images/client/benchmarkfoods/order.png`
      ),
    },
    {
      id: 2,
      color: "#1D9ADC",
      backgroundColor: "#FFF",
      itemName: "cart",
      navigateTo: "Cart",
      activeIcon: require(
        `../../../assets/images/client/benchmarkfoods/shop.png`
      ),
      inActiveIcon: require(
        `../../../assets/images/client/benchmarkfoods/shop-1.png`
      ),
    },
    {
      id: 3,
      color: "#1D9ADC",
      backgroundColor: "#FFF",
      itemName: "wishlist",
      navigateTo: "Wishlist",
      activeIcon: require(
        `../../../assets/images/client/benchmarkfoods/percentage-square.png`
      ),
      inActiveIcon: require(
        `../../../assets/images/client/benchmarkfoods/percentage-square-1.png`
      ),
    },
    {
      id: 4,
      color: "#1D9ADC",
      backgroundColor: "#FFF",
      itemName: "my_account",
      navigateTo: "Account",
      activeIcon: require(
        `../../../assets/images/client/benchmarkfoods/user-square-1.png`
      ),
      inActiveIcon: require(
        `../../../assets/images/client/benchmarkfoods/user-square.png`
      ),
    },
  ],
   comtone: [
    {
      id: 0,
      color: "#68B054",
      backgroundColor: "#68B054",
      itemName: "home",
      navigateTo: "Home",
      activeIcon: require(`../../../assets/images/client/comtone/home-2.png`),
      inActiveIcon: require("../../../assets/images/client/comtone/home-2-1.png"),
    },
    {
      id: 1,
      color: "#68B054",
      backgroundColor: "#68B054",
      itemName: "Promotions",
      navigateTo: "Wishlist",
      activeIcon: require("../../../assets/images/client/comtone/percentage-square.png"),
      inActiveIcon: require("../../../assets/images/client/comtone/percentage-square-1.png"),
    },
    {
      id: 2,
      color: "#68B054",
      backgroundColor: "#68B054",
      itemName: "categories",
      navigateTo: "Category",
      activeIcon: require("../../../assets/images/client/comtone/category-2.png"),
      inActiveIcon: require("../../../assets/images/client/comtone/category-2-1.png"),
    },
    {
      id: 3,
      color: "#68B054",
      backgroundColor: "#68B054",
      itemName: "cart",
      navigateTo: "Cart",
      activeIcon: require("../../../assets/images/client/comtone/shop.png"),
      inActiveIcon: require("../../../assets/images/client/comtone/shop-1.png"),
    },
    {
      id: 4,
      color: "#68B054",
      backgroundColor: "#68B054",
      itemName: "myAccount",
      navigateTo: "Account",
      activeIcon: require("../../../assets/images/client/comtone/user-square-1.png"),
      inActiveIcon: require("../../../assets/images/client/comtone/user-square.png"),
    },
  ],
};

export default footer;
