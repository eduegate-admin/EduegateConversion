const client = process.env.CLIENT;
const defaultContent = [
  {
    itemId: 0,
    Name: "my_profile",
    navigateTo: "Profile",
    icon: require(`../../../assets/images/client/${client}/profile.png`),
  },
  {
    itemId: 1,
    Name: "my_orders",
    navigateTo: "Order",
    icon: require(`../../../assets/images/client/${client}/order.png`),
  },
  {
    itemId: 2,
    Name: "notifications",
    navigateTo: "HomeScreen",
    icon: require(`../../../assets/images/client/${client}/notification.png`),
  },
  {
    itemId: 3,
    Name: "wishlist",
    navigateTo: "Wishlist",
    icon: require(`../../../assets/images/client/${client}/wishlist.png`),
  },
  {
    itemId: 5,
    Name: "address",
    navigateTo: "HomeScreen",
    icon: require(`../../../assets/images/client/${client}/location.png`),
  },
  {
    itemId: 8,
    Name: "language",
    navigateTo: "LanguageSettings",
    icon: require(`../../../assets/images/client/${client}/language.png`),
  },
  {
    itemId: 9,
    Name: "privacy_policy",
    navigateTo: "HomeScreen",
    icon: require(`../../../assets/images/client/${client}/security.png`),
  },
  {
    itemId: 10,
    Name: "terms_and_conditions",
    navigateTo: "HomeScreen",
    icon: require(
      `../../../assets/images/client/${client}/terms&condition.png`
    ),
  },
  {
    itemId: 11,
    Name: "help_and_support",
    navigateTo: "HomeScreen",
    icon: require(`../../../assets/images/client/${client}/help&support.png`),
  },
];

const content = {
  almadina: [...defaultContent],
  almadinadot: [...defaultContent],
  foodworld: [
    {
      itemId: 0,
      Name: "my_profile",
      navigateTo: "Profile",
      icon: require(`../../../assets/images/client/${client}/profile.png`),
    },
    {
      itemId: 1,
      Name: "my_orders",
      navigateTo: "Order",
      icon: require(`../../../assets/images/client/${client}/order.png`),
    },
    {
      itemId: 2,
      Name: "notifications",
      navigateTo: "HomeScreen",
      icon: require(`../../../assets/images/client/${client}/notification.png`),
    },
    {
      itemId: 3,
      Name: "wishlist",
      navigateTo: "Wishlist",
      icon: require(`../../../assets/images/client/${client}/wishlist.png`),
    },
    {
      itemId: 4,
      Name: "coupon",
      navigateTo: "HomeScreen",
      icon: require(`../../../assets/images/client/${client}/offers.png`),
    },
    {
      itemId: 5,
      Name: "address",
      navigateTo: "HomeScreen",
      icon: require(`../../../assets/images/client/${client}/location.png`),
    },
    {
      itemId: 6,
      Name: "message",
      navigateTo: "HomeScreen",
      icon: require(`../../../assets/images/client/${client}/message.png`),
    },
    {
      itemId: 7,
      Name: "wallet",
      navigateTo: "HomeScreen",
      icon: require(`../../../assets/images/client/${client}/wallet.png`),
    },
    {
      itemId: 8,
      Name: "language",
      navigateTo: "LanguageSettings",
      icon: require(`../../../assets/images/client/${client}/language.png`),
    },
    {
      itemId: 9,
      Name: "privacy_policy",
      navigateTo: "HomeScreen",
      icon: require(`../../../assets/images/client/${client}/security.png`),
    },
    {
      itemId: 10,
      Name: "terms_and_conditions",
      navigateTo: "HomeScreen",
      icon: require(
        `../../../assets/images/client/${client}/terms&condition.png`
      ),
    },
    {
      itemId: 11,
      Name: "help_and_support",
      navigateTo: "HomeScreen",
      icon: require(`../../../assets/images/client/${client}/help&support.png`),
    },
  ],
  benchmarkfoods: [
    {
      itemId: 0,
      Name: "my_profile",
      navigateTo: "Profile",
    },
    // {
    //   itemId: 1,
    //   Name: 'Account Settings',
    //   navigateTo: "AccountSettings",
    // },
    {
      itemId: 1,
      Name: "about_us",
      navigateTo: "AboutUs",
    },
    {
      itemId: 2,
      Name: "faqs",
      navigateTo: "FAQs",
    },
    {
      itemId: 3,
      Name: "contact_us",
      navigateTo: "ContactUs",
    },
    // {
    //   itemId: 8,
    //   Name: "language",
    //   navigateTo: "LanguageSettings",
    // },
    {
      itemId: 4,
      Name: "delete_account",
      navigateTo: "DeleteAccount",
    },
  ],
};

export default content;
