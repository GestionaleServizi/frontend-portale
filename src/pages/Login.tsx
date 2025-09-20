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
  Text,
  Flex,
  InputGroup,
  InputRightElement,
  IconButton,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import logo from "/servizinet_logo.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const user = await login(email, password);

      // ✅ redirect in base al ruolo
      if (user.ruolo === "admin") {
        navigate("/dashboard");
      } else if (user.ruolo === "operatore") {
        navigate("/segnalazioni");
      } else {
        toast({ title: "Ruolo non autorizzato", status: "error" });
      }
    } catch {
      toast({ 
        title: "Credenziali non valide", 
        description: "Controlla email e password e riprova",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <Box 
      minH="100vh" 
      display="flex" 
      justifyContent="center" 
      alignItems="center" 
      bgGradient="linear(to-br, blue.50, gray.50)"
      p={4}
    >
      <Box 
        p={10} 
        bg="white" 
        shadow="2xl" 
        borderRadius="2xl" 
        w="100%"
        maxW="450px"
        borderWidth="1px"
        borderColor="gray.100"
      >
        <VStack spacing={6}>
          {/* Logo e Titolo */}
          <VStack spacing={3}>
            <Image 
              src={logo} 
              alt="Logo ServiziNet" 
              boxSize="120px" 
              objectFit="contain"
            />
            <Heading size="lg" color="blue.600" textAlign="center">
              Benvenuto in ServiziNet
            </Heading>
            <Text color="gray.600" textAlign="center" fontSize="sm">
              Accedi al portale per gestire segnalazioni e clienti
            </Text>
          </VStack>

          {/* Form di Login */}
          <VStack spacing={4} w="100%">
            <FormControl>
              <FormLabel color="gray.700" fontWeight="medium">Email</FormLabel>
              <Input
                type="email"
                placeholder="inserisci@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                size="lg"
                bg="white"
                borderColor="gray.300"
                _hover={{ borderColor: "blue.300" }}
                _focus={{
                  borderColor: "blue.400",
                  boxShadow: "0 0 0 1px blue.400",
                }}
              />
            </FormControl>

            <FormControl>
              <FormLabel color="gray.700" fontWeight="medium">Password</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Inserisci la tua password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  size="lg"
                  bg="white"
                  borderColor="gray.300"
                  _hover={{ borderColor: "blue.300" }}
                  _focus={{
                    borderColor: "blue.400",
                    boxShadow: "0 0 0 1px blue.400",
                  }}
                />
                <InputRightElement height="100%">
                  <IconButton
                    aria-label={showPassword ? "Nascondi password" : "Mostra password"}
                    icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                    variant="ghost"
                    onClick={() => setShowPassword(!showPassword)}
                    _hover={{ bg: "transparent" }}
                    _active={{ bg: "transparent" }}
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <Button 
              colorScheme="blue" 
              onClick={handleLogin} 
              w="100%" 
              size="lg"
              fontSize="md"
              fontWeight="semibold"
              isLoading={isLoading}
              loadingText="Accesso in corso..."
              mt={4}
              _hover={{
                transform: "translateY(-1px)",
                boxShadow: "lg",
              }}
              transition="all 0.2s"
            >
              Accedi
            </Button>
          </VStack>

          {/* Footer */}
          <Flex justify="center" pt={4}>
            <Text color="gray.500" fontSize="sm">
              © 2024 ServiziNet - Tutti i diritti riservati
            </Text>
          </Flex>
        </VStack>
      </Box>
    </Box>
  );
}
