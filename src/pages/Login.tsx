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
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setUser, setToken } = useAuth();
  const toast = useToast();
  const nav = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

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

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("token", data.token);

      toast({
        title: "Login effettuato",
        status: "success",
      });

      // 👇 Redirect in base al ruolo
      if (data.user.ruolo === "admin") {
        nav("/dashboard");
      } else if (data.user.ruolo === "cliente") {
        nav("/segnalazioni-operatore");
      } else {
        toast({
          title: "Ruolo non riconosciuto",
          status: "error",
        });
      }
    } catch (err: any) {
      toast({
        title: "Errore login",
        description: err.message,
        status: "error",
      });
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50">
      <Box bg="white" p={8} rounded="md" shadow="md" w="400px">
        <Heading mb={6}>Login</Heading>
        <form onSubmit={handleLogin}>
          <FormControl mb={4}>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </FormControl>
          <Button type="submit" colorScheme="blue" w="full">
            Login
          </Button>
        </form>
      </Box>
    </Flex>
  );
}
