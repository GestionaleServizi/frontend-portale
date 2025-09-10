import { Box, Heading, Text, Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export default function ErrorPage() {
  const navigate = useNavigate();
  return (
    <Box textAlign="center" mt={20}>
      <Heading size="lg" color="red.500">
        ⚠️ Errore di applicazione
      </Heading>
      <Text mt={4}>Qualcosa è andato storto. Riprova più tardi.</Text>
      <Button mt={6} colorScheme="blue" onClick={() => navigate("/")}>
        Torna alla Home
      </Button>
    </Box>
  );
}
