// src/pages/Login.tsx
import React, { useState } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Stack,
  useToast,
  Image,
} from "@chakra-ui/react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const nav = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        login(data.token, data.user);

        // 👇 Redirect in base al ruolo
        if (data.user.ruolo === "admin") {
          nav("/dashboard");
        } else if (data.user.ruolo === "operatore") {
          nav("/segnalazioni-operatore");
        } else {
          toast({ title: "Ruolo non riconosciuto", status: "error" });
        }
      } else {
        toast({ title: "Credenziali non valide", status: "error" });
      }
    } catch (err) {
      console.error("Errore login:", err);
      toast({ title: "Errore login", description: String(err), status: "error" });
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50">
      <Box
        p={10} // 👈 lascio come l’avevi tu (non lo stringo)
        maxW="500px" // 👈 mantengo la larghezza originale
        borderWidth={1}
        borderRadius="lg"
        bg="white"
        boxShadow="lg"
        w="100%"
      >
        {/* 👇 logo grande come lo avevi */}
        <Flex justify="center" mb={6}>
          <Image src="/servizinet_logo.png" alt="Logo" boxSize="120px" />
        </Flex>

        <Heading mb={6} textAlign="center" size="lg">
          Accedi
        </Heading>

        <form onSubmit={handleSubmit}>
          <Stack spacing={4}>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" colorScheme="blue" w="full">
              Accedi
            </Button>
          </Stack>
        </form>
      </Box>
    </Flex>
  );
}
