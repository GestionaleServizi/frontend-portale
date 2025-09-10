import { Box, Heading, Text, Button, VStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export default function ErrorPage() {
  const navigate = useNavigate();

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50" px={4}>
      <Box
        w="full"
        maxW="md"
        p={8}
        borderWidth={1}
        borderRadius="lg"
        bg="white"
        shadow="lg"
        textAlign="center"
      >
        <VStack spacing={4}>
          <Heading size="lg" color="red.500">
            ⚠️ Errore di applicazione
          </Heading>
          <Text color="gray.600">
            Qualcosa è andato storto durante il caricamento della pagina.
          </Text>
          <Button colorScheme="blue" onClick={() => navigate("/")}>
            Torna alla Home
          </Button>
        </VStack>
      </Box>
    </Flex>
  );
}
