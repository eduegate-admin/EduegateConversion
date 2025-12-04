const styles = {
  almadina: require("../Clients/almadina").default,
  almadinadot: require("../Clients/almadinadot").default,
  foodworld: require("../Clients/foodworld").default,
  benchmarkfoods: require("../Clients/benchmarkfoods").default,
  comtone: require("../Clients/comtone").default,
};

const ClientStyles = (client, screen) => {
  const clientStyles = styles[client];
  if (clientStyles && clientStyles[screen]) {
    return clientStyles[screen];
  } else {
    console.warn(
      `Styles for client: "${client}" or screen: "${screen}" not found.`
    );
    return {};
  }
};

export default ClientStyles;
