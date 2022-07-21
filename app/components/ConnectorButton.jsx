import { useConnect } from "wagmi";
import { Button } from "@chakra-ui/react";

export default function ConnectorButton({ customText }) {
  const [{ data: connectData }, connect] = useConnect({ fetchEns: true });

  return connectData.connectors.map((connector) => (
    <Button
      colorScheme="teal"
      variant="solid"
      key={connector.id}
      onClick={() => connect(connector)}
    >
      {customText || "連接錢包"}
    </Button>
  ));
}
