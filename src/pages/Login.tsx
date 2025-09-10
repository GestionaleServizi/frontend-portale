import React, { useState } from "react";
import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  Button,
  Heading,
  Image,
  useToast,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png"; // 👈 Assicurati che il file logo sia in src/assets

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const nav = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
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

      // Salva token e user nel localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast({
        title: "Login effettuato",
        status: "success",
        duration: 2000,
        isClosable: true,
      });

      // Redirect in base al ruolo
      if (data.user.ruolo === "admin") {
        nav("/dashboard", { replace: true });
      } else if (data.user.ruolo === "operatore") {
        nav("/segnalazione", { replace: true });
      } else {
        nav("/login", { replace: true }); // fallback
      }
    } catch (err: any) {
      toast({
        title: "Errore login",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50">
      <Box
        bg="white"
        p={8}
        rounded="lg"
        shadow="lg"
        w={{ base: "90%", md: "400px" }}
        textAlign="center"
      >
        {/* Logo */}
        <Image src={logo} alt="ServiziNet" w="120px" mx="auto" mb={6} />

        <Heading mb={6} fontSize="xl">
          Accedi
        </Heading>

        <FormControl id="email" mb={4}>
          <FormLabel>Email</FormLabel>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormControl>

        <FormControl id="password" mb={6}>
          <FormLabel>Password</FormLabel>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormControl>

        <Button
          colorScheme="blue"
          w="full"
          onClick={handleLogin}
          isLoading={loading}
        >
          Accedi
        </Button>
      </Box>
    </Flex>
  );
}
