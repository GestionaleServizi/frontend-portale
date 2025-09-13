import React, { useState } from "react";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  useToast,
} from "@chakra-ui/react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const toast = useToast();
  const nav = useNavigate();

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
          nav("/");
        }
      } else {
        toast({ title: "Credenziali non valide", status: "error" });
      }
    } catch {
      toast({ title: "Errore di connessione", status: "error" });
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50">
      <Box p={8} maxW="400px" borderWidth={1} borderRadius={8} boxShadow="lg" bg="white">
        {/* 👇 Manteniamo logo e titolo */}
        <Heading mb={6} textAlign="center">
          🔐 Portale Segnalazioni
        </Heading>
        <form onSubmit={handleSubmit}>
          <FormControl mb={4}>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </FormControl>
          <FormControl mb={6}>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </FormControl>
          <Button type="submit" colorScheme="blue" w="full">
            Accedi
          </Button>
        </form>
      </Box>
    </Flex>
  );
}
