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
  useBreakpointValue,
} from "@chakra-ui/react";
import { useToast } from "@chakra-ui/toast"; // 🔧 compatibile anche con Chakra v2
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
