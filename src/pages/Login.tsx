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
  InputGroup,
  InputLeftElement,
  Text,
  Divider,
  Link,
} from "@chakra-ui/react";
import { EmailIcon, LockIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import logo from "/servizinet_logo.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const toast = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();

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
      bgGradient="linear(to-br, blue.100, blue.300)"
    >
      <Box
        bg="white"
        p={10}
        borderRadius="2xl"
        shadow="2xl"
        w={{ base: "90vw", md: "400px" }}
        maxW="400px"
        borderWidth={2}
        borderColor="blue.200"
      >
        <VStack spacing={4}>
          <Image src={logo} alt="Logo" boxSize="120px" mb={2} />
          <Heading size="lg" color="blue.700">
            Accedi al Portale Staging
          </Heading>
          <Divider mb={2} />
          <FormControl>
            <FormLabel>Email</FormLabel>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <EmailIcon color="blue.400" />
              </InputLeftElement>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                focusBorderColor="blue.400"
              />
            </InputGroup>
          </FormControl>
          <FormControl>
            <FormLabel>Password</FormLabel>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <LockIcon color="blue.400" />
              </InputLeftElement>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                focusBorderColor="blue.400"
              />
            </InputGroup>
          </FormControl>
          <Button
            colorScheme="blue"
            onClick={handleLogin}
            w="full"
            mt={4}
            size="lg"
            borderRadius="md"
            shadow="sm"
          >
            Login
          </Button>
          <Divider />
          <Text color="gray.400" fontSize="xs">
            © 2025 ServiziNet
          </Text>
        </VStack>
      </Box>
    </Box>
  );
}
