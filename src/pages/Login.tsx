import React, { useState } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Stack,
  Image,
  useToast,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        toast({
          title: "Login effettuato",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        // 🔹 Redirect in base al ruolo
        if (data.user.ruolo === "admin") {
          navigate("/dashboard");
        } else if (data.user.ruolo === "cliente") {
          navigate("/segnalazione-operatore");
        } else {
          navigate("/"); // fallback
        }
      } else {
        toast({
          title: "Errore login",
          description: data.error || "Credenziali non valide",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Errore server",
        description: "Impossibile connettersi al server",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg="gray.50"
      direction="column"
    >
      <Box mb={6}>
        <Image src="/servizinet_logo.png" alt="ServiziNet Logo" boxSize="120px" />
      </Box>
      <Box
        bg="white"
        p={8}
        rounded="lg"
        shadow="lg"
        w="full"
        maxW="md"
      >
        <Heading mb={6} textAlign="center">
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
            <Button type="submit" colorScheme="blue" size="lg" w="full">
              Accedi
            </Button>
          </Stack>
        </form>
      </Box>
    </Flex>
  );
}
