import React, { useState } from "react";
import {
  Box,
  Button,
  Input,
  Heading,
  VStack,
  useToast,
  Image,
} from "@chakra-ui/react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import logo from "/servizinet_logo.png"; // 👈 mantieni il logo esistente

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const user = await login(email, password);
      if (user.ruolo === "admin") {
        navigate("/dashboard");
      } else if (user.ruolo === "operatore") {
        navigate("/segnalazioni");
      } else {
        toast({ title: "Ruolo non autorizzato", status: "error" });
      }
    } catch (err) {
      toast({ title: "Credenziali non valide", status: "error" });
    }
  };

  return (
    <Box minH="100vh" display="flex" justifyContent="center" alignItems="center" bg="gray.50">
      <VStack spacing={6} p={8} bg="white" shadow="md" borderRadius="md">
        <Image src={logo} alt="Logo" boxSize="100px" />
        <Heading size="md">Accedi al Portale</Heading>
        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button colorScheme="blue" onClick={handleLogin} w="full">
          Login
        </Button>
      </VStack>
    </Box>
  );
}
