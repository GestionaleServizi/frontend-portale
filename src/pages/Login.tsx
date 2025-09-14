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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error("Credenziali non valide");
      }

      const data = await res.json();

      // ✅ salva token e user nel localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // ✅ redirect in base al ruolo
      if (data.user.ruolo === "admin") {
        navigate("/dashboard");
      } else if (data.user.ruolo === "operatore") {
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
