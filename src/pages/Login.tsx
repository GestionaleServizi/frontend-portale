// src/pages/Login.tsx
import React, { useState } from "react";
import {
  Box,
  Button,
  Input,
  Heading,
  VStack,
  useToast,
  Image,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import logo from "/servizinet_logo.png"; // ✅ mantieni logo

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const user = await login(email, password);

      if (user?.ruolo === "admin") {
        navigate("/dashboard");
      } else if (user?.ruolo === "operatore") {
        navigate("/segnalazioni");
      } else {
        toast({ title: "Ruolo non autorizzato", status: "error" });
      }
    } catch {
      toast({ title: "Credenziali non valide", status: "error" });
    }
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      bg="gray.50"
    >
      <VStack spacing={6} p={10} bg="white" shadow="xl" borderRadius="lg" w="400px">
        <Image src={logo} alt="Logo" boxSize="120px" />
        <Heading size="lg">Accedi al Portale</Heading>

        <FormControl>
          <FormLabel>Email</FormLabel>
          <Input
            type="email"
            placeholder="Inserisci la tua email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Password</FormLabel>
          <Input
            type="password"
            placeholder="Inserisci la tua password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormControl>

        <Button colorScheme="blue" onClick={handleLogin} w="full" mt={4}>
          Login
        </Button>
      </VStack>
    </Box>
  );
}
