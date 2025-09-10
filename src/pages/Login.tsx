import React, { useState } from "react";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Heading,
  Image,
  useToast,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { login } from "../api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const nav = useNavigate();
  const toast = useToast();

  // 👉 Adatta dimensioni in base al dispositivo
  const logoSize = useBreakpointValue({ base: "70px", md: "120px" });
  const boxPadding = useBreakpointValue({ base: 6, md: 8 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { token, user } = await login(email, password);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.ruolo === "admin") {
        nav("/dashboard");
      } else {
        nav("/segnalazione");
      }
    } catch (err: any) {
      toast({
        title: "Errore login",
        description: "Credenziali non valide",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50" px={4}>
      <Box
        w="full"
        maxW="md"
        p={boxPadding}
        borderWidth={1}
        borderRadius="lg"
        bg="white"
        shadow="lg"
      >
        <Flex justify="center" mb={4}>
          <Image
            src="/servizinet_logo.jpg" // 👉 deve stare in /public
            alt="ServiziNet Logo"
            boxSize={logoSize}
          />
        </Flex>
        <Heading size="lg" textAlign="center" mb={2}>
          SERVIZI.NET
        </Heading>
        <Heading size="sm" textAlign="center" color="gray.500" mb={6}>
          Portale Segnalazioni Sale
        </Heading>

        <form onSubmit={handleSubmit}>
          <Stack spacing={4}>
            <FormControl id="email" isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Inserisci la tua email"
                size={useBreakpointValue({ base: "sm", md: "md" })}
              />
            </FormControl>
            <FormControl id="password" isRequired>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Inserisci la password"
                size={useBreakpointValue({ base: "sm", md: "md" })}
              />
            </FormControl>
            <Button
              type="submit"
              colorScheme="blue"
              w="full"
              size={useBreakpointValue({ base: "sm", md: "md" })}
            >
              Accedi
            </Button>
          </Stack>
        </form>
      </Box>
    </Flex>
  );
}
